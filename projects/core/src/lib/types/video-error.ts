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

/**
 * Нормализованная ошибка плеера.
 *
 * Публичный контракт: структура полей не меняется в минорных версиях пакета.
 */
export interface VideoError {
  /** Машинно-читаемый код — используйте его для логики и локализации. */
  readonly code: VideoErrorCode;
  /** Готовое сообщение для пользователя (по умолчанию — на русском). */
  readonly message: string;
  /** Исходная ошибка: `MediaError`, `DOMException` или что-то ещё. */
  readonly cause?: unknown;
}
