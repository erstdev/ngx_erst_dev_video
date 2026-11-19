import type { VideoErrorCode } from '../../types';

/**
 * Переводит числовой код `MediaError` в код ошибки пакета.
 *
 * Неизвестные и отсутствующие коды становятся `unknown`.
 */
export const resolveErrorCode = (nativeCode: number): VideoErrorCode => {
  switch (nativeCode) {
    case 1:
      return 'aborted';
    case 2:
      return 'network';
    case 3:
      return 'decode';
    case 4:
      return 'source-not-supported';
    default:
      return 'unknown';
  }
};
