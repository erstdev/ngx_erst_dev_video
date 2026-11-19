import type { SubtitleCueInterface } from '../interfaces';

/**
 * Возвращает cues, активные в `currentTime`.
 *
 * Активен cue, у которого `start <= currentTime < end`. Порядок cues
 * сохраняется таким же, как в файле. При неконечном времени активных cues нет.
 */
export const findActiveCues = (
  cues: readonly SubtitleCueInterface[],
  currentTime: number,
): readonly SubtitleCueInterface[] => {
  if (!Number.isFinite(currentTime)) {
    return [];
  }

  return cues.filter(
    (cue) => cue.start <= currentTime && currentTime < cue.end,
  );
};
