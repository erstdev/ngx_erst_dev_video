/** Ось, зафиксированная после превышения порога свайпа. */
export type GestureAxis = 'horizontal' | 'vertical';

/**
 * Фиксирует ось жеста, когда евклидова длина смещения превысила порог.
 *
 * Пока порог не превышен, возвращает `null`. При равных смещениях выбирается
 * горизонталь.
 */
export const resolveGestureAxis = (
  dx: number,
  dy: number,
  threshold: number,
): GestureAxis | null => {
  if (Math.hypot(dx, dy) <= threshold) {
    return null;
  }

  return Math.abs(dx) >= Math.abs(dy) ? 'horizontal' : 'vertical';
};
