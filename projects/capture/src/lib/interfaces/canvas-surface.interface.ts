/** Canvas и его 2D-контекст, созданные для одного захвата. Внутренний тип. */
export interface CanvasSurfaceInterface {
  readonly canvas: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;
}
