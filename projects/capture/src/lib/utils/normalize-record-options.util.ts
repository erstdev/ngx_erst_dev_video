import {
  CAPTURE_DEFAULT_AUDIO_BITS_PER_SECOND,
  CAPTURE_DEFAULT_TIMESLICE,
  CAPTURE_DEFAULT_VIDEO_BITS_PER_SECOND,
  CAPTURE_MAX_BITS_PER_SECOND,
  CAPTURE_MAX_TIMESLICE,
  CAPTURE_MIN_BITS_PER_SECOND,
} from '../constants';
import type { NormalizedRecordOptions, RecordClipOptions } from '../interfaces';
import { clampNumber } from './clamp-number.util';

/**
 * Проверяет настройки записи: пустой MIME не передаётся, битрейты и
 * `timeslice` зажимаются в разумные границы.
 */
export function normalizeRecordOptions(
  options: RecordClipOptions,
): NormalizedRecordOptions {
  const mimeType =
    typeof options.mimeType === 'string' && options.mimeType.trim().length > 0
      ? options.mimeType.trim()
      : undefined;

  return {
    mimeType,
    videoBitsPerSecond: clampNumber(
      options.videoBitsPerSecond,
      CAPTURE_MIN_BITS_PER_SECOND,
      CAPTURE_MAX_BITS_PER_SECOND,
      CAPTURE_DEFAULT_VIDEO_BITS_PER_SECOND,
    ),
    audioBitsPerSecond: clampNumber(
      options.audioBitsPerSecond,
      CAPTURE_MIN_BITS_PER_SECOND,
      CAPTURE_MAX_BITS_PER_SECOND,
      CAPTURE_DEFAULT_AUDIO_BITS_PER_SECOND,
    ),
    timeslice: clampNumber(
      options.timeslice,
      0,
      CAPTURE_MAX_TIMESLICE,
      CAPTURE_DEFAULT_TIMESLICE,
    ),
  };
}
