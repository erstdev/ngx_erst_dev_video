import type { CaptureFrameType } from '../../../types';
import {
  SCREENSHOT_BUTTON_DEFAULT_FILE_NAME,
  SCREENSHOT_BUTTON_FILE_EXTENSION_PATTERN,
  SCREENSHOT_BUTTON_FILE_EXTENSIONS,
} from '../constants';

/**
 * Собирает имя файла из базового имени и MIME-типа кадра.
 *
 * Имя обрезается по краям, существующее расширение `.png`, `.jpg`, `.jpeg`
 * или `.webp` срезается, а новое добавляется по типу кадра: `image/png` →
 * `.png`, `image/jpeg` → `.jpg`, `image/webp` → `.webp`. Пустое имя
 * заменяется на `screenshot`.
 *
 * @example
 * ```ts
 * buildFileName('  frame.jpeg  ', 'image/png'); // 'frame.png'
 * buildFileName('', 'image/jpeg'); // 'screenshot.jpg'
 * ```
 */
export function buildFileName(
  fileName: string,
  type: CaptureFrameType,
): string {
  const base = fileName
    .trim()
    .replace(SCREENSHOT_BUTTON_FILE_EXTENSION_PATTERN, '')
    .trim();

  return `${base || SCREENSHOT_BUTTON_DEFAULT_FILE_NAME}${SCREENSHOT_BUTTON_FILE_EXTENSIONS[type]}`;
}
