import type { VideoErrorCode } from '@erst_dev/ngx-video-core';

/** Событие dash.js: поток инициализирован, уровни доступны. */
export const DASH_EVENT_STREAM_INITIALIZED = 'streamInitialized';

/** Событие dash.js: фактически воспроизводимый уровень сменился. */
export const DASH_EVENT_QUALITY_CHANGE_RENDERED = 'qualityChangeRendered';

/** Событие dash.js: терминальная ошибка. */
export const DASH_EVENT_ERROR = 'error';

/** Событие dash.js: браузер запретил запуск воспроизведения. */
export const DASH_EVENT_PLAYBACK_NOT_ALLOWED = 'playbackNotAllowed';

/** Медиа-тип видео в dash.js. */
export const DASH_MEDIA_TYPE_VIDEO = 'video';

/** Настройки dash.js: ABR сам выбирает уровень качества. */
export const DASH_ABR_AUTO_SWITCH_ON = {
  streaming: { abr: { autoSwitchBitrate: { video: true } } },
} as const;

/** Настройки dash.js: ABR не перебивает уровень, выбранный вручную. */
export const DASH_ABR_AUTO_SWITCH_OFF = {
  streaming: { abr: { autoSwitchBitrate: { video: false } } },
} as const;

/**
 * Коды ошибок dash.js, которые считаются сетевыми.
 *
 * 11 — загрузка манифеста, 12 — XLink, 15 — sidx, 16 — синхронизация времени,
 * 17–18 — запросы фрагментов, 19 — разрешение URL, 25–29 — загрузки.
 */
export const DASH_NETWORK_ERROR_CODES: ReadonlySet<number> = new Set([
  11, 12, 15, 16, 17, 18, 19, 25, 26, 27, 28, 29,
]);

/**
 * Коды ошибок dash.js, которые означают неподдерживаемый источник.
 *
 * 10 — разбор манифеста, 23 — нет MediaSource, 24 — нет MediaKeys,
 * 31–32 — логика и отсутствие потоков в манифесте, 34 — muxed-поток,
 * 35 — неподдерживаемый тип SourceBuffer.
 */
export const DASH_SOURCE_ERROR_CODES: ReadonlySet<number> = new Set([
  10, 23, 24, 31, 32, 34, 35,
]);

/** Коды ошибок dash.js, которые означают проблему декодирования или буфера. */
export const DASH_DECODE_ERROR_CODES: ReadonlySet<number> = new Set([
  20, 21, 22,
]);

/**
 * Коды ошибок dash.js, которые не должны попадать в интерфейс.
 *
 * 33 — не удалось разобрать субтитры (TTML/VTT): видео при этом продолжает
 * воспроизводиться, поэтому ошибка источника не эмитится.
 */
export const DASH_IGNORED_ERROR_CODES: ReadonlySet<number> = new Set([33]);

/**
 * Тексты сообщений об ошибках источника.
 *
 * `code` — контракт, текст можно менять. Ядро не экспортирует свои тексты,
 * поэтому пакет держит собственные.
 */
export const DASH_ERROR_MESSAGES: Readonly<Record<VideoErrorCode, string>> = {
  aborted: 'Загрузка видео была прервана.',
  network: 'Не удалось загрузить DASH-поток из-за ошибки сети.',
  decode: 'Не удалось декодировать DASH-поток.',
  'source-not-supported': 'Этот DASH-поток не поддерживается браузером.',
  'playback-blocked':
    'Браузер заблокировал автовоспроизведение. Нужен клик пользователя.',
  unknown: 'Не удалось воспроизвести видео.',
};
