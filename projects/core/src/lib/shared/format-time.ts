/**
 * Форматирует время в секундах в строку `мм:сс`.
 *
 * Если время больше часа, добавляется часть часов: `ч:мм:сс`.
 * Некорректные значения (`NaN`, `Infinity`, `null`, `undefined`, отрицательные
 * числа) превращаются в `"00:00"`, чтобы шаблон никогда не показывал мусор.
 *
 * @param seconds — время в секундах.
 * @returns строка вида `"03:07"` или `"1:03:07"`.
 */
export function formatTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) {
    return '00:00';
  }

  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00';
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const restSeconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(restSeconds).padStart(2, '0');

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
