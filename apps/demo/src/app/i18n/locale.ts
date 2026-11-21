/**
 * Локали сайта и правила работы с ними.
 *
 * Документация и UI-строки живут в двух локалях. Префикс локали — первый
 * сегмент URL (`/ru/...`, `/en/...`), поэтому переключение языка не теряет
 * текущую страницу: меняется только первый сегмент.
 */

export const SUPPORTED_LOCALES = ['ru', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Локаль по умолчанию.
 *
 * Пока переводы README не готовы — `ru`. После перевода всех 25 файлов
 * значение переключается на `en` (docs/roadmap.md, шаг 2). То же значение
 * продублировано в `tools/docs/generate.mjs` для манифеста ассетов.
 */
export const DEFAULT_LOCALE: Locale = 'ru';

/** Ключ в localStorage, в котором запоминается выбор языка. */
export const LOCALE_STORAGE_KEY = 'ngx-video.locale';

/** Проверяет, что строка — поддерживаемая локаль. */
export function isLocale(value: unknown): value is Locale {
  return value === 'ru' || value === 'en';
}

/** Достаёт локаль из URL (`/en/docs/core` → `en`). */
export function localeFromUrl(url: string): Locale | null {
  const [pathname] = url.split(/[?#]/);
  const [firstSegment] = pathname.split('/').filter(Boolean);

  return isLocale(firstSegment) ? firstSegment : null;
}
