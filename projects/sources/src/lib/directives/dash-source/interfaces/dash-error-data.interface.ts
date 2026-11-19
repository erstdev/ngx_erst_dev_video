/**
 * Ошибка dash.js (`DashJSError`), которую несёт событие `ERROR`.
 *
 * В dash.js 5.x это объект с числовым `code`, текстовым `message` и
 * произвольными `data`; поля необязательные, чтобы маппинг не падал на
 * нестандартных значениях.
 */
export interface DashJsErrorInterface {
  readonly code?: number;
  readonly message?: string;
  readonly data?: unknown;
}

/** Поля события `ERROR` dash.js, которые участвуют в маппинге в `VideoError`. */
export interface DashErrorDataInterface {
  readonly error?: DashJsErrorInterface | string | null;
}
