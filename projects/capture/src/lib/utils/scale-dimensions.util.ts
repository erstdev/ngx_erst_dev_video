import type { VideoSizeInterface } from '../interfaces';

/**
 * Размер кадра с сохранением пропорций.
 *
 * Ограничения — максимум, а не цель: кадр не увеличивается. Если лимит не
 * задан или некорректен, размер остаётся нативным.
 */
export function scaleDimensions(
  width: number,
  height: number,
  maxWidth?: number,
  maxHeight?: number,
): VideoSizeInterface {
  const scale = Math.min(
    1,
    maxWidth ? maxWidth / width : 1,
    maxHeight ? maxHeight / height : 1,
  );
  const scaledWidth = Math.max(1, Math.round(width * scale));
  const scaledHeight = Math.max(1, Math.round(height * scale));

  return {
    width: maxWidth ? Math.min(scaledWidth, maxWidth) : scaledWidth,
    height: maxHeight ? Math.min(scaledHeight, maxHeight) : scaledHeight,
  };
}
