import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для TimelineComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-timeline.
 */
@Component({
  selector: 'app-timeline-demo',
  imports: [DemoShellComponent],
  templateUrl: './timeline-demo.html',
})
export class TimelineDemo {
  protected readonly responsibilities = [
    'Входы: currentTime, duration, buffered, customClass; выходы: seek, scrubStart, scrubEnd.',
    'Стилизация: CSS-переменные --ngx-timeline-*.',
    'Не рендерит превью кадров и не управляет главами.',
  ];
}
