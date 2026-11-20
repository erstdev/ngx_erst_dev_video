/**
 * Форматирует длительность записи как `mm:ss`.
 *
 * Миллисекунды округляются вниз до целых секунд. Отрицательные значения,
 * `NaN` и бесконечность дают `00:00`.
 *
 * @example
 * ```ts
 * formatClipDuration(0); // '00:00'
 * formatClipDuration(65_000); // '01:05'
 * formatClipDuration(-1); // '00:00'
 * ```
 */
export function formatClipDuration(durationMs: number): string {
  const totalSeconds =
    Number.isFinite(durationMs) && durationMs > 0
      ? Math.floor(durationMs / 1000)
      : 0;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
