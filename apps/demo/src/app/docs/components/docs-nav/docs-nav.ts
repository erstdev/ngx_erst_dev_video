import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LocaleService } from '../../../i18n/services/locale.service';
import { isLocale } from '../../../i18n/utils/is-locale.util';
import { DocsStore } from '../../services/docs-store.service';

/**
 * Сайдбар документации: пакеты и входящие в них кирпичи из `index.json`.
 *
 * На пререндеренных страницах индекс уже лежит в `TransferState` (его положил
 * resolver), поэтому сайдбар попадает в HTML при первом рендере и hydration
 * видит ту же разметку. На демо-страницах, которые остаются клиентскими,
 * индекс догружается JSON-ассетом.
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
  private readonly store = inject(DocsStore);

  protected readonly index = computed(() =>
    this.store.index(this.i18n.locale()),
  );
  protected readonly failed = signal(false);

  constructor() {
    effect(() => {
      const locale = this.i18n.locale();
      this.failed.set(false);

      if (!isLocale(locale) || this.index()) return;

      void this.store.ensureIndex(locale).then((index) => {
        if (!index) this.failed.set(true);
      });
    });
  }

  protected link(route: string): string {
    return `/${this.i18n.locale()}/${route}`;
  }
}
