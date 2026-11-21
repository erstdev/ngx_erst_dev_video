import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { ClickToPlayOverlayComponent } from '@erst_dev/ngx-video-extras';

import { CodeSnippetComponent } from '../../../../../code-snippet/code-snippet';
import { DemoShellComponent } from '../../../../../demo-shell/demo-shell';

/**
 * Демо для ClickToPlayOverlayComponent.
 *
 * Один живой плеер и три блока «Код примера»: базовая разметка, своя иконка
 * через `iconTemplate` и стилизация через `customClass` + CSS-переменные.
 * Переключатели над плеером включают свою иконку и класс, чтобы оба сценария
 * можно было проверить на одном видео.
 */
@Component({
  selector: 'app-click-to-play-overlay-demo',
  imports: [
    ClickToPlayOverlayComponent,
    CodeSnippetComponent,
    DemoShellComponent,
    VideoDirective,
  ],
  providers: [VideoService],
  templateUrl: './click-to-play-overlay-demo.html',
  styleUrl: './click-to-play-overlay-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClickToPlayOverlayDemo {
  protected readonly video = inject(VideoService);

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  protected readonly useCustomIcon = signal(false);
  protected readonly useCustomClass = signal(false);

  protected readonly overlayClass = computed(() =>
    this.useCustomClass() ? 'demo-overlay' : '',
  );

  protected readonly responsibilities = [
    'Входы: state, customClass, ariaLabel, iconTemplate; выход: play.',
    'Оверлей виден только в состояниях idle и paused — в остальных его нет в DOM.',
    'Клик эмитит play, запуск выполняет родитель. Клик по видео во время воспроизведения ставит паузу.',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
readonly video = inject(VideoService);

<!-- player.component.html -->
<div class="player">
  <video
    ngxVideo
    [src]="src"
    playsinline
    (click)="video.pause()"
  ></video>

  <ngx-click-to-play-overlay
    [state]="video.state()"
    (play)="video.play()"
  />
</div>

/* player.component.scss */
.player {
  position: relative;
  background: #000;
}`,

    icon: `<!-- player.component.html -->
<ngx-click-to-play-overlay
  [state]="video.state()"
  [iconTemplate]="customIcon"
  (play)="video.play()"
/>

<ng-template #customIcon let-state="state">
  <span
    class="my-icon"
    [class.my-icon--paused]="state === 'paused'"
  >
    ★
  </span>
</ng-template>

/* player.component.scss */
.my-icon {
  font-size: 1.75rem;
  line-height: 1;
}

.my-icon--paused {
  transform: rotate(12deg);
}`,

    custom: `<!-- player.component.html -->
<ngx-click-to-play-overlay
  customClass="my-overlay"
  [state]="video.state()"
  (play)="video.play()"
/>

/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-overlay {
  --ngx-overlay-size: 96px;
  --ngx-overlay-icon-size: 38%;
  --ngx-overlay-bg: #059669;
  --ngx-overlay-hover-bg: #047857;
  --ngx-overlay-border-radius: 16px;
  --ngx-overlay-focus-color: #34d399;
}`,
  } as const;

  protected onVideoClick(): void {
    const state = this.video.state();

    if (state === 'playing' || state === 'buffering') {
      this.video.pause();
    }
  }

  protected toggleCustomIcon(): void {
    this.useCustomIcon.update((value) => !value);
  }

  protected toggleCustomClass(): void {
    this.useCustomClass.update((value) => !value);
  }
}
