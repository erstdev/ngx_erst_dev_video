/**
 * Приводит число к диапазону `[min, max]`.
 *
 * Некорректное значение (`NaN`, `Infinity`, не число) заменяется дефолтом —
 * так же `SpeedControlComponent` обходится с некорректными `rates`.
 */
export function clampNumber(
  value: number | undefined,
  min: number,
  max: number,
  fallback: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}
