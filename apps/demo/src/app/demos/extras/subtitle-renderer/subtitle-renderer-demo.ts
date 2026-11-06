import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для SubtitleRendererComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-extras.
 */
@Component({
  selector: 'app-subtitle-renderer-demo',
  imports: [DemoShellComponent],
  templateUrl: './subtitle-renderer-demo.html',
})
export class SubtitleRendererDemo {
  protected readonly responsibilities = [
    'Входы: cues или src, currentTime, customClass.',
    'Стилизация: CSS-переменные --ngx-subtitle-*.',
    'Не управляет включением и выключением дорожек.',
  ];
}
