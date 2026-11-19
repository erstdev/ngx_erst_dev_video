import type { DashHandler } from './dash-handler.type';
import type { DashRepresentationInterface } from './dash-representation.interface';

/** Минимальная часть API экземпляра player'а dash.js, которая нужна директиве. */
export interface DashPlayerInterface {
  initialize(
    view: HTMLVideoElement,
    source: string,
    autoPlay: boolean,
    startTime?: number | string,
  ): void;
  on(event: string, handler: DashHandler): void;
  off(event: string, handler: DashHandler): void;
  getRepresentationsByType(
    type: string,
  ): readonly DashRepresentationInterface[];
  setRepresentationForTypeByIndex(
    type: string,
    index: number,
    forceReplace?: boolean,
  ): void;
  updateSettings(settings: object): void;
  reset(): void;
  destroy(): void;
}
