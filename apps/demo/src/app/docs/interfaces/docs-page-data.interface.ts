import type { Locale } from '../../i18n/types/locale.type';
import type { DocsHeading } from './docs-heading.interface';

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
