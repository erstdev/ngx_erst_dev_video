/** Возвращает шаг, если он конечный и положительный, иначе — значение по умолчанию. */
export const sanitizeGestureStep = (value: number, fallback: number): number =>
  Number.isFinite(value) && value > 0 ? value : fallback;

/** Отрицательный или нечисловой порог заменяется нулём. */
export const sanitizeGestureThreshold = (value: number): number =>
  Number.isFinite(value) && value >= 0 ? value : 0;
