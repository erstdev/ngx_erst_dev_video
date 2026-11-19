/**
 * Ждёт метаданные видео, чтобы можно было выставить `currentTime`.
 *
 * Ограничение по времени не даёт компоненту зависнуть, если источник не
 * ответил или сразу завершился ошибкой.
 */
export const waitForMetadata = (
  video: HTMLVideoElement,
  timeout = 4000,
): Promise<void> => {
  if (video.readyState >= 1) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const done = (): void => {
      clearTimeout(timer);
      video.removeEventListener('loadedmetadata', done);
      video.removeEventListener('error', done);
      resolve();
    };

    const timer = setTimeout(done, timeout);
    video.addEventListener('loadedmetadata', done);
    video.addEventListener('error', done);
  });
};
