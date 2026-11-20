/** Настройки GIF после проверки и зажима значений. Внутренний тип. */
export interface NormalizedGifOptions {
  readonly fps: number;
  readonly duration: number;
  readonly width: number;
  readonly loop: boolean;
  /** Задержка кадра в сотых секунды — в таком виде её ждёт GIF. */
  readonly delayCentiseconds: number;
}
