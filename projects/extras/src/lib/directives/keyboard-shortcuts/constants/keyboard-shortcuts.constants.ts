/**
 * Элементы, внутри которых клавиши принадлежат контролу, а не плееру.
 *
 * `contenteditable="false"` исключён: такой элемент редактируемым не является.
 */
export const INTERACTIVE_SELECTOR =
  'input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])';

/**
 * Значение `aria-keyshortcuts` для включённой директивы.
 *
 * Используются имена клавиш из `KeyboardEvent.key`: `Space` и `ArrowRight`
 * вместо символов, `F`/`M` — без учёта регистра. Модификаторы не входят:
 * директива обрабатывает клавиши только без Ctrl, Meta и Alt.
 */
export const ARIA_KEYSHORTCUTS =
  'Space ArrowRight ArrowLeft ArrowUp ArrowDown F M';
