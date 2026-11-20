/**
 * Настройки записи фрагмента.
 *
 * Значения — подсказки для `MediaRecorder`: браузер может выбрать другой
 * битрейт или MIME, если переданный не поддержан.
 */
export interface RecordClipOptions {
  /** Явный MIME-тип записи; если не задан, выбирается первый поддержанный. */
  readonly mimeType?: string;
  /** Битрейт видео в бит/с; по умолчанию `2 500 000`. */
  readonly videoBitsPerSecond?: number;
  /** Битрейт звука в бит/с; по умолчанию `128 000`. */
  readonly audioBitsPerSecond?: number;
  /** Интервал отдачи данных в мс; `0` — без `timeslice`; по умолчанию `1000`. */
  readonly timeslice?: number;
}
