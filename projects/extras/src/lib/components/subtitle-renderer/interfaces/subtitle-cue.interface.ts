/**
 * Разобранный cue WebVTT во внутреннем представлении кирпича.
 *
 * Интерфейс не экспортируется в публичный API пакета.
 */
export interface SubtitleCueInterface {
  /** Начало cue в секундах. */
  readonly start: number;

  /** Конец cue в секундах; в активный интервал не включается. */
  readonly end: number;

  /** Текст без HTML-тегов и с декодированными базовыми сущностями. */
  readonly text: string;
}
