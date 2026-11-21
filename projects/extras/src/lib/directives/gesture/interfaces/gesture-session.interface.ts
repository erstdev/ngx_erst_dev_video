import type { GestureAxis } from '../utils';

/** Состояние одного отслеживаемого указателя. */
export interface GestureSession {
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly width: number;
  readonly height: number;
  readonly startsOnLeft: boolean;
  axis: GestureAxis | null;
  dx: number;
  dy: number;
}
