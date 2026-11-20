/** Подписи кнопок и их доступные имена. */
export const CLIP_RECORDER_LABELS = {
  start: 'Начать запись',
  stop: 'Остановить',
  startAria: 'Начать запись',
  stopAria: 'Остановить запись',
} as const;

/** Лимит записи по умолчанию, секунды. */
export const CLIP_RECORDER_DEFAULT_MAX_DURATION = 30;

/** Минимальный лимит записи: `0` — без ограничения. */
export const CLIP_RECORDER_MIN_MAX_DURATION = 0;

/** Максимальный лимит записи, секунды. */
export const CLIP_RECORDER_MAX_MAX_DURATION = 3600;

/** Интервал обновления таймера, мс. */
export const CLIP_RECORDER_TIMER_INTERVAL_MS = 250;

/** `aria-label` группы по умолчанию. */
export const CLIP_RECORDER_GROUP_ARIA_LABEL = 'Запись клипа';
