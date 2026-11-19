/**
 * Контекст, доступный в пользовательском шаблоне preview у TimelineComponent.
 *
 * @example
 * ```html
 * <ng-template #preview let-time="time">...</ng-template>
 * ```
 */
export interface TimelinePreviewContext {
  /** Время под курсором в секундах. */
  readonly time: number;
}
