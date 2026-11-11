/**
 * Машинно-читаемый код ошибки.
 *
 * - `aborted` — загрузка прервана (обычно действием пользователя);
 * - `network` — ошибка сети;
 * - `decode` — не удалось декодировать поток;
 * - `source-not-supported` — формат/источник не поддерживается браузером;
 * - `playback-blocked` — браузер заблокировал запуск (автоплей без жеста пользователя);
 * - `unknown` — всё остальное.
 */
export type VideoErrorCode =
  | 'aborted'
  | 'network'
  | 'decode'
  | 'source-not-supported'
  | 'playback-blocked'
  | 'unknown';
