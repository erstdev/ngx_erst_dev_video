/**
 * Переводит смещение указателя в долю шага.
 *
 * Например, половина ширины хоста при `seekStep = 30` даёт `15` секунд.
 * Некорректные размеры и шаг дают `0`, чтобы деление на ноль не попало
 * в результат.
 */
export const calculateGestureDelta = (
  offset: number,
  size: number,
  step: number,
): number => {
  if (
    !Number.isFinite(offset) ||
    !Number.isFinite(size) ||
    !Number.isFinite(step) ||
    size <= 0 ||
    step <= 0
  ) {
    return 0;
  }

  return (offset / size) * step;
};
