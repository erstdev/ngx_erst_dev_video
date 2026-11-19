import type { VideoError, VideoErrorCode } from '@erst_dev/ngx-video-core';

import {
  DASH_DECODE_ERROR_CODES,
  DASH_ERROR_MESSAGES,
  DASH_IGNORED_ERROR_CODES,
  DASH_NETWORK_ERROR_CODES,
  DASH_SOURCE_ERROR_CODES,
} from '../constants';
import type {
  DashErrorDataInterface,
  DashJsErrorInterface,
} from '../interfaces';

/**
 * Переводит ошибку dash.js в публичный `VideoError`.
 *
 * `ERROR` в dash.js терминален, но ошибки разбора субтитров не должны попадать
 * в интерфейс — возвращается `null`. `cause` — исходные данные dash.js без
 * изменений.
 */
export function mapDashError(event: unknown): VideoError | null {
  if (!isDashErrorData(event)) {
    return null;
  }

  const error = event.error;

  if (isDashJsError(error)) {
    if (
      typeof error.code === 'number' &&
      DASH_IGNORED_ERROR_CODES.has(error.code)
    ) {
      return null;
    }

    const code = resolveDashErrorCode(error.code);

    return {
      code,
      message: DASH_ERROR_MESSAGES[code],
      cause: event,
    };
  }

  // В типах dash.js встречаются строковые категории ошибок; поддерживаем их,
  // чтобы маппинг не зависел от версии библиотеки.
  if (typeof error === 'string') {
    const code = resolveDashStringErrorCode(error);

    if (code === null) {
      return null;
    }

    return {
      code,
      message: DASH_ERROR_MESSAGES[code],
      cause: event,
    };
  }

  return null;
}

/** Проверяет, что значение похоже на данные события `ERROR` dash.js. */
function isDashErrorData(value: unknown): value is DashErrorDataInterface {
  return typeof value === 'object' && value !== null && 'error' in value;
}

/** Проверяет, что значение похоже на `DashJSError`. */
function isDashJsError(value: unknown): value is DashJsErrorInterface {
  return typeof value === 'object' && value !== null;
}

/** Сопоставляет числовой код ошибки dash.js публичному коду ошибки. */
function resolveDashErrorCode(code: number | undefined): VideoErrorCode {
  if (typeof code !== 'number') {
    return 'unknown';
  }

  if (DASH_NETWORK_ERROR_CODES.has(code)) {
    return 'network';
  }

  if (DASH_SOURCE_ERROR_CODES.has(code)) {
    return 'source-not-supported';
  }

  if (DASH_DECODE_ERROR_CODES.has(code)) {
    return 'decode';
  }

  return 'unknown';
}

/** Сопоставляет строковую категорию ошибки dash.js публичному коду. */
function resolveDashStringErrorCode(error: string): VideoErrorCode | null {
  switch (error) {
    case 'download':
      return 'network';
    case 'manifestError':
    case 'capability':
    case 'mediasource':
      return 'source-not-supported';
    case 'cc':
      return null;
    default:
      return 'unknown';
  }
}
