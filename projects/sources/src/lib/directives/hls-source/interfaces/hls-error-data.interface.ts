/** Поля ошибки hls.js, которые участвуют в маппинге в `VideoError`. */
export interface HlsErrorDataLike {
  readonly type?: string;
  readonly details?: string;
  readonly fatal?: boolean;
}
