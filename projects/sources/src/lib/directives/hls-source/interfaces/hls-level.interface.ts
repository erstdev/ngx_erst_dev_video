/**
 * Минимальное описание уровня hls.js, которое нужно кирпичу.
 *
 * Повторяет только используемые поля `Level` из `hls.js`, поэтому типы
 * библиотеки не протекают в публичный API пакета.
 */
export interface HlsLevelLike {
  readonly width?: number;
  readonly height?: number;
  readonly bitrate?: number;
  readonly name?: string;
}
