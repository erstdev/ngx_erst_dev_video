/** Настройки сборки GIF89a. Внутренний тип пакета. */
export interface GifEncoderOptionsInterface {
  readonly width: number;
  readonly height: number;
  readonly loop: boolean;
  /** Задержка кадра в сотых секунды. */
  readonly delayCentiseconds: number;
}
