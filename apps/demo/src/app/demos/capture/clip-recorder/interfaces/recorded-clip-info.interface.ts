/** Итог последней записи для предпросмотра и статуса. */
export interface RecordedClipInfo {
  readonly mimeType: string;
  readonly size: number;
  readonly durationMs: number;
  readonly fileName: string;
}
