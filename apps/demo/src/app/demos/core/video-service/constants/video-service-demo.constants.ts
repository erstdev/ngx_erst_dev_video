import type { VideoState } from '@erst_dev/ngx-video-core';

/** Человекочитаемые подписи для значений `VideoState`. */
export const STATE_LABELS: Readonly<Record<VideoState, string>> = {
  idle: 'idle — нет данных',
  playing: 'playing — воспроизведение',
  paused: 'paused — пауза',
  buffering: 'buffering — буферизация',
  seeking: 'seeking — перемотка',
  ended: 'ended — завершено',
  error: 'error — ошибка',
};
