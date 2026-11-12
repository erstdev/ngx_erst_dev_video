import { Component, inject, signal } from '@angular/core';

import {
  VideoDirective,
  VideoService,
  type VideoState,
} from '@erst_dev/ngx-video-core';
import { BufferingIndicatorComponent } from '@erst_dev/ngx-video-controls';

import { CodeSnippetComponent } from '../../shared/code-snippet/code-snippet';
import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для BufferingIndicatorComponent.
 *
 * Три сценария: живой индикатор поверх видео, ручное переключение состояния
 * (включая задержку появления) и стилизация через `customClass`.
 *
 * Компонент не решает, когда включать буферизацию: состояние приходит снаружи.
 */
@Component({
  selector: 'app-buffering-indicator-demo',
  imports: [
    BufferingIndicatorComponent,
    CodeSnippetComponent,
    DemoShellComponent,
    VideoDirective,
  ],
  templateUrl: './buffering-indicator-demo.html',
  styleUrl: './buffering-indicator-demo.scss',
})
export class BufferingIndicatorDemo {
  protected readonly video = inject(VideoService);

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  /** Состояние для ручной демонстрации: его задаёт родитель, не индикатор. */
  protected readonly demoState = signal<VideoState>('buffering');

  /** Для статичного примера стилизации индикатор всегда в состоянии buffering. */
  protected readonly bufferingState: VideoState = 'buffering';

  protected readonly responsibilities = [
    'Входы: state, delay (задержка появления, мс), customClass; выходов нет.',
    'Показывается только при state === "buffering"; момент включения определяет VideoService.',
    'CSS-переменные: --ngx-buffering-size, --ngx-buffering-thickness, --ngx-buffering-color, --ngx-buffering-track-color, --ngx-buffering-speed, --ngx-buffering-easing.',
    'role="status" и скрытый текст «Загрузка…» сообщают скринридеру о загрузке.',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
readonly video = inject(VideoService);

<!-- player.component.html -->
<div class="player">
  <video ngxVideo [src]="src" playsinline></video>

  <ngx-buffering-indicator [state]="video.state()" />
</div>

/* player.component.scss */
.player {
  position: relative;
}

ngx-buffering-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}`,

    manual: `<!-- состояние задаёт родитель -->
<ngx-buffering-indicator [state]="state()" />

<!-- показать, только если буферизация длится дольше 300 мс -->
<ngx-buffering-indicator [state]="state()" [delay]="300" />

// state — обычный сигнал родителя:
readonly state = signal<VideoState>('buffering');`,

    custom: `<!-- player.component.html -->
<ngx-buffering-indicator
  customClass="my-buffering"
  [state]="state()"
/>

/* player.component.scss — scoped-стили, без ::ng-deep */
.my-buffering {
  --ngx-buffering-size: 48px;
  --ngx-buffering-thickness: 4px;
  --ngx-buffering-color: #34d399;
  --ngx-buffering-track-color: rgba(52, 211, 153, 0.25);
  --ngx-buffering-speed: 0.6s;
  --ngx-buffering-easing: ease-in;
}`,
  } as const;

  protected setDemoState(state: VideoState): void {
    this.demoState.set(state);
  }
}
