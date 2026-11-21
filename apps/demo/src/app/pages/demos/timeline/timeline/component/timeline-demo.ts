import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { TimelineComponent } from '@erst_dev/ngx-video-timeline';

import { CodeSnippetComponent } from '../../../../../code-snippet/code-snippet';
import { DemoShellComponent } from '../../../../../demo-shell/demo-shell';

/**
 * Демо для TimelineComponent.
 *
 * Показывает базовую полосу под видео, стилизацию через `customClass` и
 * обработку `scrubStart`/`scrubEnd`: на время перетаскивания видео ставится
 * на паузу, а после отпускания возобновляется, если играло.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-timeline-demo',
  imports: [
    CodeSnippetComponent,
    DemoShellComponent,
    TimelineComponent,
    VideoDirective,
  ],
  providers: [VideoService],
  templateUrl: './timeline-demo.html',
  styleUrl: './timeline-demo.scss',
})
export class TimelineDemo {
  protected readonly video = inject(VideoService);

  protected readonly scrubbing = signal(false);

  private wasPlaying = false;

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  protected readonly responsibilities = [
    'Входы: currentTime, duration, buffered, keyboardStep, customClass, ariaLabel, previewTemplate.',
    'Выходы: seek (number) — на отпускании, клике или с клавиатуры; scrubStart/scrubEnd (void) — границы pointer-жеста.',
    'Базовая версия использует вариант A: во время drag двигается локальный dragTime, seek эмитится один раз при отпускании.',
    'Компонент не вызывает video.seek() и не хранит состояние: перемотку применяет родитель.',
  ];

  protected onScrubStart(): void {
    this.wasPlaying = this.video.isPlaying();
    this.scrubbing.set(true);
    this.video.pause();
  }

  protected onScrubEnd(): void {
    this.scrubbing.set(false);

    if (this.wasPlaying) {
      void this.video.play();
    }

    this.wasPlaying = false;
  }

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
readonly video = inject(VideoService);

<!-- player.component.html -->
<video ngxVideo [src]="src" (click)="video.toggle()"></video>

<ngx-timeline
  [currentTime]="video.time()"
  [duration]="video.duration()"
  [buffered]="video.buffered()"
  (seek)="video.seek($event)"
/>`,

    custom: `<!-- player.component.html -->
<ngx-timeline
  customClass="my-timeline"
  [currentTime]="video.time()"
  [duration]="video.duration()"
  [buffered]="video.buffered()"
  (seek)="video.seek($event)"
/>

/* player.component.scss — scoped-стили, без ::ng-deep */
.my-timeline {
  --ngx-timeline-height: 6px;
  --ngx-timeline-progress-color: #34d399;
  --ngx-timeline-buffered-color: rgba(52, 211, 153, 0.4);
  --ngx-timeline-thumb-color: #34d399;
  --ngx-timeline-thumb-size: 18px;
}`,

    scrub: `<!-- player.component.html -->
<ngx-timeline
  [currentTime]="video.time()"
  [duration]="video.duration()"
  (seek)="video.seek($event)"
  (scrubStart)="onScrubStart()"
  (scrubEnd)="onScrubEnd()"
/>

// player.component.ts
private wasPlaying = false;

onScrubStart(): void {
  this.wasPlaying = this.video.isPlaying();
  this.video.pause();
}

onScrubEnd(): void {
  if (this.wasPlaying) {
    void this.video.play();
  }

  this.wasPlaying = false;
}`,
  } as const;
}
