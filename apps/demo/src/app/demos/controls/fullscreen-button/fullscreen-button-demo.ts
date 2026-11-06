import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для FullscreenButtonComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-controls.
 */
@Component({
  selector: 'app-fullscreen-button-demo',
  imports: [DemoShellComponent],
  templateUrl: './fullscreen-button-demo.html',
})
export class FullscreenButtonDemo {
  protected readonly responsibilities = [
    'Входы: fullscreen, customClass, ariaLabel; выход: toggle.',
    'Стилизация: CSS-переменные --ngx-fullscreen-*.',
    'Не вызывает Fullscreen API напрямую.',
  ];
}
