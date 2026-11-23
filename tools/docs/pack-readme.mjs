#!/usr/bin/env node
/**
 * Готовит README для npm.
 *
 * npm показывает только корневой README пакета, второй файл он не выводит.
 * Поэтому на npm уходит английская версия (`README.en.md`): абсолютные ссылки
 * на сайт плюс одна строка со ссылкой на русскую страницу. Относительные
 * ссылки в репозитории и на сайте работают, а в npm вели бы в никуда — их
 * переписывает тот же код, что и генератор сайта (`lib/readme-links.mjs`),
 * поэтому адреса в документации и в npm не расходятся.
 *
 * Что делает скрипт для каждого пакета:
 *   - берёт `projects/<пакет>/README.en.md`;
 *   - переписывает ссылки на README в абсолютные адреса сайта: пакет —
 *     `<SITE_URL>/en/docs/<пакет>/`, кирпич — `<SITE_URL>/en/docs/<пакет>/<кирпич>/api/`,
 *     якоря сохраняются;
 *   - добавляет в начало строку со ссылкой на русскую версию
 *     `<SITE_URL>/ru/docs/<пакет>/`;
 *   - пишет результат в `dist/projects/<пакет>/README.md`, перезаписывая
 *     русский README, который туда скопировал ng-packagr;
 *   - удаляет `dist/projects/<пакет>/README.en.md`, если он там оказался;
 *   - проверяет, что в результате не осталось относительных ссылок, ссылок на
 *     приватный репозиторий и русского текста.
 *
 * `SITE_URL` обязателен и передаётся в окружении. До появления домена (шаг 2)
 * скрипт падает с понятной ошибкой — это нормально, публикация идёт после
 * сайта.
 *
 * Запуск: `SITE_URL=https://<домен> npm run docs:pack` (после `nx run-many -t build`).
 */

import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Marked } from 'marked';

import {
  PRIVATE_REPO_URL_PATTERNS,
  createReadmeRegistry,
  englishReadmePath,
  rewriteHref,
} from './lib/readme-links.mjs';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
const PROJECTS_DIR = path.join(ROOT, 'projects');
const DIST_DIR = path.join(ROOT, 'dist', 'projects');

/** Локаль npm-README: на npm публикуем только английскую версию. */
const NPM_LOCALE = 'en';

/** Инлайновая markdown-ссылка: `[текст](адрес "заголовок")`. */
const INLINE_LINK = /(!?\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\s*\))/g;

/** Строка с ссылкой на русскую версию; всегда первая строка README. */
function russianVersionLine(pkg, siteUrl) {
  return `> Russian version: [documentation in Russian](${siteUrl}/ru/${pkg.route}/)`;
}

