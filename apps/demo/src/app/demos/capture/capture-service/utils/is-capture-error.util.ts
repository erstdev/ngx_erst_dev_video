import type { CaptureError } from '@erst_dev/ngx-video-capture';

/** Отличает `CaptureError` от любого другого исключения. */
export function isCaptureError(value: unknown): value is CaptureError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { code?: unknown; message?: unknown };

  return (
    typeof candidate.code === 'string' && typeof candidate.message === 'string'
  );
}
