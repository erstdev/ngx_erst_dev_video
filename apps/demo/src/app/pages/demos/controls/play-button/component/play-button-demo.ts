import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { PlayButtonComponent } from '@erst_dev/ngx-video-controls';

import { CodeSnippetComponent } from '../../../shared/code-snippet/code-snippet';
import { DemoShellComponent } from '../../../shared/demo-shell/demo-shell';
import { PlayerLayoutDemo } from './player-layout-demo';

/**
 * Демо для PlayButtonComponent.
 *
 * Пять сценариев: стандартная кнопка, переопределение CSS-переменных через
 * `customClass`, собственная иконка через `ng-template` и две раскладки на
 * плеере — по центру видео и в нижней панели контролов.
 *
 * У каждого примера есть блок «Код примера» с готовым HTML и SCSS.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-play-button-demo',
  imports: [
    CodeSnippetComponent,
    DemoShellComponent,
    PlayButtonComponent,
    PlayerLayoutDemo,
    VideoDirective,
  ],
  templateUrl: './play-button-demo.html',
  styleUrl: './play-button-demo.scss',
})
export class PlayButtonDemo {
  protected readonly video = inject(VideoService);

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  protected readonly responsibilities = [
    'Входы: state, customClass, ariaLabel, iconTemplate; выход: toggle.',
    'CSS-переменные: --ngx-play-size, --ngx-play-icon-size, --ngx-play-color, --ngx-play-bg, --ngx-play-hover-bg, --ngx-play-border-radius, --ngx-play-transition.',
    'Клик только эмитит toggle — воспроизведением управляет родитель.',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
readonly video = inject(VideoService);

<!-- player.component.html -->
<video ngxVideo [src]="src" (click)="video.toggle()"></video>

<ngx-play-button
  [state]="video.state()"
  (toggle)="video.toggle()"
/>`,

    custom: `<!-- player.component.html -->
<ngx-play-button
  customClass="my-play"
  [state]="video.state()"
  (toggle)="video.toggle()"
/>

/* player.component.scss */
.my-play {
  --ngx-play-size: 64px;
  --ngx-play-icon-size: 45%;
  --ngx-play-bg: #059669;
  --ngx-play-hover-bg: #047857;
  --ngx-play-border-radius: 12px;
}`,

    icon: `<!-- player.component.html -->
<ngx-play-button
  [state]="video.state()"
  [iconTemplate]="myIcon"
  (toggle)="video.toggle()"
/>

<ng-template #myIcon let-playing="playing" let-state="state">
  <span class="my-icon">{{ playing ? '⏸' : '▶' }}</span>
</ng-template>`,

    center: `<!-- player.component.html -->
<div class="player">
  <video ngxVideo [src]="src" playsinline></video>

  <ngx-play-button
    customClass="player__play"
    [state]="video.state()"
    (toggle)="video.toggle()"
  />
</div>

/* player.component.scss */
.player {
  position: relative;
  background: #000;
}

.player__play {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  transform: translate(-50%, -50%);

  --ngx-play-size: 72px;
  --ngx-play-bg: rgba(0, 0, 0, 0.5);
  --ngx-play-hover-bg: rgba(0, 0, 0, 0.75);
}`,

    controlsBar: `<!-- player.component.html -->
<div class="player">
  <video ngxVideo [src]="src" playsinline></video>

  <div class="player__controls">
    <ngx-play-button [state]="video.state()" (toggle)="video.toggle()" />
  </div>
</div>

/* player.component.scss */
.player {
  position: relative;
}

.player__controls {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.player:hover .player__controls,
.player:focus-within .player__controls {
  opacity: 1;
}`,
  } as const;
}
