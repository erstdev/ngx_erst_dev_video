import type { VideoError, VideoErrorCode } from '@erst_dev/ngx-video-core';

import {
  HLS_ERROR_DETAIL_INCOMPATIBLE_CODECS,
  HLS_ERROR_MESSAGES,
  HLS_ERROR_TYPE_MEDIA,
  HLS_ERROR_TYPE_NETWORK,
} from '../constants';
import type { HlsErrorDataLike } from '../interfaces';

/**
 * Переводит ошибку hls.js в публичный `VideoError`.
 *
 * Нефатальные ошибки возвращают `null`: они штатные (переключение уровня,
 * повторная загрузка сегмента) и не должны попадать в интерфейс. `cause` —
 * исходные данные hls.js без изменений.
 */
export function mapHlsError(data: unknown): VideoError | null {
  if (!isHlsErrorData(data) || !data.fatal) {
    return null;
  }

  const code = resolveHlsErrorCode(data);

  return {
    code,
    message: HLS_ERROR_MESSAGES[code],
    cause: data,
  };
}

/** Проверяет, что значение похоже на данные ошибки hls.js. */
function isHlsErrorData(value: unknown): value is HlsErrorDataLike {
  return typeof value === 'object' && value !== null;
}

/** Сопоставляет тип и детали ошибки hls.js публичному коду ошибки. */
function resolveHlsErrorCode(data: HlsErrorDataLike): VideoErrorCode {
  if (data.details === HLS_ERROR_DETAIL_INCOMPATIBLE_CODECS) {
    return 'source-not-supported';
  }

  if (data.type === HLS_ERROR_TYPE_NETWORK) {
    return 'network';
  }

  if (data.type === HLS_ERROR_TYPE_MEDIA) {
    return 'decode';
  }

  return 'unknown';
}
