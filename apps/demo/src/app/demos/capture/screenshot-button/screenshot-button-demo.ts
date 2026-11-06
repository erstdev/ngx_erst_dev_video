import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для ScreenshotButtonComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-capture.
 */
@Component({
  selector: 'app-screenshot-button-demo',
  imports: [DemoShellComponent],
  templateUrl: './screenshot-button-demo.html',
})
export class ScreenshotButtonDemo {
  protected readonly responsibilities = [
    'Входы: customClass, ariaLabel; выход: capture.',
    'Требует CaptureService из пакета capture.',
  ];
}
