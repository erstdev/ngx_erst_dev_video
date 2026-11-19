import type { VideoErrorCode } from '@erst_dev/ngx-video-core';

/** Событие hls.js: манифест разобран, уровни доступны. */
export const HLS_EVENT_MANIFEST_PARSED = 'hlsManifestParsed';

/** Событие hls.js: фактически воспроизводимый уровень сменился. */
export const HLS_EVENT_LEVEL_SWITCHED = 'hlsLevelSwitched';

/** Событие hls.js: сетевая ошибка, ошибка декодирования или манифеста. */
export const HLS_EVENT_ERROR = 'hlsError';

/** `ErrorTypes.NETWORK_ERROR`: не удалось загрузить манифест или сегмент. */
export const HLS_ERROR_TYPE_NETWORK = 'networkError';

/** `ErrorTypes.MEDIA_ERROR`: не удалось декодировать или добавить медиа. */
export const HLS_ERROR_TYPE_MEDIA = 'mediaError';

/** `ErrorDetails.MANIFEST_INCOMPATIBLE_CODECS_ERROR`: кодеки не поддерживаются. */
export const HLS_ERROR_DETAIL_INCOMPATIBLE_CODECS =
  'manifestIncompatibleCodecsError';

/** MIME-тип HLS для проверки нативной поддержки браузера. */
export const HLS_NATIVE_MIME_TYPE = 'application/vnd.apple.mpegurl';

/** Автоматический выбор уровня качества в hls.js. */
export const HLS_AUTO_LEVEL = -1;

/**
 * Тексты сообщений об ошибках источника.
 *
 * `code` — контракт, текст можно менять. Ядро не экспортирует свои тексты,
 * поэтому пакет держит собственные.
 */
export const HLS_ERROR_MESSAGES: Readonly<Record<VideoErrorCode, string>> = {
  aborted: 'Загрузка видео была прервана.',
  network: 'Не удалось загрузить видео из-за ошибки сети.',
  decode: 'Не удалось декодировать видео.',
  'source-not-supported': 'Этот HLS-поток не поддерживается браузером.',
  'playback-blocked':
    'Браузер заблокировал автовоспроизведение. Нужен клик пользователя.',
  unknown: 'Не удалось воспроизвести видео.',
};
