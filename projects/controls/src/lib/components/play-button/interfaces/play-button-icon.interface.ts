import type { VideoState } from '@erst_dev/ngx-video-core';

/**
 * Контекст, доступный в пользовательском шаблоне иконки PlayButton.
 *
 * @example
 * ```html
 * <ng-template #icon let-playing="playing" let-state="state">...</ng-template>
 * ```
 */
export interface PlayButtonIconContext {
  /** Текущее состояние плеера. */
  readonly state: VideoState;
  /** Идёт воспроизведение или буферизация. */
  readonly playing: boolean;
}
