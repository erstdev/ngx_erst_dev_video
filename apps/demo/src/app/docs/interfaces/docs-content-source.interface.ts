import type { DocsIndex } from './docs-index.interface';
import type { DocsPageData } from './docs-page-data.interface';

/**
 * Данные документации, доступные на сборке.
 *
 * Содержимое — ровно те же страницы и индексы, что уходят в
 * `public/docs-content`, но импортированные, а не запрошенные по HTTP: при
 * prerender в Node нет HTTP-сервера. Источник существует только на сервере.
 */
export interface DocsContentSource {
  readonly indexes: Readonly<Record<string, DocsIndex>>;
  readonly pages: Readonly<Record<string, DocsPageData>>;
}
