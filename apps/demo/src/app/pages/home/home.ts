import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DEMO_GROUPS, DEMO_STATUS_LABELS } from '../../demos/demo-registry';

/**
 * Главная страница демо: список всех кирпичей по пакетам со статусами
 * и ссылками на их демо-страницы.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly groups = DEMO_GROUPS;
  protected readonly statusLabels = DEMO_STATUS_LABELS;
}
