import type { CaptureErrorCode, CaptureFrameType } from '../types';

/** MIME-тип кадра по умолчанию. */
export const CAPTURE_DEFAULT_FRAME_TYPE: CaptureFrameType = 'image/png';

/** MIME-типы кадра, которые поддерживает Canvas и публичный API. */
export const CAPTURE_FRAME_TYPES: readonly CaptureFrameType[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
];

/** Качество кадра по умолчанию для `image/jpeg` и `image/webp`. */
export const CAPTURE_DEFAULT_QUALITY = 0.92;

/** Битрейт видео по умолчанию при записи фрагмента. */
export const CAPTURE_DEFAULT_VIDEO_BITS_PER_SECOND = 2_500_000;

/** Битрейт звука по умолчанию при записи фрагмента. */
export const CAPTURE_DEFAULT_AUDIO_BITS_PER_SECOND = 128_000;

/** Интервал отдачи данных по умолчанию, мс. */
export const CAPTURE_DEFAULT_TIMESLICE = 1000;

/** Нижняя граница битрейта: значения ниже браузер всё равно округлит. */
export const CAPTURE_MIN_BITS_PER_SECOND = 1_000;

/** Верхняя граница битрейта, чтобы опечатка не съела память. */
export const CAPTURE_MAX_BITS_PER_SECOND = 50_000_000;

/** Верхняя граница `timeslice`: больше минуты держать чанки смысла нет. */
export const CAPTURE_MAX_TIMESLICE = 60_000;

/** Кандидаты MIME-типа записи в порядке приоритета. */
export const CAPTURE_MIME_CANDIDATES: readonly string[] = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4',
];

/** Частота кадров GIF по умолчанию. */
export const CAPTURE_GIF_DEFAULT_FPS = 10;

/** Минимальная частота кадров GIF. */
export const CAPTURE_GIF_MIN_FPS = 1;

/** Максимальная частота кадров GIF. */
export const CAPTURE_GIF_MAX_FPS = 30;

/** Длительность GIF по умолчанию, мс. */
export const CAPTURE_GIF_DEFAULT_DURATION = 3000;

/** Минимальная длительность GIF, мс. */
export const CAPTURE_GIF_MIN_DURATION = 100;

/** Максимальная длительность GIF, мс. */
export const CAPTURE_GIF_MAX_DURATION = 15_000;

/** Ширина GIF по умолчанию, px. */
export const CAPTURE_GIF_DEFAULT_WIDTH = 320;

/** Минимальная ширина GIF, px. */
export const CAPTURE_GIF_MIN_WIDTH = 16;

/** Максимальная ширина GIF, px. */
export const CAPTURE_GIF_MAX_WIDTH = 640;

/** Зацикливать GIF по умолчанию. */
export const CAPTURE_GIF_DEFAULT_LOOP = true;

/**
 * Тексты сообщений об ошибках захвата.
 *
 * `code` — контракт, текст можно менять. Ядро не экспортирует свои тексты,
 * поэтому пакет держит собственные.
 */
export const CAPTURE_ERROR_MESSAGES: Readonly<
  Record<CaptureErrorCode, string>
> = {
  unsupported: 'Захват видео не поддерживается в этом окружении.',
  'no-video': 'У видео ещё нет кадра — дождитесь загрузки метаданных.',
  'canvas-failed': 'Не удалось получить кадр через Canvas.',
  'recording-failed': 'Не удалось записать фрагмент видео.',
  'gif-failed': 'Не удалось создать GIF.',
  aborted: 'Запись отменена.',
};
