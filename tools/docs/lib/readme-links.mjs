/**
 * Общая логика README для сайта и npm.
 *
 * Здесь живёт всё, что знает, где лежит README пакета или кирпича и каким
 * адресом документации он открывается. Генератор сайта (`generate.mjs`) и
 * подготовка npm-README (`pack-readme.mjs`) используют один и тот же код,
 * поэтому ссылки в документации и в npm не расходятся.
 */

import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

/** Локали сайта. Должны совпадать с `SUPPORTED_LOCALES` в приложении. */
export const LOCALES = ['ru', 'en'];

/** Порядок пакетов в навигации — как в roadmap. */
export const PACKAGE_ORDER = [
  'core',
  'controls',
  'timeline',
  'extras',
  'sources',
  'capture',
];

/**
 * Приватный репозиторий проекта. Ссылки на него не должны попадать в
 * пользовательскую документацию: README используют относительные пути, а
 * генератор переписывает их на внутренние маршруты `/docs/...`.
 */
const PRIVATE_REPO = 'erstdev/ngx_erst_dev_video';
export const PRIVATE_REPO_URL_PATTERNS = [
  new RegExp(`https?://github\\.com/${PRIVATE_REPO}(?:[/?#]|$)`, 'i'),
  /https?:\/\/gitlab\.com\/erst_dev\/ngx_erst_dev_video(?:[/?#]|$)/i,
];

/** Проверяет, ведёт ли ссылка на приватный репозиторий проекта. */
export function isPrivateRepoUrl(href) {
  return PRIVATE_REPO_URL_PATTERNS.some((pattern) => pattern.test(href));
}

/** Путь к английской паре README: `README.md` → `README.en.md`. */
export function englishReadmePath(sourcePath) {
  return sourcePath.replace(/README\.md$/, 'README.en.md');
}

/**
 * Собирает реестр документации: пакеты и кирпичи из файловой системы.
 * Пакет — `projects/<pkg>/README.md`, кирпич — любой `README.md` под
 * `projects/<pkg>/src/lib/**`. Имя каталога README становится id кирпича.
 *
 * Возвращает `packages` (в порядке roadmap) и `docsMap` — карту
 * «путь README в репозитории → маршрут документации». В карте лежат обе
 * локали: `README.md` и `README.en.md` ведут на одну страницу.
 */
export async function createReadmeRegistry({ root, projectsDir }) {
  if (!existsSync(projectsDir)) {
    throw new Error(`Не найден каталог проектов: ${projectsDir}`);
  }

  const order = new Map(PACKAGE_ORDER.map((id, index) => [id, index]));
  const entries = await readdir(projectsDir, { withFileTypes: true });
  const packageIds = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((id) => existsSync(path.join(projectsDir, id, 'README.md')))
    .sort(
      (a, b) =>
        (order.get(a) ?? 99) - (order.get(b) ?? 99) || a.localeCompare(b),
    );

  const docsMap = new Map();
  const packages = [];

  for (const id of packageIds) {
    const source = toPosix(
      path.relative(root, path.join(projectsDir, id, 'README.md')),
    );
    const route = `docs/${id}`;
    registerReadme(docsMap, source, route, false);

    const bricks = [];
    const libDir = path.join(projectsDir, id, 'src', 'lib');

    if (existsSync(libDir)) {
      for (const readmePath of await collectReadmes(libDir)) {
        const brick = path.basename(path.dirname(readmePath));
        const brickSource = toPosix(path.relative(root, readmePath));
        const brickRoute = `${route}/${brick}`;

        if (docsMap.has(brickSource)) {
          throw new Error(`Дублирующийся README: ${brickSource}`);
        }

        registerReadme(docsMap, brickSource, brickRoute, true);
        bricks.push({ id: brick, source: brickSource, route: brickRoute });
      }
    }

    bricks.sort((a, b) => a.id.localeCompare(b.id));
    packages.push({ id, source, route, bricks });
  }

  if (!packages.length) {
    throw new Error('Не найдено ни одного пакета с README.md');
  }

  return { packages, docsMap };
}

/** Регистрирует русский README и его английскую пару как один маршрут. */
function registerReadme(docsMap, source, route, brick) {
  const entry = { route, brick };
  docsMap.set(source, entry);
  docsMap.set(englishReadmePath(source), entry);
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

/**
 * Переписывает ссылку на внутреннюю страницу документации.
 *
 * Контекст: `locale`, `sourcePath` (путь README от корня репозитория),
 * `docsMap` и `warnings`. `publicBase` — origin сайта: пусто у генератора
 * сайта (ссылки корневые, `/en/docs/...`) и `SITE_URL` у npm-README.
 * `brickSuffix` добавляется к маршрутам кирпичей (в npm — `/api`),
 * `trailingSlash` завершает адрес косой чертой.
 *
 * Внешние ссылки остаются как есть, но помечаются `external`. Ссылки на
 * приватный репозиторий и относительные пути, которым не нашлось README,
 * помечаются `drop`: вызывающий код сам решает, убрать их или упасть.
 */
export function rewriteHref(rawHref, context) {
  const href = String(rawHref ?? '').trim();

  if (!href) return { href: '', external: false };
  if (href.startsWith('#')) return { href, external: false };
  if (/^(mailto:|tel:)/i.test(href)) return { href, external: false };

  if (/^https?:\/\//i.test(href)) {
    const internal = githubUrlToRoute(href, context);
    if (internal) return internal;

    if (isPrivateRepoUrl(href)) {
      context.warnings?.push(
        `ссылка на приватный репозиторий удалена: ${href}`,
      );
      return { href: '', external: false, drop: true };
    }

    return { href, external: true };
  }

  if (href.startsWith('//')) {
    return { href: `https:${href}`, external: true };
  }

  if (href.startsWith('/')) {
    return { href: `${context.publicBase ?? ''}${href}`, external: false };
  }

  const [beforeHash, hash = ''] = splitOnce(href, '#');
  const pathPart = beforeHash.split('?')[0];

  if (!pathPart) return { href, external: false };

  const resolved = resolveRepoPath(context.sourcePath, pathPart);
  const route = context.docsMap.get(resolved);

  if (route) {
    return {
      href: `${routeHref(route, context)}${hash ? `#${hash}` : ''}`,
      external: false,
    };
  }

  context.warnings?.push(
    `относительная ссылка "${href}" не ведёт на README — показана без ссылки`,
  );

  return { href: '', external: false, drop: true };
}

/** GitHub-ссылка на README превращается во внутренний маршрут `/docs/...`. */
function githubUrlToRoute(href, context) {
  const match = href.match(
    /^https?:\/\/github\.com\/erstdev\/ngx_erst_dev_video\/(?:blob|tree)\/[^/]+\/([^?#]+)(?:\?[^#]*)?(#.*)?$/i,
  );

  if (!match) return null;

  const repoPath = safeDecode(match[1]);
  const route = context.docsMap.get(repoPath);

  return route
    ? { href: `${routeHref(route, context)}${match[2] ?? ''}`, external: false }
    : null;
}

/** Строит адрес страницы документации по маршруту из реестра. */
function routeHref(route, context) {
  const suffix = context.brickSuffix && route.brick ? context.brickSuffix : '';

  return [
    context.publicBase ?? '',
    '/',
    context.locale,
    '/',
    route.route,
    suffix,
    context.trailingSlash ? '/' : '',
  ].join('');
}

/** Приводит относительный путь README к виду от корня репозитория. */
export function resolveRepoPath(sourcePath, relativePath) {
  const resolved = path.posix.normalize(
    path.posix.join(path.posix.dirname(sourcePath), relativePath),
  );

  return resolved.replace(/^\.\//, '');
}

export function splitOnce(value, separator) {
  const index = value.indexOf(separator);
  return index === -1
    ? [value, '']
    : [value.slice(0, index), value.slice(index + separator.length)];
}

export function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function toPosix(value) {
  return value.split(path.sep).join('/');
}
