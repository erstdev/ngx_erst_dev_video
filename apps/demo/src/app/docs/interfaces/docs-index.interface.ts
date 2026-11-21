import type { Locale } from '../../i18n/types/locale.type';
import type { DocsIndexEntry } from './docs-index-entry.interface';
import type { DocsIndexPackage } from './docs-index-package.interface';

/** `docs-content/<локаль>/index.json`. */
export interface DocsIndex {
  readonly locale: Locale;
  readonly generatedAt: string;
  readonly packages: readonly DocsIndexPackage[];
  readonly pages: readonly DocsIndexEntry[];
}
