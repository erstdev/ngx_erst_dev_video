import { CAPTURE_ERROR_MESSAGES } from '../constants';
import type { CaptureError } from '../interfaces';
import type { CaptureErrorCode } from '../types';

/**
 * Создаёт обычный объект `CaptureError` — так же, как `core` отдаёт
 * `VideoError`, а не наследника `Error`.
 */
export function createCaptureError(
  code: CaptureErrorCode,
  cause?: unknown,
): CaptureError {
  const message = CAPTURE_ERROR_MESSAGES[code];

  return cause === undefined ? { code, message } : { code, message, cause };
}
