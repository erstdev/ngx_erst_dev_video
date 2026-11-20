/**
 * Контекст, доступный в пользовательском шаблоне иконки ScreenshotButton.
 *
 * @example
 * ```html
 * <ng-template #icon let-capturing="capturing">...</ng-template>
 * ```
 */
export interface ScreenshotButtonIconContext {
  /** Кадр снимается прямо сейчас: кнопка заблокирована. */
  readonly capturing: boolean;
}
