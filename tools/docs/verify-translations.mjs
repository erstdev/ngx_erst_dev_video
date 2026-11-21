#!/usr/bin/env node
/**
 * Проверка английских README перед генерацией сайта.
 *
 * Сравнивает структуру `README.md` и `README.en.md` (заголовки, таблицы,
 * блоки кода, ссылки), ищет оставшуюся кириллицу и проверяет якоря
 * `#...`, которые ведут на заголовки английских страниц.
 *
 * Запуск: `node tools/docs/verify-translations.mjs [пакет ...]`.
 */

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
const PROJECTS_DIR = path.join(ROOT, 'projects');

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  const requested = process.argv.slice(2);
  const packages = requested.length ? requested : await listPackages();
  const errors = [];
  const warnings = [];
  let checked = 0;

  for (const pkg of packages) {
    const readmes = await collectReadmes(path.join(PROJECTS_DIR, pkg));

    for (const readme of readmes) {
      const english = readme.replace(/README\.md$/, 'README.en.md');
      const relative = path.relative(ROOT, readme).replaceAll(path.sep, '/');
      const relativeEnglish = relative.replace(/README\.md$/, 'README.en.md');

      if (!existsSync(english)) {
        errors.push(`${relativeEnglish}: файла нет`);
        continue;
      }

      checked += 1;
      const source = await readFile(readme, 'utf8');
      const translation = await readFile(english, 'utf8');

      compareStructure(relative, source, translation, errors);
      checkCyrillic(relativeEnglish, translation, warnings);
      await checkAnchors(english, translation, errors);
    }
  }

  console.log(`Проверено переводов: ${checked}.`);
  if (warnings.length) {
    console.log('\n⚠ Предупреждения:');
    for (const warning of warnings) console.log(`  - ${warning}`);
  }
  if (errors.length) {
    console.log('\n✖ Ошибки:');
    for (const error of errors) console.log(`  - ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log('✔ Структура, якоря и отсутствие кириллицы в порядке.');
}

async function listPackages() {
  const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(path.join(PROJECTS_DIR, name, 'README.md')));
}

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

function compareStructure(relative, source, translation, errors) {
  const metrics = {
    заголовков: [countHeadings(source), countHeadings(translation)],
    таблиц: [countTables(source), countTables(translation)],
    'блоков кода': [countCodeBlocks(source), countCodeBlocks(translation)],
    ссылок: [countLinks(source), countLinks(translation)],
  };

  for (const [name, [expected, actual]] of Object.entries(metrics)) {
    if (expected !== actual) {
      errors.push(
        `${relative}: ${name} ${actual}, в русском исходнике ${expected}`,
      );
    }
  }
}

function countHeadings(markdown) {
  return (markdown.match(/^#{1,6}\s/gm) ?? []).length;
}

function countTables(markdown) {
  return (markdown.match(/^\|[\s:|-]+\|$/gm) ?? []).length;
}

function countCodeBlocks(markdown) {
  return Math.floor((markdown.match(/^```/gm) ?? []).length / 2);
}

function countLinks(markdown) {
  return (markdown.match(/\]\([^)]*\)/g) ?? []).length;
}

function checkCyrillic(relativeEnglish, markdown, warnings) {
  const lines = markdown.split(/\r?\n/);
  const matches = [];

  lines.forEach((line, index) => {
    if (/[А-Яа-яЁё]/.test(line)) {
      matches.push(`${index + 1}: ${line.trim().slice(0, 100)}`);
    }
  });

  if (matches.length) {
    warnings.push(
      `${relativeEnglish}: кириллица в ${matches.length} строках:\n      ${matches
        .slice(0, 5)
        .join('\n      ')}`,
    );
  }
}

async function checkAnchors(englishPath, markdown, errors) {
  const linkPattern = /\]\(([^)]+)\)/g;
  let match;

  while ((match = linkPattern.exec(markdown))) {
    const href = match[1];
    if (!href.includes('#')) continue;
    if (/^https?:\/\//i.test(href)) continue;

    const [targetPath, hash] = href.split('#');
    const targetFile = resolveTarget(englishPath, targetPath);
    if (!targetFile) continue;

    const targetMarkdown = await readFile(targetFile, 'utf8');
    const slugs = new Set(headingSlugs(targetMarkdown));

    if (!slugs.has(hash)) {
      errors.push(
        `${path.relative(ROOT, englishPath)}: якорь #${hash} не найден в ${path.relative(ROOT, targetFile)}`,
      );
    }
  }
}

function resolveTarget(sourcePath, targetPath) {
  if (!targetPath) return sourcePath;

  const resolved = path.resolve(path.dirname(sourcePath), targetPath);
  if (existsSync(resolved)) {
    if (resolved.endsWith('README.md')) {
      const english = resolved.replace(/README\.md$/, 'README.en.md');
      return existsSync(english) ? english : null;
    }
    return resolved;
  }

  if (resolved.endsWith('README.md')) {
    const english = resolved.replace(/README\.md$/, 'README.en.md');
    return existsSync(english) ? english : null;
  }

  return null;
}

function headingSlugs(markdown) {
  const used = new Set();
  const slugs = [];

  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^#{1,6}\s+(.+)$/);
    if (!match) continue;

    const text = match[1].replace(/[*_`~[\]]/g, '');
    const base = slugify(text) || 'section';
    let slug = base;
    let counter = 1;

    while (used.has(slug)) {
      slug = `${base}-${counter}`;
      counter += 1;
    }

    used.add(slug);
    slugs.push(slug);
  }

  return slugs;
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
