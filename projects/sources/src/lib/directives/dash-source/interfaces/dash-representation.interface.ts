/**
 * Минимальное описание представления DASH, которое нужно кирпичу.
 *
 * Повторяет только используемые поля `Representation` из dash.js, поэтому типы
 * библиотеки не протекают в публичный API пакета.
 */
export interface DashRepresentationInterface {
  readonly id?: string;
  readonly width?: number;
  readonly height?: number;
  readonly bandwidth?: number;
  readonly bitrateInKbit?: number;
}
