import type { CaptureFrameType } from '@erst_dev/ngx-video-capture';

import { FRAME_EXTENSIONS } from '../constants/screenshot-button-demo.constants';

/** Имя, которое покажет демо; компонент собирает его по тем же правилам. */
export function buildDemoFileName(
  fileName: string,
  type: CaptureFrameType,
): string {
  const base = fileName
    .trim()
    .replace(/\.(?:png|jpe?g|webp)$/i, '')
    .trim();

  return `${base || 'screenshot'}${FRAME_EXTENSIONS[type]}`;
}
