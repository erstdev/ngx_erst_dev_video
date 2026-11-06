import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для HlsSourceDirective.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-sources.
 */
@Component({
  selector: 'app-hls-source-demo',
  imports: [DemoShellComponent],
  templateUrl: './hls-source-demo.html',
})
export class HlsSourceDemo {
  protected readonly responsibilities = [
    'Директива: [ngxHlsSource].',
    'Входы: src, autoplay; событие смены уровня качества.',
    'Не управляет интерфейсом.',
  ];
}
