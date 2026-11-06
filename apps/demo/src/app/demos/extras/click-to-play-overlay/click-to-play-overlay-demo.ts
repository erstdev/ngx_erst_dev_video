import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для ClickToPlayOverlayComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-extras.
 */
@Component({
  selector: 'app-click-to-play-overlay-demo',
  imports: [DemoShellComponent],
  templateUrl: './click-to-play-overlay-demo.html',
})
export class ClickToPlayOverlayDemo {
  protected readonly responsibilities = [
    'Входы: state, customClass; выход: play.',
    'Показывается в состояниях idle и paused.',
    'Не запускает воспроизведение сам — только сообщает о желании пользователя.',
  ];
}
