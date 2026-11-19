import type { DashRepresentationInterface } from './dash-representation.interface';

/** Поля события `QUALITY_CHANGE_RENDERED`, которые использует директива. */
export interface DashQualityChangeEventInterface {
  readonly mediaType?: string;
  readonly newRepresentation?: DashRepresentationInterface | null;
}
