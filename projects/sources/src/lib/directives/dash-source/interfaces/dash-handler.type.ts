/**
 * Обработчик события dash.js.
 *
 * События приходят одним объектом, состав которого зависит от типа события;
 * директиве нужны только `STREAM_INITIALIZED`, `QUALITY_CHANGE_RENDERED`,
 * `ERROR` и `PLAYBACK_NOT_ALLOWED`, поэтому данные приходят как `unknown`.
 */
export type DashHandler = (event: unknown) => void;
