/**
 * Обработчик события hls.js.
 *
 * Состав `data` зависит от события, поэтому приходит как `unknown`: директиве
 * нужны только `MANIFEST_PARSED`, `LEVEL_SWITCHED` и `ERROR`.
 */
export type HlsHandler = (event: string, data: unknown) => void;
