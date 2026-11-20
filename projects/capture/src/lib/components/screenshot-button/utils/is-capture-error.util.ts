import type { CaptureError } from '../../../interfaces';

/**
 * Отличает `CaptureError` от произвольного исключения.
 *
 * Ошибка захвата — обычный объект, а не наследник `Error`, поэтому проверять
 * её через `instanceof` нельзя: смотрим на обязательные поля `code` и
 * `message`.
 */
export function isCaptureError(value: unknown): value is CaptureError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { code?: unknown; message?: unknown };

  return (
    typeof candidate.code === 'string' && typeof candidate.message === 'string'
  );
}
