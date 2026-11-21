#!/usr/bin/env node
/**
 * Генератор документации сайта ngx-video.
 *
 * Берёт README пакетов и кирпичей (`projects/**\/README.md` и `README.en.md`),
 * рендерит Markdown в HTML на этапе сборки и раскладывает JSON-ассеты в
 * `apps/demo/public/docs-content/<локаль>/...`. В браузер парсер Markdown не
 * попадает — приложение читает уже готовый HTML.
 *
 * Что делает генератор:
 *   - переписывает относительные и GitHub-ссылки на `/<локаль>/docs/...`;
 *   - проставляет заголовкам якоря (id) и проверяет, что ссылки на якоря живут;
 *   - экранирует сырой HTML из Markdown (контент доверенный, но innerHTML в
 *     приложении осознанный — лишняя страховка не мешает);
 *   - при отсутствии `README.en.md` отдаёт русскую страницу с пометкой
 *     `fallback: true` (ссылки внутри ведут на английскую локаль);
 *   - валидирует все внутренние ссылки и якоря и падает, если что-то сломано.
 *
 * Запуск: `node tools/docs/generate.mjs` (или `npm run docs:generate`).
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Marked } from 'marked';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
const PROJECTS_DIR = path.join(ROOT, 'projects');
const OUTPUT_DIR = path.join(ROOT, 'apps', 'demo', 'public', 'docs-content');

/** Локали сайта. Должны совпадать с `SUPPORTED_LOCALES` в приложении. */
const LOCALES = ['ru', 'en'];

/** Порядок пакетов в навигации — как в roadmap. */
const PACKAGE_ORDER = [
  'core',
  'controls',
  'timeline',
  'extras',
  'sources',
  'capture',
];

/** Репозиторий, на который ведут ссылки из README. */
const GITHUB_REPO = 'erstdev/ngx_erst_dev_video';
const GITHUB_BRANCH = 'master';

/** Карта «путь README в репозитории → маршрут документации». */
const docsMap = new Map();

main().catch((error) => {
  console.error('\n✖ Генерация документации не удалась.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  const generatedAt = new Date().toISOString();
  const packages = await collectSources();
  const pages = await buildPages(packages);
  const internalLinks = validatePages(pages);

  await writeAssets(packages, pages, generatedAt);

  const translations = pages.filter(
    (page) => page.locale === 'en' && !page.fallback,
  ).length;
  const fallbacks = pages.filter((page) => page.fallback).length;
  const warnings = pages.flatMap((page) =>
    page.warnings.map((warning) => `${page.locale}/${page.route}: ${warning}`),
  );

  console.log(
    `\n✔ Документация собрана: ${pages.length} страниц (${LOCALES.join(', ')}).`,
  );
  console.log(
    `  Переведено на английский: ${translations} из ${pages.length / LOCALES.length}.`,
  );
  console.log(`  Фолбэк на русский: ${fallbacks}.`);
  console.log(`  Внутренних ссылок проверено: ${internalLinks}.`);
  if (warnings.length) {
    console.log('\n⚠ Предупреждения:');
    for (const warning of warnings) console.log(`  - ${warning}`);
  }
  console.log(`  Ассеты: ${path.relative(ROOT, OUTPUT_DIR)}/`);
}

/**
 * Собирает пакеты и кирпичи из файловой системы.
 * Пакет — `projects/<pkg>/README.md`, кирпич — любой `README.md` под
 * `projects/<pkg>/src/lib/**`. Имя каталога README становится id кирпича.
 */
async function collectSources() {
  if (!existsSync(PROJECTS_DIR)) {
    throw new Error(`Не найден каталог проектов: ${PROJECTS_DIR}`);
  }

  const order = new Map(PACKAGE_ORDER.map((id, index) => [id, index]));
  const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
  const packageIds = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((id) => existsSync(path.join(PROJECTS_DIR, id, 'README.md')))
    .sort(
      (a, b) =>
        (order.get(a) ?? 99) - (order.get(b) ?? 99) || a.localeCompare(b),
    );

  const packages = [];

  for (const id of packageIds) {
    const sourcePath = path.join(PROJECTS_DIR, id, 'README.md');
    const source = toPosix(path.relative(ROOT, sourcePath));
    const route = `docs/${id}`;
    registerReadme(source, route);

    const npmName = await readPackageName(id);
    const bricks = [];

    const libDir = path.join(PROJECTS_DIR, id, 'src', 'lib');
    if (existsSync(libDir)) {
      for (const readmePath of await collectReadmes(libDir)) {
        const brick = path.basename(path.dirname(readmePath));
        const brickSource = toPosix(path.relative(ROOT, readmePath));
        const brickRoute = `${route}/${brick}`;

        if (docsMap.has(brickSource)) {
          throw new Error(`Дублирующийся README: ${brickSource}`);
        }

        registerReadme(brickSource, brickRoute);
        bricks.push({ id: brick, source: brickSource, route: brickRoute });
      }
    }

    bricks.sort((a, b) => a.id.localeCompare(b.id));
    packages.push({
      id,
      title: capitalize(id),
      npmName,
      source,
      route,
      bricks,
    });
  }

  if (!packages.length) {
    throw new Error('Не найдено ни одного пакета с README.md');
  }

  return packages;
}

/** Регистрирует русский README и его английскую пару как один маршрут. */
function registerReadme(source, route) {
  docsMap.set(source, route);
  docsMap.set(source.replace(/README\.md$/, 'README.en.md'), route);
}

/** Рекурсивно находит только русские README (английские — производные). */
async function collectReadmes(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectReadmes(fullPath)));
    } else if (entry.isFile() && entry.name === 'README.md') {
      files.push(fullPath);
    }
  }

  return files;
}

