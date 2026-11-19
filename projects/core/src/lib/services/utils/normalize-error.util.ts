import type { VideoError } from '../../interfaces';
import { ERROR_MESSAGES } from '../constants';
import { resolveErrorCode } from './resolve-error-code.util';

/** Превращает нативную ошибку медиа-элемента в `VideoError` пакета. */
export const normalizeError = (mediaError: MediaError): VideoError => {
  const code = resolveErrorCode(mediaError.code);
  return { code, message: ERROR_MESSAGES[code], cause: mediaError };
};
