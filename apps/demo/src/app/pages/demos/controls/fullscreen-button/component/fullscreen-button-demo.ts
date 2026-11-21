import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { FullscreenButtonComponent } from '@erst_dev/ngx-video-controls';

import { CodeSnippetComponent } from '../../../../../code-snippet/code-snippet';
import { DemoShellComponent } from '../../../../../demo-shell/demo-shell';

/**
 * Демо для FullscreenButtonComponent.
 *
 * Три сценария: кнопка на плеере, стилизация через `customClass` и своя иконка
 * через `ng-template`. Состояние приходит из `VideoService`, а Fullscreen API
 * вызывает родитель по выходу `toggle`.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fullscreen-button-demo',
  imports: [
    CodeSnippetComponent,
    DemoShellComponent,
    FullscreenButtonComponent,
    VideoDirective,
  ],
  templateUrl: './fullscreen-button-demo.html',
  styleUrl: './fullscreen-button-demo.scss',
})
export class FullscreenButtonDemo {
  protected readonly video = inject(VideoService);

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  protected readonly responsibilities = [
    'Входы: fullscreen, customClass, ariaLabel, iconTemplate; выход: toggle.',
    'CSS-переменные: --ngx-fullscreen-size, --ngx-fullscreen-icon-size, --ngx-fullscreen-color, --ngx-fullscreen-bg, --ngx-fullscreen-hover-bg, --ngx-fullscreen-border-radius, --ngx-fullscreen-transition.',
    'Иконка и подпись переключаются по входу fullscreen; aria-pressed отражает состояние.',
    'Fullscreen API не вызывает: запрос делает родитель, например video.toggleFullscreen().',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
readonly video = inject(VideoService);

<!-- player.component.html -->
<video ngxVideo [src]="src" playsinline></video>

<ngx-fullscreen-button
  [fullscreen]="video.fullscreen()"
  (toggle)="video.toggleFullscreen()"
/>`,

    custom: `<!-- player.component.html -->
<ngx-fullscreen-button
  customClass="my-fullscreen"
  [fullscreen]="video.fullscreen()"
  (toggle)="video.toggleFullscreen()"
/>

/* player.component.scss — scoped-стили, без ::ng-deep */
.my-fullscreen {
  --ngx-fullscreen-size: 40px;
  --ngx-fullscreen-bg: transparent;
  --ngx-fullscreen-hover-bg: rgba(255, 255, 255, 0.15);
  --ngx-fullscreen-border-radius: 8px;
}`,

    icon: `<!-- player.component.html -->
<ngx-fullscreen-button
  [fullscreen]="video.fullscreen()"
  [iconTemplate]="myIcon"
  (toggle)="video.toggleFullscreen()"
/>

<ng-template #myIcon let-fullscreen="fullscreen">
  <span class="my-icon">{{ fullscreen ? '⤡' : '⤢' }}</span>
</ng-template>`,
  } as const;
}