async function readPackageName(id) {
  const manifestPath = path.join(PROJECTS_DIR, id, 'package.json');
  if (!existsSync(manifestPath)) return id;

  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    return typeof manifest.name === 'string' ? manifest.name : id;
  } catch {
    return id;
  }
}

/** Рендерит все страницы обеих локалей. */
async function buildPages(packages) {
  const pages = [];

  for (const pkg of packages) {
    for (const locale of LOCALES) {
      pages.push(
        await buildPage({
          locale,
          pkg: pkg.id,
          brick: null,
          source: pkg.source,
          route: pkg.route,
        }),
      );

      for (const brick of pkg.bricks) {
        pages.push(
          await buildPage({
            locale,
            pkg: pkg.id,
            brick: brick.id,
            source: brick.source,
            route: brick.route,
          }),
        );
      }
    }
  }

  return pages;
}

async function buildPage({ locale, pkg, brick, source, route }) {
  const englishSource = source.replace(/README\.md$/, 'README.en.md');
  let sourcePath = source;
  let fallback = false;

  if (locale === 'en') {
    if (existsSync(path.join(ROOT, englishSource))) {
      sourcePath = englishSource;
    } else {
      fallback = true;
    }
  }

  const markdown = await readFile(path.join(ROOT, sourcePath), 'utf8');
  const context = {
    locale,
    sourcePath,
    ids: new Set(),
    headings: [],
    warnings: [],
  };
  const html = renderMarkdown(markdown, context);
  const title =
    context.headings.find((heading) => heading.level === 1)?.text ??
    brick ??
    pkg;

  return {
    locale,
    pkg,
    brick,
    route,
    title,
    file: brick ? `${pkg}/${brick}.json` : `${pkg}.json`,
    source: sourcePath,
    sourceLocale: fallback ? 'ru' : locale,
    fallback,
    html,
    headings: context.headings,
    ids: context.ids,
    warnings: context.warnings,
  };
}

function renderMarkdown(markdown, context) {
  const marked = new Marked({ gfm: true });
  marked.use({ renderer: createRenderer(context) });
  return marked.parse(markdown);
}

