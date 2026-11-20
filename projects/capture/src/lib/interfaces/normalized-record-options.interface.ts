/** Настройки записи после проверки и зажима значений. Внутренний тип. */
export interface NormalizedRecordOptions {
  readonly mimeType?: string;
  readonly videoBitsPerSecond: number;
  readonly audioBitsPerSecond: number;
  readonly timeslice: number;
}
