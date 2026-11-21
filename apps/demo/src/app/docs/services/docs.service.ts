import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

import type { Locale } from '../../i18n/types/locale.type';
import type { DocsIndex } from '../interfaces/docs-index.interface';
import type { DocsPageData } from '../interfaces/docs-page-data.interface';

/**
 * Загрузка сгенерированных JSON-ассетов документации из `public/docs-content`.
 *
 * Ассеты лежат вне `/docs`, чтобы не конфликтовать с маршрутами SPA.
 * Промисы кешируются: сайдбар и страница запрашивают один и тот же index.json.
 */
@Injectable({ providedIn: 'root' })
export class DocsService {
  private readonly document = inject(DOCUMENT);
  private readonly cache = new Map<string, Promise<unknown>>();

  loadIndex(locale: Locale): Promise<DocsIndex> {
    return this.load<DocsIndex>(`docs-content/${locale}/index.json`);
  }

  loadPage(locale: Locale, pkg: string, brick?: string): Promise<DocsPageData> {
    const file = brick ? `${pkg}/${brick}.json` : `${pkg}.json`;

    return this.load<DocsPageData>(`docs-content/${locale}/${file}`);
  }

  private load<T>(relativePath: string): Promise<T> {
    const cached = this.cache.get(relativePath);
    if (cached) return cached as Promise<T>;

    const base = this.document.baseURI || '/';
    const url = new URL(relativePath, base);
    const request = fetch(url).then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `Не удалось загрузить ${url.pathname}: ${response.status}`,
        );
      }

      return (await response.json()) as T;
    });

    request.catch(() => this.cache.delete(relativePath));
    this.cache.set(relativePath, request);

    return request;
  }
}
