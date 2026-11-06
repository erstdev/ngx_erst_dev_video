import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для DashSourceDirective.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-sources.
 */
@Component({
  selector: 'app-dash-source-demo',
  imports: [DemoShellComponent],
  templateUrl: './dash-source-demo.html',
})
export class DashSourceDemo {
  protected readonly responsibilities = [
    'Директива: [ngxDashSource].',
    'Входы: src, autoplay.',
    'Не управляет интерфейсом.',
  ];
}
