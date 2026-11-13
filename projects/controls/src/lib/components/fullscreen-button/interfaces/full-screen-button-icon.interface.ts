/**
 * Контекст, доступный в пользовательском шаблоне иконки FullscreenButton.
 *
 * @example
 * ```html
 * <ng-template #icon let-fullscreen="fullscreen">...</ng-template>
 * ```
 */
export interface FullscreenButtonIconContext {
  /** Полноэкранный режим включён. */
  readonly fullscreen: boolean;
}
