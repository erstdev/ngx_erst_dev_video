import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DEMO_STATUS_LABELS, type DemoStatus } from '../../demo-registry';

/**
 * Общий каркас страницы демо: заголовок, статус, описание, «живое демо»
 * и список планируемого поведения.
 *
 * Страница конкретного кирпича передаёт сюда метаданные и проецирует
 * содержимое в слот живого примера.
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

  protected readonly statusLabel = computed(
    () => DEMO_STATUS_LABELS[this.status()],
  );

  protected readonly statusClass = computed(
    () => `chip chip--${this.status()}`,
  );
}
