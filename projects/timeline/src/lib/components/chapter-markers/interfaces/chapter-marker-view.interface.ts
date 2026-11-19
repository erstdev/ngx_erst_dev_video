import type { ChapterInterface } from './chapter.interface';

/**
 * Внутреннее представление маркера: глава и её позиция в процентах.
 *
 * Используется только шаблоном `ChapterMarkersComponent` и не экспортируется
 * через публичный баррел пакета.
 */
export interface ChapterMarkerView {
  readonly chapter: ChapterInterface;
  readonly percent: number;
}
