import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import type { VideoError } from '@erst_dev/ngx-video-core';
import { ErrorDisplayComponent } from '@erst_dev/ngx-video-extras';

import { CodeSnippetComponent } from '../../shared/code-snippet/code-snippet';
import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для ErrorDisplayComponent.
 *
 * Живой плеер и три блока «Код примера»: базовая разметка, обработка `retry`
 * и стилизация через `customClass` + CSS-переменные. Ошибка симулируется
 * сигналом, а не реальным сетевым сбоем, чтобы сценарий можно было повторить.
 */
@Component({
  selector: 'app-error-display-demo',
  imports: [
    CodeSnippetComponent,
    DemoShellComponent,
    ErrorDisplayComponent,
    VideoDirective,
  ],
  providers: [VideoService],
  templateUrl: './error-display-demo.html',
  styleUrl: './error-display-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDisplayDemo {
  protected readonly video = inject(VideoService);

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  /** Локальная ошибка: демонстрирует вход `error`, не трогая состояние core. */
  protected readonly demoError = signal<VideoError | null>(null);

  protected readonly useCustomClass = signal(false);

  protected readonly errorClass = computed(() =>
    this.useCustomClass() ? 'demo-error' : '',
  );

  protected readonly responsibilities = [
    'Входы: error, customClass; выход: retry.',
    'При error === null карточки нет в DOM; сообщение берётся из error.message.',
    'Клик по «Повторить» только эмитит retry — повтор выполняет родитель.',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
readonly video = inject(VideoService);

<!-- player.component.html -->
<div class="player">
  <video ngxVideo [src]="src" playsinline></video>

  <ngx-error-display
    [error]="video.error()"
    (retry)="onRetry()"
  />
</div>

/* player.component.scss */
.player {
  position: relative;
  background: #000;
}`,

    retry: `// player.component.ts
readonly video = inject(VideoService);
readonly demoError = signal<VideoError | null>(null);

protected onRetry(): void {
  this.demoError.set(null);
  void this.video.play();
}

<!-- player.component.html -->
<ngx-error-display
  [error]="demoError()"
  (retry)="onRetry()"
/>`,

    custom: `<!-- player.component.html -->
<ngx-error-display
  customClass="my-error"
  [error]="demoError()"
  (retry)="onRetry()"
/>

/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-error {
  --ngx-error-bg: #7f1d1d;
  --ngx-error-color: #fef2f2;
  --ngx-error-border-radius: 16px;
  --ngx-error-button-bg: #fecaca;
  --ngx-error-button-hover-bg: #fca5a5;
  --ngx-error-button-color: #7f1d1d;
  --ngx-error-focus-color: #fca5a5;
}`,
  } as const;

  protected showError(): void {
    this.demoError.set({
      code: 'network',
      message:
        'Не удалось загрузить видео. Проверьте соединение и попробуйте снова.',
    });
  }

  protected onRetry(): void {
    this.demoError.set(null);
    void this.video.play();
  }

  protected toggleCustomClass(): void {
    this.useCustomClass.update((value) => !value);
  }
}
