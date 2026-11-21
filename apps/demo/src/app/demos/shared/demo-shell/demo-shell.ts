import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { type DemoStatus, findDemoByPath } from '../../demo-registry';
import { isLocale } from '../../../i18n/locale';
import { LocaleService } from '../../../i18n/locale.service';
import type { UiKey } from '../../../i18n/ui-strings';

const STATUS_KEYS: Readonly<Record<DemoStatus, UiKey>> = {
  ready: 'statusReady',
  wip: 'statusWip',
  planned: 'statusPlanned',
};

/**
 * Общий каркас страницы демо: заголовок, статус, описание, «живое демо»
 * и список планируемого поведения.
 *
 * Страница конкретного кирпича передаёт сюда метаданные и проецирует
 * содержимое в слот живого примера. Ссылка на API берётся из реестра.
 */
@Component({
  selector: 'app-demo-shell',
  imports: [RouterLink],
  templateUrl: './demo-shell.html',
  styleUrl: './demo-shell.scss',
})
export class DemoShellComponent {
  readonly title = input.required<string>();
  readonly pkg = input.required<string>();
  readonly selector = input<string>('');
  readonly status = input<DemoStatus>('planned');
  readonly description = input.required<string>();
  readonly responsibilities = input<readonly string[]>([]);
  readonly pro = input(false);

  protected readonly i18n = inject(LocaleService);
  private readonly router = inject(Router);

  protected readonly entry = computed(() => {
    const [pathname] = this.router.url.split(/[?#]/);
    const segments = pathname.split('/').filter(Boolean);
    const demoPath = isLocale(segments[0])
      ? segments.slice(1).join('/')
      : segments.join('/');

    return findDemoByPath(demoPath);
  });

  protected readonly docsLink = computed(() => {
    const entry = this.entry();

    return entry ? `/${this.i18n.locale()}/${entry.demo.docsPath}` : null;
  });

  protected readonly statusLabel = computed(() =>
    this.i18n.t(STATUS_KEYS[this.status()]),
  );

  protected readonly statusClass = computed(
    () => `chip chip--${this.status()}`,
  );
}
