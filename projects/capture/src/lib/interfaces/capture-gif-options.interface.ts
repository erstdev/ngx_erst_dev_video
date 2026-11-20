/**
 * Настройки GIF из уже играющего видео.
 *
 * Кадры снимаются с текущего состояния `<video>`: сервис не запускает и не
 * перематывает воспроизведение.
 */
export interface CaptureGifOptions {
  /** Частота кадров GIF, от 1 до 30; по умолчанию `10`. */
  readonly fps?: number;
  /** Длительность записи в мс, от 100 до 15 000; по умолчанию `3000`. */
  readonly duration?: number;
  /** Ширина GIF в пикселях, от 16 до 640; по умолчанию `320`. */
  readonly width?: number;
  /** Зацикливать GIF через Netscape loop extension; по умолчанию `true`. */
  readonly loop?: boolean;
}
