import { VideoErrorCode } from '../types';

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
