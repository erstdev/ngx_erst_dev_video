import {
  CAPTURE_GIF_DEFAULT_DURATION,
  CAPTURE_GIF_DEFAULT_FPS,
  CAPTURE_GIF_DEFAULT_LOOP,
  CAPTURE_GIF_DEFAULT_WIDTH,
  CAPTURE_GIF_MAX_DURATION,
  CAPTURE_GIF_MAX_FPS,
  CAPTURE_GIF_MAX_WIDTH,
  CAPTURE_GIF_MIN_DURATION,
  CAPTURE_GIF_MIN_FPS,
  CAPTURE_GIF_MIN_WIDTH,
  GIF_MIN_DELAY_CENTISECONDS,
} from '../constants';
import type { CaptureGifOptions, NormalizedGifOptions } from '../interfaces';
import { clampNumber } from './clamp-number.util';

/**
 * Проверяет настройки GIF: некорректные значения заменяются дефолтами, а
 * корректные зажимаются в допустимый диапазон.
 */
export function normalizeGifOptions(
  options: CaptureGifOptions,
): NormalizedGifOptions {
  const fps = clampNumber(
    options.fps,
    CAPTURE_GIF_MIN_FPS,
    CAPTURE_GIF_MAX_FPS,
    CAPTURE_GIF_DEFAULT_FPS,
  );

  return {
    fps,
    duration: clampNumber(
      options.duration,
      CAPTURE_GIF_MIN_DURATION,
      CAPTURE_GIF_MAX_DURATION,
      CAPTURE_GIF_DEFAULT_DURATION,
    ),
    width: clampNumber(
      options.width,
      CAPTURE_GIF_MIN_WIDTH,
      CAPTURE_GIF_MAX_WIDTH,
      CAPTURE_GIF_DEFAULT_WIDTH,
    ),
    loop:
      typeof options.loop === 'boolean'
        ? options.loop
        : CAPTURE_GIF_DEFAULT_LOOP,
    delayCentiseconds: Math.max(
      GIF_MIN_DELAY_CENTISECONDS,
      Math.round(100 / fps),
    ),
  };
}
