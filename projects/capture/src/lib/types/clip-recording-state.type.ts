/**
 * Состояние записи фрагмента.
 *
 * `recording` — идёт запись, `stopped` — запись завершена и `Blob` отдан,
 * `cancelled` — запись отменена потребителем, `error` — `MediaRecorder` упал
 * или вернул пустые данные.
 */
export type ClipRecordingState =
  'recording' | 'stopped' | 'cancelled' | 'error';
