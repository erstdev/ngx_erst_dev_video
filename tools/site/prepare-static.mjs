#!/usr/bin/env node
/**
 * Готовит статику к публикации после сборки демо.
 *
 * Angular при наличии серверной точки входа называет SPA-shell
 * `index.csr.html`, а статическому серверу и `serve-static` нужен `index.html`.
 * Скрипт копирует shell под привычным именем; пререндеренные страницы
 * (`en/index.html`, `ru/index.html`) не трогает.
 *
 * Клиентские маршруты (`/<локаль>/docs/<пакет>/<кирпич>`) живут в каталогах,
 * которые появились ради вложенных пререндеренных API-страниц. Каталог без
 * `index.html` статический сервер отдаёт листингом или 403, а не приложением,
 * поэтому в промежуточные каталоги (только подкаталоги, без файлов) кладём
 * shell — это и есть точка входа Client-маршрута.
 */

import { access, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const browserDir = path.join(process.cwd(), 'dist', 'apps', 'demo', 'browser');
const csrShell = path.join(browserDir, 'index.csr.html');
const shell = path.join(browserDir, 'index.html');

try {
  await access(csrShell);
} catch {
  throw new Error(
    `Не найден ${csrShell}: сначала соберите демо (nx build demo).`,
  );
}

await copyFile(csrShell, shell);
console.log('✔ index.csr.html → index.html (SPA-shell для статики)');

let routeDirs = 0;

/**
 * Рекурсивно дополняет промежуточные каталоги маршрутов shell'ом.
 * Каталоги с файлами (`docs-content`, ассеты) не трогает.
 */
async function fillRouteDirs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const onlyDirs = entries.every((entry) => entry.isDirectory());
  const hasShell = entries.some((entry) => entry.name === 'index.html');

  if (onlyDirs && !hasShell) {
    await copyFile(shell, path.join(dir, 'index.html'));
    routeDirs += 1;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) await fillRouteDirs(path.join(dir, entry.name));
  }
}

await fillRouteDirs(browserDir);
console.log(
  `✔ SPA-shell в каталогах клиентских маршрутов: ${routeDirs} (ожидается 38)`,
);
