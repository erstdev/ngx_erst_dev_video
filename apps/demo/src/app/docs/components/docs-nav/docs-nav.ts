import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LocaleService } from '../../../i18n/services/locale.service';
import { isLocale } from '../../../i18n/utils/is-locale.util';
import { DocsService } from '../../services/docs.service';
import type { DocsIndex } from '../../interfaces/docs-index.interface';

/**
 * Сайдбар документации: пакеты и входящие в них кирпичи из `index.json`.
 *
 * Пункт открывает страницу компонента с вкладками «Пример» и «API»;
 * отдельной ссылки «Пример» здесь нет — она не нужна.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-docs-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './docs-nav.html',
  styleUrl: './docs-nav.scss',
})
export class DocsNavComponent {
  protected readonly i18n = inject(LocaleService);
  private readonly docs = inject(DocsService);

  protected readonly index = signal<DocsIndex | null>(null);
  protected readonly failed = signal(false);

  constructor() {
    effect((onCleanup) => {
      const locale = this.i18n.locale();
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
    return `/${this.i18n.locale()}/${route}`;
  }
}
