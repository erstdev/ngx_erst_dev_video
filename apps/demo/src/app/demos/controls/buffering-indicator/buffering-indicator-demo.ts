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
 * Четыре сценария: живой индикатор поверх видео, ручное переключение состояния
 * (включая задержку появления), стилизация через `customClass` и собственный
 * индикатор через `indicatorTemplate` со своими `@keyframes`.
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
    'Входы: state, delay (задержка появления, мс), indicatorTemplate, customClass; выходов нет.',
    'Показывается только при state === "buffering"; момент включения определяет VideoService.',
    'CSS-переменные: --ngx-buffering-size/-thickness/-color/-track-color и все параметры анимации — --ngx-buffering-speed, -easing, -delay, -iteration-count, -direction, -fill-mode, -play-state.',
    'indicatorTemplate заменяет визуальный спиннер и позволяет задать свои @keyframes в стилях потребителя; role="status" и скрытый текст «Загрузка…» остаются за компонентом.',
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
  --ngx-buffering-direction: alternate;
}`,

    template: `<!-- player.component.html -->
<ngx-buffering-indicator
  [state]="video.state()"
  [indicatorTemplate]="myIndicator"
/>

<ng-template #myIndicator>
  <span class="my-indicator"></span>
</ng-template>

/* player.component.scss — свои @keyframes в стилях потребителя */
.my-indicator {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(#34d399 0 30%, rgba(52, 211, 153, 0.2) 0);
  animation: my-indicator-pulse 0.8s ease-in-out infinite alternate;
}

@keyframes my-indicator-pulse {
  from {
    transform: scale(0.7);
    opacity: 0.5;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}`,
  } as const;

  protected setDemoState(state: VideoState): void {
    this.demoState.set(state);
  }
}
