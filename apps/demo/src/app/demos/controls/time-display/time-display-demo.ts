import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для TimeDisplayComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-controls.
 */
@Component({
  selector: 'app-time-display-demo',
  imports: [DemoShellComponent],
  templateUrl: './time-display-demo.html',
})
export class TimeDisplayDemo {
  protected readonly responsibilities = [
    'Входы: currentTime, duration, customClass.',
    'Форматирование — общая утилита formatTime из core.',
    'Не следит за видео самостоятельно.',
  ];
}
