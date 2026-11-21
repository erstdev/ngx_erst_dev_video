import type { Locale } from '../types/locale.type';
import { isLocale } from './is-locale.util';

/** Достаёт локаль из URL (`/en/docs/core` → `en`). */
export function localeFromUrl(url: string): Locale | null {
  const [pathname] = url.split(/[?#]/);
  const [firstSegment] = pathname.split('/').filter(Boolean);

  return isLocale(firstSegment) ? firstSegment : null;
}
