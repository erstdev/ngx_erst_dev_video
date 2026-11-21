/** Элемент навигации: пакет или кирпич. */
export interface DocsIndexEntry {
  readonly id: string;
  readonly title: string;
  readonly route: string;
  readonly file: string;
  readonly fallback: boolean;
}
