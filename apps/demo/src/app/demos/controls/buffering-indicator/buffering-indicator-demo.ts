import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для BufferingIndicatorComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-controls.
 */
@Component({
  selector: 'app-buffering-indicator-demo',
  imports: [DemoShellComponent],
  templateUrl: './buffering-indicator-demo.html',
})
export class BufferingIndicatorDemo {
  protected readonly responsibilities = [
    'Входы: state, customClass, задержка появления.',
    'Стилизация: CSS-переменные --ngx-buffering-*.',
    'Не решает, когда включать буферизацию.',
  ];
}
