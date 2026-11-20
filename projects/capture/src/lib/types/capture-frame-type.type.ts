/**
 * MIME-тип кадра, который умеет отдавать Canvas.
 *
 * `image/png` — без потерь, `image/jpeg` и `image/webp` — с потерями и
 * настройкой качества.
 */
export type CaptureFrameType = 'image/png' | 'image/jpeg' | 'image/webp';
