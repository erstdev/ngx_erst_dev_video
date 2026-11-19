import { INTERACTIVE_SELECTOR } from '../constants';

/** Цель события — поле ввода, селект, кнопка, ссылка или редактируемая область. */
export const isInteractiveTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) {
    return false;
  }

  const element = target as HTMLElement;

  return (
    element.isContentEditable || element.closest(INTERACTIVE_SELECTOR) !== null
  );
};
