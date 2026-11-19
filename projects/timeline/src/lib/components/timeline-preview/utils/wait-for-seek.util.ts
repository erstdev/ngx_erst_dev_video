/**
 * Ждёт завершения seek, но не блокирует компонент навсегда при ошибке.
 *
 * Ограничение по времени возвращает управление, даже если браузер не прислал
 * `seeked` (например, для защищённого источника).
 */
export const waitForSeek = (
  video: HTMLVideoElement,
  timeout = 1500,
): Promise<void> =>
  new Promise((resolve) => {
    const done = (): void => {
      clearTimeout(timer);
      video.removeEventListener('seeked', done);
      video.removeEventListener('error', done);
      resolve();
    };

    const timer = setTimeout(done, timeout);
    video.addEventListener('seeked', done);
    video.addEventListener('error', done);
  });
