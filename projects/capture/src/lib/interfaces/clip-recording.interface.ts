import type { Signal } from '@angular/core';

import type { ClipRecordingState } from '../types';

/**
 * Запись фрагмента, которую вернул `CaptureService.recordClip()`.
 *
 * Запись начинается сразу после вызова `recordClip()`. Наблюдать за
 * состоянием можно через сигнал `state`, остановить — методом `stop()`,
 * отменить — методом `cancel()`.
 */
export interface ClipRecording {
  /** Текущее состояние записи. */
  readonly state: Signal<ClipRecordingState>;
  /**
   * Останавливает запись и отдаёт готовый `Blob` с реальным MIME-типом.
   *
   * Идемпотентно: повторный вызов возвращает тот же промис.
   */
  stop(): Promise<Blob>;
  /**
   * Отменяет запись: останавливает `MediaRecorder`, выбрасывает данные и
   * останавливает треки `MediaStream`. Ожидающий `stop()` отклоняется с
   * ошибкой `aborted`.
   */
  cancel(): void;
}
