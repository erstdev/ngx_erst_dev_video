import type { CaptureFrameType } from '../types';

/** Настройки захвата кадра после проверки и зажима значений. Внутренний тип. */
export interface NormalizedFrameOptions {
  readonly type: CaptureFrameType;
  readonly quality: number;
  readonly maxWidth?: number;
  readonly maxHeight?: number;
}
