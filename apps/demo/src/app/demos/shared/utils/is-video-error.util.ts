import type { VideoError } from '@erst_dev/ngx-video-core';

/** Отличает `VideoError` директивы от нативного события `error` на `<video>`. */
export function isVideoError(value: unknown): value is VideoError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { code?: unknown; message?: unknown };

  return (
    typeof candidate.code === 'string' && typeof candidate.message === 'string'
  );
}
