import type { DocsIndexEntry } from './docs-index-entry.interface';

/** Пакет в индексе документации: сам пакет и его кирпичи. */
export interface DocsIndexPackage extends DocsIndexEntry {
  readonly npmName: string;
  readonly bricks: readonly DocsIndexEntry[];
}
