import type { VideoState } from '@erst_dev/ngx-video-core';

/**
 * Контекст, доступный в пользовательском шаблоне иконки
 * ClickToPlayOverlay.
 *
 * @example
 * ```html
 * <ng-template #icon let-state="state">...</ng-template>
 * ```
 */
export interface ClickToPlayOverlayIconContext {
  /** Текущее состояние плеера. */
  readonly state: VideoState;
}
