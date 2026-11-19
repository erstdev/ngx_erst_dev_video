import type { VideoErrorCode } from '../../types';

/** Тексты сообщений по умолчанию. Код ошибки — контракт, текст можно менять. */
export const ERROR_MESSAGES: Readonly<Record<VideoErrorCode, string>> = {
  aborted: 'Загрузка видео была прервана.',
  network: 'Не удалось загрузить видео из-за ошибки сети.',
  decode: 'Не удалось декодировать видео.',
  'source-not-supported': 'Этот формат видео не поддерживается браузером.',
  'playback-blocked':
    'Браузер заблокировал автовоспроизведение. Нужен клик пользователя.',
  unknown: 'Не удалось воспроизвести видео.',
};
