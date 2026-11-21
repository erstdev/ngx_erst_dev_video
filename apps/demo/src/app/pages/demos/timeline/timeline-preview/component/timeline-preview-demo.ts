import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import {
  TimelineComponent,
  TimelinePreviewComponent,
} from '@erst_dev/ngx-video-timeline';

import { CodeSnippetComponent } from '../../../shared/code-snippet/code-snippet';
import { DemoShellComponent } from '../../../shared/demo-shell/demo-shell';

/**
 * Демо для TimelinePreviewComponent.
 *
 * Показывает кадр под курсором через `previewTemplate` таймлайна и позволяет
 * полностью отключить превью: при `enabled = false` скрытое видео не создаётся
 * и не загружается.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-timeline-preview-demo',
  imports: [
    CodeSnippetComponent,
    DemoShellComponent,
    TimelineComponent,
    TimelinePreviewComponent,
    VideoDirective,
  ],
  providers: [VideoService],
  templateUrl: './timeline-preview-demo.html',
  styleUrl: './timeline-preview-demo.scss',
})
export class TimelinePreviewDemo {
  protected readonly video = inject(VideoService);

  protected readonly previewEnabled = signal(true);

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  protected readonly responsibilities = [
    'Входы: time, src, enabled, previewSrc, customClass; выходов нет.',
    'Кадр берётся из отдельного скрытого <video> и рисуется в canvas: основной плеер не перематывается.',
    'enabled = false полностью отключает превью и освобождает скрытое видео.',
    'CSS-переменные: --ngx-timeline-preview-*; компонент декоративный, aria-hidden.',
  ];

  protected togglePreview(): void {
    this.previewEnabled.update((enabled) => !enabled);
  }

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
readonly video = inject(VideoService);

<!-- player.component.html -->
<ngx-timeline
  [currentTime]="video.time()"
  [duration]="video.duration()"
  [previewTemplate]="preview"
  (seek)="video.seek($event)"
/>

<ng-template #preview let-time="time">
  <ngx-timeline-preview [time]="time" [src]="src" />
</ng-template>`,

    disable: `// player.component.ts
readonly previewEnabled = signal(true);

<!-- player.component.html -->
<ngx-timeline
  [duration]="video.duration()"
  [currentTime]="video.time()"
  [previewTemplate]="preview"
  (seek)="video.seek($event)"
/>

<ng-template #preview let-time="time">
  <ngx-timeline-preview
    [time]="time"
    [src]="src"
    [enabled]="previewEnabled()"
  />
</ng-template>

<button type="button" (click)="previewEnabled.set(!previewEnabled())">
  {{ previewEnabled() ? 'Отключить превью' : 'Включить превью' }}
</button>`,

    style: `<!-- player.component.html -->
<ngx-timeline-preview
  customClass="my-preview"
  [time]="time"
  [src]="src"
/>

/* player.component.scss — scoped-стили, без ::ng-deep */
.my-preview {
  --ngx-timeline-preview-width: 200px;
  --ngx-timeline-preview-radius: 0.5rem;
  --ngx-timeline-preview-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}`,
  } as const;
}
