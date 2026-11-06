import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для GestureDirective.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-extras.
 */
@Component({
  selector: 'app-gesture-demo',
  imports: [DemoShellComponent],
  templateUrl: './gesture-demo.html',
})
export class GestureDemo {
  protected readonly responsibilities = [
    'Директива: [ngxGesture].',
    'Выходы: seek, volumeChange, brightnessChange.',
    'Не управляет видео напрямую.',
  ];
}
