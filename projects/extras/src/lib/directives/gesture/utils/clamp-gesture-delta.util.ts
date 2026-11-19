/** Ограничивает смещение шагом: свайп длиннее хоста не даёт больше `±step`. */
export const clampGestureDelta = (delta: number, step: number): number => {
  if (!Number.isFinite(delta) || !Number.isFinite(step) || step <= 0) {
    return 0;
  }

  return Math.min(Math.max(delta, -step), step);
};
