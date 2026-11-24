#!/usr/bin/env node
/**
 * Готовит статику к публикации после сборки демо.
 *
 * Angular при наличии серверной точки входа называет SPA-shell
 * `index.csr.html`, а статическому серверу и `serve-static` нужен `index.html`.
 * Скрипт копирует shell под привычным именем; пререндеренные страницы
 * (`en/index.html`, `ru/index.html`) не трогает.
 */

import { copyFile, access } from 'node:fs/promises';
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
