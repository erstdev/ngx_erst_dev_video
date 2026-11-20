import type { VideoSizeInterface } from '../../interfaces';

/**
 * Размер GIF: ширина берётся из настроек, высота — по пропорциям видео.
 *
 * Ширина не ограничивается сверху нативным размером: `CaptureGifOptions.width`
 * задаёт точную ширину результата.
 */
export function gifDimensions(
  videoWidth: number,
  videoHeight: number,
  width: number,
): VideoSizeInterface {
  const targetWidth = Math.max(1, Math.round(width));
  const targetHeight = Math.max(
    1,
    Math.round((videoHeight * targetWidth) / videoWidth),
  );

  return { width: targetWidth, height: targetHeight };
}
