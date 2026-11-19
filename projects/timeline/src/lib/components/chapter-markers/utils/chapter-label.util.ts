import { formatTime } from '@erst_dev/ngx-video-core';

import type { ChapterInterface } from '../interfaces';

/** Подпись маркера главы для скринридера: название и отформатированное время. */
export const chapterLabel = (chapter: ChapterInterface): string =>
  `Глава: ${chapter.title}, ${formatTime(chapter.time)}`;
