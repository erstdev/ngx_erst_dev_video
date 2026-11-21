import type { Locale } from '../types/locale.type';

/**
 * Локали сайта и правила работы с ними.
 *
 * Документация и UI-строки живут в двух локалях. Префикс локали — первый
 * сегмент URL (`/ru/...`, `/en/...`), поэтому переключение языка не теряет
 * текущую страницу: меняется только первый сегмент.
 */
export const SUPPORTED_LOCALES = ['ru', 'en'] as const;

/**
 * Локаль по умолчанию — `en` (docs/roadmap.md, шаг 2: `/` ведёт на `/en/`).
 * На время перевода здесь стоял `ru`, чтобы сайт не открывался на английском
 * с фолбэком на каждой странице; после перевода всех 25 README — снова `en`.
 */
export const DEFAULT_LOCALE: Locale = 'en';

/** Ключ в localStorage, в котором запоминается выбор языка. */
export const LOCALE_STORAGE_KEY = 'ngx-video.locale';
