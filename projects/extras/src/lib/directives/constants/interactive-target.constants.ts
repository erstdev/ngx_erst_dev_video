/**
 * Элементы, внутри которых жест или клавиша принадлежат контролу, а не плееру.
 *
 * `contenteditable="false"` исключён: такой элемент редактируемым не является.
 */
export const INTERACTIVE_SELECTOR =
  'input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])';
