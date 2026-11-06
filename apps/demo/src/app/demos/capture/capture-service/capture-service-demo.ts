import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для CaptureService.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-capture.
 */
@Component({
  selector: 'app-capture-service-demo',
  imports: [DemoShellComponent],
  templateUrl: './capture-service-demo.html',
})
export class CaptureServiceDemo {
  protected readonly responsibilities = [
    'Сервис, без селектора.',
    'Методы: captureFrame, recordClip, captureGif.',
    'Пакет PRO — распространяется платно.',
  ];
}
