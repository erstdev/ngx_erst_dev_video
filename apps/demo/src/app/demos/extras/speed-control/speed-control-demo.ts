import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для SpeedControlComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-extras.
 */
@Component({
  selector: 'app-speed-control-demo',
  imports: [DemoShellComponent],
  templateUrl: './speed-control-demo.html',
})
export class SpeedControlDemo {
  protected readonly responsibilities = [
    'Входы: playbackRate, rates, customClass; выход: rateChange.',
    'Не применяет скорость к видео напрямую.',
  ];
}
