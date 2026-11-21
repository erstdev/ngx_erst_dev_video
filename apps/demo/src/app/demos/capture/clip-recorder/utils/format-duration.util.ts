/** Длительность записи как `mm:ss`. */
export function formatDuration(durationMs: number): string {
  const totalSeconds =
    Number.isFinite(durationMs) && durationMs > 0
      ? Math.floor(durationMs / 1000)
      : 0;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
