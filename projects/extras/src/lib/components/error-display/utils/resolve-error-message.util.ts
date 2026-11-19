import type { VideoError } from '@erst_dev/ngx-video-core';

import { FALLBACK_MESSAGE } from '../constants';

/** Текст ошибки; пустой `message` заменяется на нейтральный fallback. */
export const resolveErrorMessage = (error: VideoError | null): string =>
  error?.message.trim() || FALLBACK_MESSAGE;
