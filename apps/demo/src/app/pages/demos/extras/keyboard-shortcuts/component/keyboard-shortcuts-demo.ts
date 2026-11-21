import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import {
  KeyboardShortcutsDirective,
  SpeedControlComponent,
} from '@erst_dev/ngx-video-extras';

import { CodeSnippetComponent } from '../../../../../code-snippet/code-snippet';
import { DemoShellComponent } from '../../../../../demo-shell/demo-shell';

/**
 * Демо для KeyboardShortcutsDirective.
 *
 * Живой плеер и три блока «Код примера»: базовая разметка, обработчики через
 * `VideoService` и настройка шагов/`enabled`. Контейнер получает фокус по клику
 * или Tab, а директива только переводит клавиши в выходы.
 */
@Component({
  selector: 'app-keyboard-shortcuts-demo',
  imports: [
    CodeSnippetComponent,
    DemoShellComponent,
    KeyboardShortcutsDirective,
    SpeedControlComponent,
    VideoDirective,
  ],
  providers: [VideoService],
  templateUrl: './keyboard-shortcuts-demo.html',
  styleUrl: './keyboard-shortcuts-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyboardShortcutsDemo {
  protected readonly video = inject(VideoService);

  protected readonly src = 'https://media.w3.org/2010/05/sintel/trailer.mp4';

  private readonly videoElement =
    viewChild<ElementRef<HTMLVideoElement>>('videoEl');

  constructor() {
    /*
     * В полноэкранном режиме фокус уходит на body и host-listener контейнера
     * перестаёт получать клавиши. Возвращаем фокус на видео (tabindex="-1"),
     * чтобы F продолжала закрывать полноэкранный режим.
     */
    effect(() => {
      if (this.video.fullscreen()) {
        this.videoElement()?.nativeElement.focus();
      }
    });
  }

  /** Включена ли обработка клавиш. */
  protected readonly shortcutsEnabled = signal(true);

  /** Большой шаг перемотки и громкости. */
  protected readonly largeSteps = signal(false);

  protected readonly seekStep = computed(() => (this.largeSteps() ? 15 : 5));

  protected readonly volumeStep = computed(() =>
    this.largeSteps() ? 0.25 : 0.1,
  );

  protected readonly volumePercent = computed(
    () => `${Math.round(this.video.volume() * 100)}%`,
  );

  protected readonly mutedLabel = computed(() =>
    this.video.muted() ? 'да' : 'нет',
  );

  protected readonly fullscreenLabel = computed(() =>
    this.video.fullscreen() ? 'да' : 'нет',
  );

  protected readonly responsibilities = [
    'Селектор [ngxKeyboardShortcuts]; клавиши переводятся в выходы.',
    'Space — togglePlay, стрелки — seekBy/volumeChange, F — fullscreen, M — mute.',
    'Состояние не хранится: VideoService вызывается только в обработчиках демо.',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `<!-- player.component.html -->
<div
  class="player"
  ngxKeyboardShortcuts
  tabindex="0"
  (togglePlay)="video.toggle()"
  (seekBy)="video.seekBy($event)"
  (volumeChange)="onVolumeChange($event)"
  (toggleMute)="video.toggleMute()"
  (toggleFullscreen)="video.toggleFullscreen()"
>
  <video ngxVideo [src]="src" playsinline></video>
</div>

/* player.component.scss */
.player {
  position: relative;
  background: #000;
}

.player:focus-visible {
  outline: 2px solid #34d399;
  outline-offset: 2px;
}`,

    handlers: `// player.component.ts
readonly video = inject(VideoService);

protected onSeekBy(delta: number): void {
  this.video.seekBy(delta);
}

protected onVolumeChange(delta: number): void {
  this.video.setVolume(this.video.volume() + delta);
}`,

    settings: `// player.component.ts
readonly shortcutsEnabled = signal(true);
readonly largeSteps = signal(false);
readonly seekStep = computed(() => (this.largeSteps() ? 15 : 5));
readonly volumeStep = computed(() => (this.largeSteps() ? 0.25 : 0.1));

<!-- player.component.html -->
<div
  ngxKeyboardShortcuts
  tabindex="0"
  [enabled]="shortcutsEnabled()"
  [seekStep]="seekStep()"
  [volumeStep]="volumeStep()"
  (togglePlay)="video.toggle()"
  (seekBy)="onSeekBy($event)"
  (volumeChange)="onVolumeChange($event)"
  (toggleMute)="video.toggleMute()"
  (toggleFullscreen)="video.toggleFullscreen()"
>
  <video ngxVideo [src]="src" playsinline></video>
</div>`,
  } as const;

  protected onSeekBy(delta: number): void {
    this.video.seekBy(delta);
  }

  protected onVolumeChange(delta: number): void {
    this.video.setVolume(this.video.volume() + delta);
  }

  protected toggleShortcuts(): void {
    this.shortcutsEnabled.update((value) => !value);
  }

  protected toggleLargeSteps(): void {
    this.largeSteps.update((value) => !value);
  }
}
