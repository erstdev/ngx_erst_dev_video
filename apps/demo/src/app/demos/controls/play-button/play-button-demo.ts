import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для PlayButtonComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-controls.
 */
@Component({
  selector: 'app-play-button-demo',
  imports: [DemoShellComponent],
  templateUrl: './play-button-demo.html',
})
export class PlayButtonDemo {
  protected readonly responsibilities = [
    'Входы: state, customClass, ariaLabel; выход: toggle.',
    'Стилизация: CSS-переменные --ngx-play-* и ng-template для иконки.',
    'Не управляет воспроизведением напрямую.',
  ];
}
