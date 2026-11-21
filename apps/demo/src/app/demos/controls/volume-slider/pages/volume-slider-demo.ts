import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { VolumeSliderComponent } from '@erst_dev/ngx-video-controls';

import { CodeSnippetComponent } from '../../../../components/code-snippet/code-snippet';
import { DemoShellComponent } from '../../../../components/demo-shell/demo-shell';

/**
 * Демо для VolumeSliderComponent.
 *
 * Один `<video>` и три слайдера: базовый, стилизованный через `customClass`
 * и вертикальный. Все привязаны к одному `VideoService`, поэтому изменение
 * громкости сразу видно во всех примерах.
 *
 * Mute слайдер не трогает: в базовом примере его переключает отдельная
 * нативная кнопка, а уровень громкости остаётся прежним.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-volume-slider-demo',
  imports: [
    CodeSnippetComponent,
    DemoShellComponent,
    VideoDirective,
    VolumeSliderComponent,
  ],
  templateUrl: './volume-slider-demo.html',
  styleUrl: './volume-slider-demo.scss',
})
export class VolumeSliderDemo {
  protected readonly video = inject(VideoService);

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  protected readonly responsibilities = [
    'Входы: volume (0…1), customClass, ariaLabel; выход: volumeChange.',
    'CSS-переменные: --ngx-volume-width, --ngx-volume-track-height, --ngx-volume-track-color, --ngx-volume-fill-color, --ngx-volume-thumb-color, --ngx-volume-thumb-hover-color, --ngx-volume-thumb-size, --ngx-volume-border-radius, --ngx-volume-thumb-border-radius, --ngx-volume-transition.',
    'Нативный input[type="range"]: клавиатура, фокус и семантика работают из коробки, aria-valuetext — в процентах.',
    'Не хранит состояние и не управляет mute: в примере ниже звук переключает отдельная кнопка, а слайдер продолжает показывать громкость.',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
readonly video = inject(VideoService);

<!-- player.component.html -->
<video ngxVideo [src]="src" playsinline></video>

<ngx-volume-slider
  [volume]="video.volume()"
  (volumeChange)="video.setVolume($event)"
/>

<!-- mute — отдельная кнопка, слайдер его не заменяет -->
<button type="button" (click)="video.toggleMute()">
  {{ video.muted() ? 'Включить звук' : 'Без звука' }}
</button>`,

    custom: `<!-- player.component.html -->
<ngx-volume-slider
  customClass="my-volume"
  [volume]="video.volume()"
  (volumeChange)="video.setVolume($event)"
/>

/* player.component.scss — scoped-стили, без ::ng-deep */
.my-volume {
  --ngx-volume-width: 180px;
  --ngx-volume-track-height: 6px;
  --ngx-volume-track-color: rgba(255, 255, 255, 0.2);
  --ngx-volume-fill-color: #34d399;
  --ngx-volume-thumb-color: #34d399;
  --ngx-volume-thumb-hover-color: #6ee7b7;
  --ngx-volume-thumb-size: 18px;
}`,

    vertical: `<!-- player.component.html -->
<div class="player__volume">
  <ngx-volume-slider
    customClass="my-volume-vertical"
    [volume]="video.volume()"
    (volumeChange)="video.setVolume($event)"
  />
</div>

/* player.component.scss */
.player__volume {
  display: grid;
  place-items: center;
  height: 160px;
}

.my-volume-vertical {
  --ngx-volume-width: 140px;
  transform: rotate(-90deg);
}`,
  } as const;

  /** Громкость в процентах для подписи рядом со слайдером. */
  protected volumePercent(volume: number): string {
    return `${Math.round(volume * 100)} %`;
  }
}