function createRenderer(context) {
  return {
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens);
      const text = plainText(inner);
      const id = uniqueId(text, context);
      context.headings.push({ id, text, level: depth });
      return `<h${depth} id="${escapeAttribute(id)}">${inner}</h${depth}>\n`;
    },

    link({ href, title, text }) {
      const target = rewriteHref(href, context);
      const attributes = [
        `href="${escapeAttribute(target.href)}"`,
        title ? `title="${escapeAttribute(title)}"` : '',
        target.external ? 'target="_blank" rel="noopener noreferrer"' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return `<a ${attributes}>${text}</a>`;
    },

    image({ href, title, text }) {
      const src = resolveImage(href, context);
      if (!src) return escapeHtml(text);

      const attributes = [
        `src="${escapeAttribute(src)}"`,
        `alt="${escapeAttribute(text)}"`,
        title ? `title="${escapeAttribute(title)}"` : '',
      ]
        .filter(Boolean)
        .join(' ');

      return `<img ${attributes}>`;
    },

    // Сырой HTML из README не исполняем: показываем его текстом. Это дешевле,
    // чем тащить в сборку полноценный санитайзер, и закрывает `<script>`.
    html({ text }) {
      return escapeHtml(text);
    },
  };
}

/**
 * Переписывает ссылку на внутреннюю страницу документации.
 * Внешние ссылки остаются как есть, но помечаются `external`.
 */
function rewriteHref(rawHref, context) {
  const href = String(rawHref ?? '').trim();

  if (!href) return { href: '', external: false };
  if (href.startsWith('#')) return { href, external: false };
  if (/^(mailto:|tel:)/i.test(href)) return { href, external: false };

  if (/^https?:\/\//i.test(href)) {
    const internal = githubUrlToRoute(href, context.locale);
    if (internal) return { href: internal, external: false };
    return { href, external: true };
  }

  if (href.startsWith('//')) {
    return { href: `https:${href}`, external: true };
  }

  if (href.startsWith('/')) {
    return { href, external: false };
  }

  const [beforeHash, hash = ''] = splitOnce(href, '#');
  const pathPart = beforeHash.split('?')[0];

  if (!pathPart) return { href, external: false };

  const resolved = resolveRepoPath(context.sourcePath, pathPart);
  const route = docsMap.get(resolved);

  if (route) {
    return {
      href: `/${context.locale}/${route}${hash ? `#${hash}` : ''}`,
      external: false,
    };
  }

  context.warnings.push(
    `относительная ссылка "${href}" не ведёт на README — открывается на GitHub`,
  );

  return {
    href: `${githubBlobUrl(resolved)}${hash ? `#${hash}` : ''}`,
    external: true,
  };
}

