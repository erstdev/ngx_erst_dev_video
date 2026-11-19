/**
 * Значение `aria-keyshortcuts` для включённой директивы.
 *
 * Используются имена клавиш из `KeyboardEvent.key`: `Space` и `ArrowRight`
 * вместо символов, `F`/`M` — без учёта регистра. Модификаторы не входят:
 * директива обрабатывает клавиши только без Ctrl, Meta и Alt.
 */
export const ARIA_KEYSHORTCUTS =
  'Space ArrowRight ArrowLeft ArrowUp ArrowDown F M';
