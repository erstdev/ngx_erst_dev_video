import type { CaptureFrameType } from '@erst_dev/ngx-video-capture';

/** Расширения для подписи имени файла в демо. */
export const FRAME_EXTENSIONS: Readonly<Record<CaptureFrameType, string>> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};
