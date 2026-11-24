import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocaleService } from '../../../i18n/services/locale.service';
import { isLocale } from '../../../i18n/utils/is-locale.util';
import { SITE_NAME } from '../../../constants/site.constants';
import { SeoService } from '../../../services/seo.service';
import { DocsLayoutComponent } from '../../components/docs-layout/docs-layout';
import { DocsService } from '../../services/docs.service';
import type { DocsIndex } from '../../interfaces/docs-index.interface';

/** Список документации `/<локаль>/docs`: пакеты и входящие в них кирпичи. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-docs-index-page',
  imports: [DocsLayoutComponent, RouterLink],
  templateUrl: './docs-index-page.html',
  styleUrl: './docs-index-page.scss',
})
export class DocsIndexPage {
  readonly locale = input.required<string>();

  protected readonly i18n = inject(LocaleService);
  private readonly docs = inject(DocsService);
  private readonly seo = inject(SeoService);

  protected readonly index = signal<DocsIndex | null>(null);
  protected readonly failed = signal(false);

  constructor() {
    effect((onCleanup) => {
      const locale = this.locale();
      let cancelled = false;
      onCleanup(() => {
        cancelled = true;
      });

      this.index.set(null);
      this.failed.set(false);

      if (!isLocale(locale)) {
        this.failed.set(true);
        return;
      }

      void this.docs
        .loadIndex(locale)
        .then((index) => {
          if (!cancelled) this.index.set(index);
        })
        .catch(() => {
          if (!cancelled) this.failed.set(true);
        });
    });

    effect(() => {
      if (!this.index()) return;

      const locale = this.i18n.locale();
      const base = `/${locale}`;

      this.seo.apply({
        title: `${this.i18n.t('docsTitle')} — ${SITE_NAME}`,
        description: this.i18n.t('docsSubtitle'),
        type: 'collection',
        breadcrumbs: [
          { name: this.i18n.t('navHome'), path: base },
          { name: this.i18n.t('docsTitle'), path: `${base}/docs` },
        ],
      });
    });
  }

  protected link(route: string): string {
    return `/${this.locale()}/${route}`;
  }
}
