import type { CaptureErrorCode } from '../types';

/**
 * Ошибка захвата.
 *
 * Структура повторяет `VideoError` из `core`: `code` — машинный контракт,
 * `message` — готовый русский текст, `cause` — исходная ошибка.
 */
export interface CaptureError {
  /** Машинно-читаемый код — используйте его для логики и локализации. */
  readonly code: CaptureErrorCode;
  /** Готовое сообщение для пользователя (по умолчанию — на русском). */
  readonly message: string;
  /** Исходная ошибка: `DOMException`, `Error` или что-то ещё. */
  readonly cause?: unknown;
}
