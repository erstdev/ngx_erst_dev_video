import type { Locale } from '../../i18n/locale';

/** Заголовок внутри README — для оглавления и проверки якорей. */
export interface DocsHeading {
  readonly id: string;
  readonly text: string;
  readonly level: number;
}

/** Одна сгенерированная страница документации. */
export interface DocsPageData {
  readonly locale: Locale;
  readonly pkg: string;
  readonly brick: string | null;
  readonly title: string;
  readonly route: string;
  readonly source: string;
  readonly sourceLocale: Locale;
  readonly fallback: boolean;
  readonly headings: readonly DocsHeading[];
  readonly html: string;
}

/** Элемент навигации: пакет или кирпич. */
export interface DocsIndexEntry {
  readonly id: string;
  readonly title: string;
  readonly route: string;
  readonly file: string;
  readonly fallback: boolean;
}

export interface DocsIndexPackage extends DocsIndexEntry {
  readonly npmName: string;
  readonly bricks: readonly DocsIndexEntry[];
}

/** `docs-content/<локаль>/index.json`. */
export interface DocsIndex {
  readonly locale: Locale;
  readonly generatedAt: string;
  readonly packages: readonly DocsIndexPackage[];
  readonly pages: readonly DocsIndexEntry[];
}
