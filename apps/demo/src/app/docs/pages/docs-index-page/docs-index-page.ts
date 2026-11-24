import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocaleService } from '../../../i18n/services/locale.service';
import { SITE_NAME } from '../../../constants/site.constants';
import { SeoService } from '../../../services/seo.service';
import { DocsLayoutComponent } from '../../components/docs-layout/docs-layout';
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
  /** Данные из resolver'а: на пререндере — из серверного модуля. */
  readonly docsIndex = input<DocsIndex | null>(null);

  protected readonly i18n = inject(LocaleService);
  private readonly seo = inject(SeoService);

  constructor() {
    effect(() => {
      if (!this.docsIndex()) return;

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
