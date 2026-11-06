import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для ClipRecorderComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-capture.
 */
@Component({
  selector: 'app-clip-recorder-demo',
  imports: [DemoShellComponent],
  templateUrl: './clip-recorder-demo.html',
})
export class ClipRecorderDemo {
  protected readonly responsibilities = [
    'Входы: maxDuration, customClass; выходы: recordStart, recordStop.',
    'Логика кодирования — в CaptureService.',
  ];
}
