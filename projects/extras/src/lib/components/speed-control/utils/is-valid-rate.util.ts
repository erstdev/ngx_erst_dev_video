/** Скорость можно показать и применить, только если она конечная и больше нуля. */
export const isValidRate = (rate: number): boolean =>
  Number.isFinite(rate) && rate > 0;
