import type { CaptureFrameType } from '../types';

/**
 * Настройки захвата кадра.
 *
 * Все поля необязательные: по умолчанию кадр отдаётся в `image/png` с
 * нативным размером видео.
 */
export interface CaptureFrameOptions {
  /** MIME-тип результата; по умолчанию `image/png`. */
  readonly type?: CaptureFrameType;
  /** Качество для `image/jpeg` и `image/webp`, от 0 до 1; по умолчанию `0.92`. */
  readonly quality?: number;
  /** Максимальная ширина кадра в пикселях; кадр не увеличивается. */
  readonly maxWidth?: number;
  /** Максимальная высота кадра в пикселях; кадр не увеличивается. */
  readonly maxHeight?: number;
}