/** GitHub-ссылка на README превращается во внутренний маршрут `/docs/...`. */
function githubUrlToRoute(href, locale) {
  const match = href.match(
    /^https?:\/\/github\.com\/[^/]+\/[^/]+\/(?:blob|tree)\/[^/]+\/([^?#]+)(?:\?[^#]*)?(#.*)?$/i,
  );

  if (!match) return null;

  const repoPath = safeDecode(match[1]);
  const route = docsMap.get(repoPath);

  return route ? `/${locale}/${route}${match[2] ?? ''}` : null;
}

function resolveImage(href, context) {
  const src = String(href ?? '').trim();

  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('//')) return `https:${src}`;
  if (/^data:/i.test(src)) {
    context.warnings.push('data: image пропущен');
    return null;
  }
  if (!src || src.startsWith('#')) return null;

  const resolved = resolveRepoPath(context.sourcePath, src.split('?')[0]);
  context.warnings.push(`относительная картинка "${src}" открывается с GitHub`);

  return `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${resolved}`;
}

function resolveRepoPath(sourcePath, relativePath) {
  const resolved = path.posix.normalize(
    path.posix.join(path.posix.dirname(sourcePath), relativePath),
  );

  return resolved.replace(/^\.\//, '');
}

function githubBlobUrl(repoPath) {
  return `https://github.com/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${repoPath}`;
}

function uniqueId(text, context) {
  const slug = slugify(text) || 'section';
  let id = slug;
  let counter = 1;

  while (context.ids.has(id)) {
    id = `${slug}-${counter}`;
    counter += 1;
  }

  context.ids.add(id);
  return id;
}

/**
 * Повторяет алгоритм GitHub: нижний регистр, пунктуация удаляется,
 * пробелы становятся дефисами, повторы получают суффикс `-1`, `-2`.
 */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function plainText(html) {
  return decodeHtml(html.replace(/<[^>]*>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtml(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function splitOnce(value, separator) {
  const index = value.indexOf(separator);
  return index === -1
    ? [value, '']
    : [value.slice(0, index), value.slice(index + separator.length)];
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

/**
 * Проверяет, что каждая внутренняя ссылка ведёт на существующую страницу,
 * а каждый якорь существует в целевой странице.
 */
function validatePages(pages) {
  const byKey = new Map(
    pages.map((page) => [`${page.locale}/${page.route}`, page]),
  );
  const errors = [];
  let checked = 0;

  for (const page of pages) {
    const linkPattern = /<a\s[^>]*href="([^"]*)"/g;
    let match;

    while ((match = linkPattern.exec(page.html))) {
      const href = decodeHtml(match[1]);

      if (href.startsWith('#')) {
        checked += 1;
        checkAnchor(page, href.slice(1), page, errors);
        continue;
      }

      if (!href.startsWith(`/${page.locale}/`)) continue;

      checked += 1;
      const [route, hash = ''] = splitOnce(
        href.slice(page.locale.length + 2),
        '#',
      );
      const target = byKey.get(`${page.locale}/${route}`);

      if (!target) {
        errors.push(
          `${page.locale}/${page.route}: ссылка на несуществующую страницу ${href}`,
        );
      } else if (hash) {
        checkAnchor(page, hash, target, errors);
      }
    }
  }

  if (errors.length) {
    throw new Error(`Битые внутренние ссылки:\n  - ${errors.join('\n  - ')}`);
  }

  return checked;
}

function checkAnchor(sourcePage, rawHash, targetPage, errors) {
  const id = safeDecode(rawHash);

  if (!targetPage.ids.has(id)) {
    errors.push(
      `${sourcePage.locale}/${sourcePage.route}: якорь "#${id}" не найден на ${targetPage.locale}/${targetPage.route}`,
    );
  }
}

/** Раскладывает JSON-ассеты по локалям и общий index.json. */
async function writeAssets(packages, pages, generatedAt) {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const page of pages) {
    const outputPath = path.join(OUTPUT_DIR, page.locale, page.file);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(
      outputPath,
      `${JSON.stringify(
        {
          locale: page.locale,
          pkg: page.pkg,
          brick: page.brick,
          title: page.title,
          route: page.route,
          source: page.source,
          sourceLocale: page.sourceLocale,
          fallback: page.fallback,
          headings: page.headings,
          html: page.html,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  }

  for (const locale of LOCALES) {
    const localePages = pages.filter((page) => page.locale === locale);
    const packageEntries = packages.map((pkg) => {
      const packagePage = findPage(localePages, pkg.route);

      return {
        id: pkg.id,
        title: pkg.title,
        npmName: pkg.npmName,
        route: pkg.route,
        file: packagePage.file,
        fallback: packagePage.fallback,
        bricks: pkg.bricks.map((brick) => {
          const brickPage = findPage(localePages, brick.route);

          return {
            id: brick.id,
            title: brickPage.title,
            route: brick.route,
            file: brickPage.file,
            fallback: brickPage.fallback,
          };
        }),
      };
    });

    await writeFile(
      path.join(OUTPUT_DIR, locale, 'index.json'),
      `${JSON.stringify(
        {
          locale,
          generatedAt,
          packages: packageEntries,
          pages: localePages.map((page) => ({
            pkg: page.pkg,
            brick: page.brick,
            title: page.title,
            route: page.route,
            file: page.file,
            fallback: page.fallback,
          })),
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  }

  await writeFile(
    path.join(OUTPUT_DIR, 'index.json'),
    `${JSON.stringify(
      {
        generatedAt,
        locales: LOCALES,
        packages: packages.map((pkg) => ({
          id: pkg.id,
          title: pkg.title,
          npmName: pkg.npmName,
          route: pkg.route,
          bricks: pkg.bricks.map((brick) => brick.id),
        })),
        pages: Object.fromEntries(
          LOCALES.map((locale) => [
            locale,
            pages
              .filter((page) => page.locale === locale)
              .map((page) => ({
                route: page.route,
                title: page.title,
                fallback: page.fallback,
              })),
          ]),
        ),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

function findPage(pages, route) {
  const page = pages.find((candidate) => candidate.route === route);

  if (!page) {
    throw new Error(`Не найдена страница для маршрута ${route}`);
  }

  return page;
}
