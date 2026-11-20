import {
  CAPTURE_DEFAULT_FRAME_TYPE,
  CAPTURE_DEFAULT_QUALITY,
  CAPTURE_FRAME_TYPES,
} from '../constants';
import type {
  CaptureFrameOptions,
  NormalizedFrameOptions,
} from '../interfaces';
import type { CaptureFrameType } from '../types';
import { clampNumber } from './clamp-number.util';
import { positiveInteger } from './positive-integer.util';

/**
 * Проверяет настройки кадра: неизвестный MIME заменяется PNG, качество
 * зажимается в `0..1`, лимиты размеров отбрасываются, если некорректны.
 */
export function normalizeFrameOptions(
  options: CaptureFrameOptions,
): NormalizedFrameOptions {
  return {
    type: isFrameType(options.type) ? options.type : CAPTURE_DEFAULT_FRAME_TYPE,
    quality: clampNumber(options.quality, 0, 1, CAPTURE_DEFAULT_QUALITY),
    maxWidth: positiveInteger(options.maxWidth),
    maxHeight: positiveInteger(options.maxHeight),
  };
}

/** Проверяет, что MIME-тип кадра входит в публичный список. */
function isFrameType(value: unknown): value is CaptureFrameType {
  return CAPTURE_FRAME_TYPES.includes(value as CaptureFrameType);
}
