import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для VolumeSliderComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-controls.
 */
@Component({
  selector: 'app-volume-slider-demo',
  imports: [DemoShellComponent],
  templateUrl: './volume-slider-demo.html',
})
export class VolumeSliderDemo {
  protected readonly responsibilities = [
    'Входы: volume, customClass, ariaLabel; выход: volumeChange.',
    'Стилизация: CSS-переменные --ngx-volume-*.',
    'Не управляет mute — для этого отдельная кнопка.',
  ];
}
