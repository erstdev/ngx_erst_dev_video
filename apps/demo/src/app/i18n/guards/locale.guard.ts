import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { DEFAULT_LOCALE } from '../constants/locale.constants';
import { isLocale } from '../utils/is-locale.util';

/**
 * Не пускает в `/:locale/...` неизвестную локаль: заменяет первый сегмент
 * на локаль по умолчанию и сохраняет остальной путь.
 */
export const localeGuard: CanActivateFn = (route, state) => {
  const locale = route.paramMap.get('locale');
  if (isLocale(locale)) return true;

  const router = inject(Router);
  const rest = state.url.replace(/^\/[^/?#]+/, '');

  return router.parseUrl(`/${DEFAULT_LOCALE}${rest}`);
};
