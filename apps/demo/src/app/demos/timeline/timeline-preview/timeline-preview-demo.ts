import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для TimelinePreviewComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-timeline.
 */
@Component({
  selector: 'app-timeline-preview-demo',
  imports: [DemoShellComponent],
  templateUrl: './timeline-preview-demo.html',
})
export class TimelinePreviewDemo {
  protected readonly responsibilities = [
    'Входы: time, duration, источник кадра, customClass.',
    'Стилизация: CSS-переменные --ngx-timeline-preview-*.',
    'Не управляет воспроизведением и не меняет время видео.',
  ];
}