main().catch((error) => {
  console.error('\n✖ Подготовка npm-README не удалась.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  const siteUrl = readSiteUrl();
  const { packages, docsMap } = await createReadmeRegistry({
    root: ROOT,
    projectsDir: PROJECTS_DIR,
  });

  for (const pkg of packages) {
    if (!existsSync(path.join(DIST_DIR, pkg.id))) {
      throw new Error(
        `Не найден dist/projects/${pkg.id}: сначала соберите пакеты ` +
          '(npx nx run-many -t build), затем повторите docs:pack.',
      );
    }
  }

  const stats = [];

  for (const pkg of packages) {
    stats.push(await packPackage({ pkg, docsMap, siteUrl }));
  }

  console.log(`\n✔ npm-README готовы: ${stats.length} пакетов.`);
  console.log(`  Сайт: ${siteUrl}`);
  for (const stat of stats) {
    const removed = stat.removedEnglish ? ', удалён README.en.md' : '';
    console.log(
      `  ${stat.pkg}: ${stat.links} ссылок переписано${removed} → dist/projects/${stat.pkg}/README.md`,
    );
  }
}

/** Читает и проверяет `SITE_URL`: origin сайта документации без хвостового `/`. */
function readSiteUrl() {
  const raw = String(process.env.SITE_URL ?? '')
    .trim()
    .replace(/\/+$/, '');

  if (!raw) {
    throw new Error(
      'Не задан SITE_URL — адрес сайта документации. Пример: ' +
        'SITE_URL=https://example.com npm run docs:pack. ' +
        'Домен появится в шаге 2, публикация пакетов — после него.',
    );
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`SITE_URL не похож на адрес сайта: ${raw}`);
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(
      `SITE_URL должен начинаться с http:// или https://: ${raw}`,
    );
  }

  return raw;
}

/** Собирает один npm-README из английского исходника. */
async function packPackage({ pkg, docsMap, siteUrl }) {
  const sourcePath = englishReadmePath(pkg.source);

  if (!existsSync(path.join(ROOT, sourcePath))) {
    throw new Error(
      `${sourcePath}: нет английского README — на npm уходит только он`,
    );
  }

  const markdown = await readFile(path.join(ROOT, sourcePath), 'utf8');
  const context = {
    locale: NPM_LOCALE,
    sourcePath,
    docsMap,
    publicBase: siteUrl,
    brickSuffix: '/api',
    trailingSlash: true,
    warnings: [],
  };
  const { markdown: rewritten, links } = rewriteLinks(markdown, context);
  const russianLine = russianVersionLine(pkg, siteUrl);
  const output = `${russianLine}\n\n${rewritten}`;

  validateReadme(output, { sourcePath, russianLine });

  const distDir = path.join(DIST_DIR, pkg.id);
  await writeFile(path.join(distDir, 'README.md'), output, 'utf8');

  const englishCopy = path.join(distDir, 'README.en.md');
  const removedEnglish = existsSync(englishCopy);
  if (removedEnglish) await rm(englishCopy);

  return { pkg: pkg.id, links, removedEnglish };
}

/**
 * Переписывает относительные ссылки в тексте README.
 * Блоки кода не трогаем: в примерах кода ссылки — часть примера.
 */
function rewriteLinks(markdown, context) {
  let links = 0;
  let failed = null;
  let inFence = false;

  const lines = markdown.split('\n').map((line) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return line;
    }

    if (inFence) return line;

    return line.replace(INLINE_LINK, (match, prefix, href, suffix) => {
      const result = rewriteHref(href, context);

      if (result.drop) {
        failed ??= href;
        return match;
      }

      if (result.href === href) return match;

      links += 1;
      return `${prefix}${result.href}${suffix}`;
    });
  });

  if (failed) {
    throw new Error(
      `${context.sourcePath}: ссылка "${failed}" не ведёт на README документации`,
    );
  }

  return { markdown: lines.join('\n'), links };
}

/**
 * Проверяет готовый README теми же правилами, что нужны npm: только
 * английский текст, абсолютные ссылки, без приватного репозитория.
 */
function validateReadme(markdown, { sourcePath, russianLine }) {
  const errors = [];
  const russianLinks = markdown.split(russianLine).length - 1;

  if (russianLinks !== 1 || !markdown.startsWith(`${russianLine}\n`)) {
    errors.push('ссылка на русскую версию должна быть ровно одна и в начале');
  }

  if (/[А-Яа-яЁё]/.test(markdown)) {
    const lines = markdown
      .split('\n')
      .map((line, index) => (/([А-Яа-яЁё])/.test(line) ? index + 1 : 0))
      .filter(Boolean);

    errors.push(`остался русский текст в строках: ${lines.join(', ')}`);
  }

  if (PRIVATE_REPO_URL_PATTERNS.some((pattern) => pattern.test(markdown))) {
    errors.push('осталась ссылка на приватный репозиторий GitHub/GitLab');
  }

  if (markdown.includes('](./') || markdown.includes('](../')) {
    errors.push('остались относительные ссылки (./ или ../)');
  }

  const relativeLinks = collectLinks(new Marked({ gfm: true }).lexer(markdown))
    .map((link) => link.href.trim())
    .filter(
      (href) =>
        href &&
        !href.startsWith('#') &&
        !/^(mailto:|tel:)/i.test(href) &&
        !/^https?:\/\//i.test(href),
    );

  if (relativeLinks.length) {
    errors.push(
      `остались ссылки без абсолютного адреса: ${relativeLinks.join(', ')}`,
    );
  }

  if (errors.length) {
    throw new Error(`${sourcePath}:\n  - ${errors.join('\n  - ')}`);
  }
}

/**
 * Собирает ссылки и картинки из дерева токенов `marked`. Нужен независимый
 * разбор: он ловит то, что не переписал текстовый проход (reference-ссылки,
 * автолинки), и не даёт молча оставить относительный адрес.
 */
function collectLinks(node, links = []) {
  if (!node || typeof node !== 'object') return links;

  if (Array.isArray(node)) {
    for (const item of node) collectLinks(item, links);
    return links;
  }

  if (node.type === 'link' || node.type === 'image') {
    links.push({ type: node.type, href: String(node.href ?? '') });
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') collectLinks(value, links);
  }

  return links;
}
