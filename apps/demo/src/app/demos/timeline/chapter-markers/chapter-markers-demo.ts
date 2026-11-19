import { Component, inject, signal } from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import {
  ChapterMarkersComponent,
  TimelineComponent,
  type ChapterInterface,
} from '@erst_dev/ngx-video-timeline';

import { CodeSnippetComponent } from '../../shared/code-snippet/code-snippet';
import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для ChapterMarkersComponent.
 *
 * Маркеры лежат поверх таймлайна, подсвечивают активную главу и отдают
 * `chapterSelect` с полным объектом главы. Перемотку применяет родитель.
 */
@Component({
  selector: 'app-chapter-markers-demo',
  imports: [
    ChapterMarkersComponent,
    CodeSnippetComponent,
    DemoShellComponent,
    TimelineComponent,
    VideoDirective,
  ],
  providers: [VideoService],
  templateUrl: './chapter-markers-demo.html',
  styleUrl: './chapter-markers-demo.scss',
})
export class ChapterMarkersDemo {
  protected readonly video = inject(VideoService);

  protected readonly selectedChapter = signal<string | null>(null);

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  protected readonly chapters: readonly ChapterInterface[] = [
    { id: 'intro', time: 0, title: 'Вступление' },
    { id: 'middle', time: 1.5, title: 'Середина' },
    { id: 'finale', time: 3.5, title: 'Финал' },
  ];

  protected readonly responsibilities = [
    'Входы: chapters, duration, currentTime, customClass, ariaLabel; выход chapterSelect.',
    'Маркеры — нативные кнопки: Tab, Enter/Space и focus-visible работают из коробки.',
    'Клик по маркеру не проваливается в таймлайн; родитель применяет video.seek($event.time).',
    'Не парсит метаданные видео и не редактирует главы.',
  ];

  protected onChapterSelect(chapter: ChapterInterface): void {
    this.selectedChapter.set(chapter.title);
    this.video.seek(chapter.time);
  }

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
readonly chapters: ChapterInterface[] = [
  { id: 'intro', time: 0, title: 'Вступление' },
  { id: 'middle', time: 120, title: 'Середина' },
  { id: 'finale', time: 300, title: 'Финал' },
];

<!-- player.component.html -->
<div class="timeline-track">
  <ngx-timeline
    [currentTime]="video.time()"
    [duration]="video.duration()"
    (seek)="video.seek($event)"
  />

  <ngx-chapter-markers
    [chapters]="chapters"
    [duration]="video.duration()"
    [currentTime]="video.time()"
    (chapterSelect)="video.seek($event.time)"
  />
</div>

/* player.component.scss */
.timeline-track {
  position: relative;
}`,

    select: `// player.component.ts
onChapterSelect(chapter: ChapterInterface): void {
  this.selectedChapter.set(chapter.title);
  this.video.seek(chapter.time);
}

<!-- player.component.html -->
<ngx-chapter-markers
  [chapters]="chapters"
  [duration]="video.duration()"
  [currentTime]="video.time()"
  (chapterSelect)="onChapterSelect($event)"
/>`,

    custom: `<!-- player.component.html -->
<ngx-chapter-markers
  customClass="my-chapters"
  [chapters]="chapters"
  [duration]="video.duration()"
  [currentTime]="video.time()"
  (chapterSelect)="video.seek($event.time)"
/>

/* player.component.scss — scoped-стили, без ::ng-deep */
.my-chapters {
  --ngx-timeline-chapter-color: #34d399;
  --ngx-timeline-chapter-active-color: #6ee7b7;
  --ngx-timeline-chapter-size: 10px;
  --ngx-timeline-chapter-height: 18px;
  --ngx-timeline-chapter-hit-size: 28px;
}`,
  } as const;
}
