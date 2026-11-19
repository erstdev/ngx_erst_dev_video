/**
 * Глава видео: точка на таймлайне с названием.
 *
 * @example
 * ```ts
 * const chapters: ChapterInterface[] = [
 *   { id: 'intro', time: 0, title: 'Вступление' },
 *   { id: 'main', time: 120, title: 'Основная часть' },
 * ];
 * ```
 */
export interface ChapterInterface {
  /** Стабильный идентификатор для `track` и аналитики. */
  readonly id?: string;
  /** Время начала главы в секундах. */
  readonly time: number;
  /** Название главы для подсказки и скринридера. */
  readonly title: string;
}
