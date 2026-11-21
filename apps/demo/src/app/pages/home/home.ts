import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DEMO_GROUPS, type DemoStatus } from '../../demos/demo-registry';
import { LocaleService } from '../../i18n/locale.service';
import type { UiKey } from '../../i18n/ui-strings';

const STATUS_KEYS: Readonly<Record<DemoStatus, UiKey>> = {
  ready: 'statusReady',
  wip: 'statusWip',
  planned: 'statusPlanned',
};

/**
 * Главная страница сайта: витрина пакетов и кирпичей со ссылками на живой
 * пример и API-справку. Отдельной точки входа нет — это же SPA.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly groups = DEMO_GROUPS;
  protected readonly i18n = inject(LocaleService);

  protected statusLabel(status: DemoStatus): string {
    return this.i18n.t(STATUS_KEYS[status]);
  }

  protected link(path: string): string {
    return `/${this.i18n.locale()}/${path}`;
  }
}
