import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { GestureDirective } from '@erst_dev/ngx-video-extras';

import { CodeSnippetComponent } from '../../shared/code-snippet/code-snippet';
import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для GestureDirective.
 *
 * Живой плеер и три блока «Код примера»: базовая разметка с `touch-action`,
 * обработчики через `VideoService` и настройка шагов/`enabled`. Контейнер
 * принимает и мышь, и touch: директива работает на Pointer Events.
 */
@Component({
  selector: 'app-gesture-demo',
  imports: [
    CodeSnippetComponent,
    DemoShellComponent,
    GestureDirective,
    VideoDirective,
  ],
  providers: [VideoService],
  templateUrl: './gesture-demo.html',
  styleUrl: './gesture-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestureDemo {
  protected readonly video = inject(VideoService);

  protected readonly src = 'https://media.w3.org/2010/05/sintel/trailer.mp4';

  /** Включена ли обработка жестов. */
  protected readonly gesturesEnabled = signal(true);

  /** Яркость, которую демо применяет к видео по `brightnessChange`. */
  protected readonly brightness = signal(1);

  protected readonly volumePercent = computed(
    () => `${Math.round(this.video.volume() * 100)}%`,
  );

  protected readonly brightnessPercent = computed(
    () => `${Math.round(this.brightness() * 100)}%`,
  );

  protected readonly brightnessFilter = computed(
    () => `brightness(${this.brightness()})`,
  );

  protected readonly playLabel = computed(() =>
    this.video.state() === 'playing' || this.video.state() === 'buffering'
      ? 'Пауза'
      : 'Play',
  );

  protected readonly responsibilities = [
    'Селектор [ngxGesture]; Pointer Events покрывают touch, pen и мышь.',
    'Один жест — один выход: seek, volumeChange или brightnessChange.',
    'Состояние не хранится: VideoService вызывается только в обработчиках демо.',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `<!-- player.component.html -->
<div
  class="player"
  ngxGesture
  [enabled]="gesturesEnabled()"
  (seek)="onSeek($event)"
  (volumeChange)="onVolumeChange($event)"
  (brightnessChange)="onBrightnessChange($event)"
>
  <video ngxVideo [src]="src" playsinline></video>
</div>

/* player.component.scss */
.player {
  /* Для touch: иначе браузер заберёт жест под скролл. */
  touch-action: none;
}`,

    handlers: `// player.component.ts
readonly video = inject(VideoService);
readonly brightness = signal(1);

protected onSeek(delta: number): void {
  this.video.seekBy(delta);
}

protected onVolumeChange(delta: number): void {
  this.video.setVolume(this.video.volume() + delta);
}

protected onBrightnessChange(delta: number): void {
  const next = Math.min(1, Math.max(0.2, this.brightness() + delta));
  this.brightness.set(next);
}`,

    settings: `// player.component.ts
readonly gesturesEnabled = signal(true);

<!-- player.component.html -->
<div
  ngxGesture
  [enabled]="gesturesEnabled()"
  [seekStep]="30"
  [volumeStep]="0.5"
  [brightnessStep]="0.5"
  [threshold]="12"
  (seek)="onSeek($event)"
  (volumeChange)="onVolumeChange($event)"
  (brightnessChange)="onBrightnessChange($event)"
>
  <video ngxVideo [src]="src" playsinline></video>
</div>`,
  } as const;

  protected onSeek(delta: number): void {
    this.video.seekBy(delta);
  }

  protected onVolumeChange(delta: number): void {
    this.video.setVolume(this.video.volume() + delta);
  }

  protected onBrightnessChange(delta: number): void {
    const next = Math.min(1, Math.max(0.2, this.brightness() + delta));
    this.brightness.set(next);
  }

  protected toggleGestures(): void {
    this.gesturesEnabled.update((value) => !value);
  }
}
