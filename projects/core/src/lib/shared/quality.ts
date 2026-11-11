/**
 * Описание доступного уровня качества.
 *
 * Используется пакетом `ngx-video-sources` (HLS/DASH) и компонентами выбора качества.
 */
export interface Quality {
  /** Стабильный идентификатор уровня (например, `"720p"` или `"auto"`). */
  readonly id: string;
  /** Подпись для интерфейса (например, `"720p"`). */
  readonly label: string;
  /** Ширина кадра в пикселях, если известна. */
  readonly width?: number;
  /** Высота кадра в пикселях, если известна. */
  readonly height?: number;
  /** Битрейт в битах в секунду, если известен. */
  readonly bitrate?: number;
}
