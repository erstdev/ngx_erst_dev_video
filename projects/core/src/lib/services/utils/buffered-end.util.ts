/**
 * Возвращает конец буферизованного диапазона, в который попадает текущая
 * позиция, или `0`, если такого диапазона нет.
 */
export const bufferedEnd = (element: HTMLVideoElement): number => {
  const ranges = element.buffered;
  const time = element.currentTime;

  for (let index = 0; index < ranges.length; index += 1) {
    const start = ranges.start(index);
    const end = ranges.end(index);

    if (start <= time && time <= end) {
      return end;
    }
  }

  return 0;
};
