import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocaleService } from '../../../i18n/services/locale.service';

/**
 * Вкладки страницы компонента.
 *
 * «Пример» и «API» — отдельные адреса, поэтому вкладку можно дать ссылкой,
 * а кнопка «Назад» возвращает на предыдущую.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-docs-tabs',
  imports: [RouterLink],
  templateUrl: './docs-tabs.html',
  styleUrl: './docs-tabs.scss',
})
export class DocsTabsComponent {
  readonly pkg = input.required<string>();
  readonly brick = input.required<string>();
  readonly active = input<'example' | 'api'>('example');
  /** Относительный путь API; по умолчанию — текущий кирпич + `/api`. */
  readonly apiPath = input<string | null>(null);

  protected readonly i18n = inject(LocaleService);
  protected readonly exampleLink = computed(
    () => `/${this.i18n.locale()}/docs/${this.pkg()}/${this.brick()}`,
  );
  protected readonly apiLink = computed(() => {
    const path = this.apiPath();

    return path
      ? `/${this.i18n.locale()}/${path}`
      : `${this.exampleLink()}/api`;
  });
}
