import type { VideoState } from '../../types';

/**
 * Вычисляет состояние плеера по текущему состоянию медиа-элемента.
 *
 * Порядок проверок важен: ошибка и конец воспроизведения приоритетнее
 * `readyState`, иначе завершённое видео выглядело бы как пауза.
 */
export const resolveState = (element: HTMLVideoElement): VideoState => {
  if (element.error) {
    return 'error';
  }

  if (element.ended) {
    return 'ended';
  }

  if (element.readyState === 0) {
    return 'idle';
  }

  return element.paused ? 'paused' : 'playing';
};
