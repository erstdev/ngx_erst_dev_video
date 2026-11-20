/**
 * Контекст, доступный в пользовательском шаблоне индикатора ClipRecorder.
 *
 * @example
 * ```html
 * <ng-template #indicator let-recording="recording" let-stopping="stopping">
 *   <span>{{ stopping ? '…' : recording ? 'REC' : 'IDLE' }}</span>
 * </ng-template>
 * ```
 */
export interface ClipRecorderIndicatorContext {
  /** Запись активна: старт уже выполнен, стоп ещё не завершён. */
  readonly recording: boolean;
  /** Запись останавливается: `ClipRecording.stop()` уже вызван. */
  readonly stopping: boolean;
}
