import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для ErrorDisplayComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-extras.
 */
@Component({
  selector: 'app-error-display-demo',
  imports: [DemoShellComponent],
  templateUrl: './error-display-demo.html',
})
export class ErrorDisplayDemo {
  protected readonly responsibilities = [
    'Входы: error, customClass; выход: retry.',
    'Стилизация: CSS-переменные --ngx-error-*.',
  ];
}
