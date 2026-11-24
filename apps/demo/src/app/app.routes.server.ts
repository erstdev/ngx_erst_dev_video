import { RenderMode, ServerRoute } from '@angular/ssr';

import {
  DOCS_API_PAGES,
  DOCS_PACKAGES,
} from './docs/generated/docs-content.generated';
import { SUPPORTED_LOCALES } from './i18n/constants/locale.constants';

/**
 * Режимы рендера маршрутов при сборке.
 *
 * Документация статическая: README и API-справка одинаковы для всех
 * посетителей, а данные доступны на сборке через сгенерированный серверный
 * модуль. Живые демо остаются клиентскими: им нужны браузер, медиа и
 * `MediaRecorder`.
 *
 * Списки параметров берутся из того же сгенерированного модуля, что и данные,
 * поэтому маршруты не могут разойтись с содержимым.
 */
const localeParams = (): Record<string, string>[] =>
  SUPPORTED_LOCALES.map((locale) => ({ locale }));

export const serverRoutes: ServerRoute[] = [
  {
    path: ':locale',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => localeParams(),
  },
  {
    path: ':locale/docs',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => localeParams(),
  },
  {
    path: ':locale/docs/:pkg',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      SUPPORTED_LOCALES.flatMap((locale) =>
        DOCS_PACKAGES.map((pkg) => ({ locale, pkg })),
      ),
  },
  { path: ':locale/docs/:pkg/:brick', renderMode: RenderMode.Client },
  {
    path: ':locale/docs/:pkg/:brick/api',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      SUPPORTED_LOCALES.flatMap((locale) =>
        DOCS_API_PAGES.map(({ pkg, brick }) => ({ locale, pkg, brick })),
      ),
  },
  { path: '**', renderMode: RenderMode.Client },
];
