import { Component, inject, input } from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { PlayButtonComponent } from '@erst_dev/ngx-video-controls';

/**
 * Плеер с кнопкой PlayButton в одной из двух раскладок:
 * по центру поверх видео или в нижней панели контролов.
 *
 * Каждый экземпляр создаёт собственный `VideoService` (`providers`), иначе
 * несколько `<video>` на странице делили бы одно состояние: директива
 * подключается к последнему элементу.
 */
@Component({
  selector: 'app-player-layout-demo',
  imports: [VideoDirective, PlayButtonComponent],
  providers: [VideoService],
  templateUrl: './player-layout-demo.html',
  styleUrl: './player-layout-demo.scss',
})
export class PlayerLayoutDemo {
  readonly layout = input.required<'center' | 'controls-bar'>();

  protected readonly video = inject(VideoService);

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
}
