/**
 * Кадр GIF: индексированные в глобальную палитру пиксели.
 *
 * Хранит только индексы 3-3-2, а не RGBA, поэтому занимает в четыре раза
 * меньше памяти. Внутренний тип пакета.
 */
export interface GifFrameInterface {
  readonly width: number;
  readonly height: number;
  readonly pixels: Uint8Array;
}
