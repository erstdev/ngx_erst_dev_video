import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import {
  BufferingIndicatorComponent,
  FullscreenButtonComponent,
  PlayButtonComponent,
  TimeDisplayComponent,
  VolumeSliderComponent,
} from '@erst_dev/ngx-video-controls';

import { CodeSnippetComponent } from '../../shared/code-snippet/code-snippet';
import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Полноценный плеер из кирпичей `controls`.
 *
 * Один `<video ngxVideo>` и один локальный `VideoService` на страницу:
 * клик по видео и кнопка play управляют воспроизведением, оверлеи показывают
 * play или buffering, нижняя панель собрана из готовых контролов.
 *
 * Fullscreen запрашивается на контейнер `.player`, а не на `<video>`: только так
 * панель управления остаётся внутри полноэкранного элемента. Состояние
 * полноэкранного режима — локальный сигнал демо, синхронизированный по
 * `fullscreenchange`; публичный API `core` не меняется.
 */
@Component({
  selector: 'app-player-demo',
  imports: [
    BufferingIndicatorComponent,
    CodeSnippetComponent,
    DemoShellComponent,
    FullscreenButtonComponent,
    PlayButtonComponent,
    TimeDisplayComponent,
    VideoDirective,
    VolumeSliderComponent,
  ],
  providers: [VideoService],
  templateUrl: './player-demo.html',
  styleUrl: './player-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerDemo {
  protected readonly video = inject(VideoService);

  private readonly player =
    viewChild.required<ElementRef<HTMLElement>>('player');

  /** Локальный флаг: `VideoService.fullscreen` отслеживает только `<video>`. */
  protected readonly isFullscreen = signal(false);

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  /** Большая кнопка play поверх видео — только когда воспроизведение не идёт. */
  protected readonly showCenterPlay = computed(() => {
    const state = this.video.state();
    return (
      state === 'idle' ||
      state === 'paused' ||
      state === 'ended' ||
      state === 'error'
    );
  });

  protected readonly muteLabel = computed(() =>
    this.video.muted() ? 'Включить звук' : 'Выключить звук',
  );

  protected readonly responsibilities = [
    'Один VideoService на плеер через providers: состояние не пересекается с другими демо-страницами.',
    'Клик по видео и кнопка play вызывают video.toggle(); overlay показывает play, пока воспроизведение не идёт, или buffering.',
    'Mute — отдельная кнопка video.toggleMute(); слайдер отвечает только за громкость и не меняет флаг mute.',
    'Fullscreen — на контейнер .player: локальный сигнал + fullscreenchange, панель остаётся доступной; публичный API core не меняется.',
    'Панель адаптивная: на узких экранах слайдер скрывается, mute остаётся; hover/focus-visible и prefers-reduced-motion учтены.',
  ];

  constructor() {
    if (typeof document !== 'undefined') {
      fromEvent(document, 'fullscreenchange')
        .pipe(takeUntilDestroyed())
        .subscribe(() => this.syncFullscreen());
    }
  }

  protected async toggleFullscreen(): Promise<void> {
    if (typeof document === 'undefined') {
      return;
    }

    const element = this.player().nativeElement;

    try {
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
        return;
      }

      await element.requestFullscreen();
    } catch {
      // Браузер может отказать (политика, iframe) — состояние останется прежним.
    }
  }

  private syncFullscreen(): void {
    if (typeof document === 'undefined') {
      return;
    }

    this.isFullscreen.set(
      document.fullscreenElement === this.player().nativeElement,
    );
  }

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    markup: `<!-- player.component.html -->
<div
  #player
  class="player"
  [class.player--show-controls]="!video.isPlaying()"
>
  <video
    class="player__video"
    ngxVideo
    [src]="src"
    preload="metadata"
    playsinline
    (click)="video.toggle()"
  ></video>

  @if (showCenterPlay()) {
    <ngx-play-button
      customClass="player__center-play"
      [state]="video.state()"
      (toggle)="video.toggle()"
    />
  }

  <div class="player__buffering">
    <ngx-buffering-indicator [state]="video.state()" [delay]="200" />
  </div>

  <div class="player__bar">
    <ngx-play-button
      customClass="player__control"
      [state]="video.state()"
      (toggle)="video.toggle()"
    />

    <button
      type="button"
      class="player__mute"
      [attr.aria-label]="muteLabel()"
      [attr.aria-pressed]="video.muted()"
      (click)="video.toggleMute()"
    >
      <!-- SVG: иконка mute / звука -->
    </button>

    <ngx-volume-slider
      customClass="player__volume"
      [volume]="video.volume()"
      (volumeChange)="video.setVolume($event)"
    />

    <ngx-time-display
      customClass="player__time"
      [currentTime]="video.time()"
      [duration]="video.duration()"
    />

    <span class="player__spacer"></span>

    <ngx-fullscreen-button
      customClass="player__control"
      [fullscreen]="isFullscreen()"
      (toggle)="toggleFullscreen()"
    />
  </div>
</div>`,

    component: `// player.component.ts
@Component({
  providers: [VideoService],
  imports: [
    VideoDirective,
    PlayButtonComponent,
    VolumeSliderComponent,
    TimeDisplayComponent,
    FullscreenButtonComponent,
    BufferingIndicatorComponent,
  ],
})
export class PlayerComponent {
  readonly video = inject(VideoService);

  private readonly player =
    viewChild.required<ElementRef<HTMLElement>>('player');

  readonly isFullscreen = signal(false);

  readonly showCenterPlay = computed(() => {
    const state = this.video.state();
    return (
      state === 'idle' ||
      state === 'paused' ||
      state === 'ended' ||
      state === 'error'
    );
  });

  readonly muteLabel = computed(() =>
    this.video.muted() ? 'Включить звук' : 'Выключить звук',
  );

  constructor() {
    fromEvent(document, 'fullscreenchange')
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.syncFullscreen());
  }

  async toggleFullscreen(): Promise<void> {
    const element = this.player().nativeElement;

    try {
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
      } else {
        await element.requestFullscreen();
      }
    } catch {
      // Браузер может отказать — состояние останется прежним.
    }
  }

  private syncFullscreen(): void {
    this.isFullscreen.set(
      document.fullscreenElement === this.player().nativeElement,
    );
  }
}`,

    styles: `/* player.component.scss */
.player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 0.75rem;
  background: #000;
}

.player__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.player__center-play {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  transform: translate(-50%, -50%);

  --ngx-play-size: 72px;
  --ngx-play-bg: rgba(0, 0, 0, 0.55);
  --ngx-play-hover-bg: rgba(0, 0, 0, 0.75);
}

.player__buffering {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.player__bar {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 0.75rem 0.75rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.player:hover .player__bar,
.player:focus-within .player__bar,
.player--show-controls .player__bar {
  opacity: 1;
}

.player:fullscreen {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  aspect-ratio: auto;
}

.player:fullscreen::backdrop {
  background: #000;
}`,
  } as const;
}
