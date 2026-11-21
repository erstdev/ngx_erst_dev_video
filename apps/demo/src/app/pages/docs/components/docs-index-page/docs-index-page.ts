import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { findDemoById } from '../../../demos/utils/find-demo-by-id.util';
import { LocaleService } from '../../../../i18n/locale.service';
import { isLocale } from '../../../../i18n/utils/is-locale.util';
import { DocsNavComponent } from '../docs-nav/docs-nav';
import { DocsService } from '../../../../services/docs.service';
import type { DocsIndex } from '../../interfaces/docs-index.interface';

/** Список документации `/<локаль>/docs`: пакеты, кирпичи, ссылки на примеры. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-docs-index-page',
  imports: [DocsNavComponent, RouterLink],
  templateUrl: './docs-index-page.html',
})
export class DocsIndexPage {
  readonly locale = input.required<string>();

  protected readonly i18n = inject(LocaleService);
  private readonly docs = inject(DocsService);

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
  }

  protected link(route: string): string {
    return `/${this.locale()}/${route}`;
  }

  protected exampleLink(pkgId: string, brickId: string): string | null {
    const demo = findDemoById(pkgId, brickId);

    return demo ? `/${this.locale()}/${demo.path}` : null;
  }
}
