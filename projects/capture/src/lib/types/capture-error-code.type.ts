/**
 * Машинно-читаемый код ошибки захвата.
 *
 * `unsupported` — нет нужного API или серверный рендеринг, `no-video` — у
 * элемента ещё нет кадра, `canvas-failed` — Canvas не смог отдать данные,
 * `recording-failed` — не удалось записать фрагмент, `gif-failed` — не удалось
 * закодировать GIF, `aborted` — запись отменена.
 */
export type CaptureErrorCode =
  | 'unsupported'
  | 'no-video'
  | 'canvas-failed'
  | 'recording-failed'
  | 'gif-failed'
  | 'aborted';
