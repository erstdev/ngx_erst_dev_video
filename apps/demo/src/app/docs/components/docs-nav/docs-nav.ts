import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { findDemoById } from '../../utils/find-demo-by-id.util';
import { LocaleService } from '../../../i18n/services/locale.service';
import { isLocale } from '../../../i18n/utils/is-locale.util';
import { DocsService } from '../../services/docs.service';
import type { DocsIndex } from '../../interfaces/docs-index.interface';

/**
 * Сайдбар документации: пакеты и кирпичи из `index.json`.
 * У кирпича две ссылки — API-справка и живой пример (если он есть в реестре).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-docs-nav',
  imports: [RouterLink],
  templateUrl: './docs-nav.html',
  styleUrl: './docs-nav.scss',
})
export class DocsNavComponent {
  readonly locale = input.required<string>();
  readonly activeRoute = input('');

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
