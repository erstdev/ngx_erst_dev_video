/**
 * Зажимает число в диапазон `min…max`.
 *
 * Некорректные значения (`NaN`, `Infinity`, `-Infinity`) превращаются в `min`,
 * чтобы вызывающий код не получил `NaN` в стилях, атрибутах или вычислениях.
 *
 * @param value — проверяемое значение.
 * @param min — нижняя граница диапазона.
 * @param max — верхняя граница диапазона.
 * @returns значение в диапазоне `min…max`.
 */
export const clamp = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};
