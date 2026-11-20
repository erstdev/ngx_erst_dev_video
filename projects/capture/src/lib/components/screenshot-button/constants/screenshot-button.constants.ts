import type { CaptureFrameType } from '../../../types';

/** Имя файла по умолчанию, если потребитель не задал своё. */
export const SCREENSHOT_BUTTON_DEFAULT_FILE_NAME = 'screenshot';

/**
 * Подписи кнопки.
 *
 * `ariaLabel` переопределяет обе; во время захвата используется `capturing`.
 */
export const SCREENSHOT_BUTTON_LABELS = {
  capture: 'Сделать скриншот',
  capturing: 'Сохранение кадра…',
} as const;

/** Расширение файла для каждого MIME-типа кадра. */
export const SCREENSHOT_BUTTON_FILE_EXTENSIONS: Readonly<
  Record<CaptureFrameType, string>
> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

/** Уже существующее расширение, которое срезается перед добавлением нового. */
export const SCREENSHOT_BUTTON_FILE_EXTENSION_PATTERN =
  /\.(?:png|jpe?g|webp)$/i;
