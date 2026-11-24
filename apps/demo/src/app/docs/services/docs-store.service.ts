import {
  Injectable,
  TransferState,
  inject,
  makeStateKey,
  signal,
} from '@angular/core';

import { isLocale } from '../../i18n/utils/is-locale.util';
import type { DocsIndex } from '../interfaces/docs-index.interface';
import type { DocsPageData } from '../interfaces/docs-page-data.interface';
import { DOCS_CONTENT_SOURCE } from '../tokens/docs-content-source.token';
import { DocsService } from './docs.service';

/** Ключ страницы в источнике и в `TransferState`: `<локаль>/<пакет>[/<кирпич>]`. */
function pageKey(locale: string, pkg: string, brick: string | null): string {
  return brick ? `${locale}/${pkg}/${brick}` : `${locale}/${pkg}`;
}

const indexStateKey = (locale: string) =>
  makeStateKey<DocsIndex>(`docs-index:${locale}`);

const pageStateKey = (key: string) =>
  makeStateKey<DocsPageData>(`docs-page:${key}`);

/**
 * Синхронный доступ к документации: экран получает данные до первого рендера.
 *
 * Порядок источников: уже загруженное (signal) → `TransferState` после
 * пререндера → сгенерированный серверный модуль → JSON-ассет. Первые три
 * синхронны, поэтому серверный и клиентский первый рендер совпадают и
 * hydration не находит расхождений. JSON нужен только клиентским переходам,
 * которых не было при сборке.
 */
@Injectable({ providedIn: 'root' })
export class DocsStore {
  private readonly docs = inject(DocsService);
  private readonly transferState = inject(TransferState);
  private readonly source = inject(DOCS_CONTENT_SOURCE);

  private readonly indexCache = signal<Readonly<Record<string, DocsIndex>>>({});
  private readonly pageCache = signal<Readonly<Record<string, DocsPageData>>>(
    {},
  );

  /** Индекс локали, если данные уже доступны; иначе `null`. */
  index(locale: string): DocsIndex | null {
    if (!isLocale(locale)) return null;

    const cached = this.indexCache()[locale];
    if (cached) return cached;

    const transferred = this.transferState.get(indexStateKey(locale), null);
    if (transferred) return transferred;

    return this.source?.indexes[locale] ?? null;
  }

  /** Страница документации, если данные уже доступны; иначе `null`. */
  page(locale: string, pkg: string, brick: string | null): DocsPageData | null {
    if (!isLocale(locale) || !pkg) return null;

    const key = pageKey(locale, pkg, brick);
    const cached = this.pageCache()[key];
    if (cached) return cached;

    const transferred = this.transferState.get(pageStateKey(key), null);
    if (transferred) return transferred;

    return this.source?.pages[key] ?? null;
  }

  /**
   * Resolver документации: на сборке данные синхронны и попадают в
   * `TransferState` для клиента; в браузере это мгновенный ответ либо
   * загрузка JSON.
   */
  resolveIndex(locale: string): DocsIndex | null | Promise<DocsIndex | null> {
    if (!isLocale(locale)) return null;

    const found = this.index(locale);
    if (found) {
      this.transferState.set(indexStateKey(locale), found);
      return found;
    }

    if (this.source) throw missing(`индекса документации ${locale}`);

    return this.docs.loadIndex(locale).then(
      (index) => this.putIndex(locale, index),
      () => null,
    );
  }

  /** Resolver страницы: см. `resolveIndex`. */
  resolvePage(
    locale: string,
    pkg: string,
    brick: string | null,
  ): DocsPageData | null | Promise<DocsPageData | null> {
    if (!isLocale(locale) || !pkg) return null;

    const key = pageKey(locale, pkg, brick);
    const found = this.page(locale, pkg, brick);
    if (found) {
      this.transferState.set(pageStateKey(key), found);
      return found;
    }

    if (this.source) throw missing(`страницы ${key}`);

    return this.docs.loadPage(locale, pkg, brick ?? undefined).then(
      (page) => this.putPage(key, page),
      () => null,
    );
  }

  /**
   * Клиентская подгрузка индекса для сайдбара на демо-страницах: они остаются
   * `RenderMode.Client`, resolver там не работает.
   */
  async ensureIndex(locale: string): Promise<DocsIndex | null> {
    if (!isLocale(locale)) return null;

    const found = this.index(locale);
    if (found) return found;

    try {
      return this.putIndex(locale, await this.docs.loadIndex(locale));
    } catch {
      return null;
    }
  }

  private putIndex(locale: string, index: DocsIndex): DocsIndex {
    this.indexCache.update((cache) => ({ ...cache, [locale]: index }));
    return index;
  }

  private putPage(key: string, page: DocsPageData): DocsPageData {
    this.pageCache.update((cache) => ({ ...cache, [key]: page }));
    return page;
  }
}

/**
 * На сборке данные обязаны быть: если параметры prerender разошлись с
 * генератором, лучше уронить сборку, чем выпустить пустые страницы.
 */
function missing(what: string): Error {
  return new Error(
    `Нет данных документации для ${what}. Проверьте tools/docs/generate.mjs и параметры prerender.`,
  );
}
