import type { Locale } from '../types/locale.type';

/** Проверяет, что строка — поддерживаемая локаль. */
export function isLocale(value: unknown): value is Locale {
  return value === 'ru' || value === 'en';
}
