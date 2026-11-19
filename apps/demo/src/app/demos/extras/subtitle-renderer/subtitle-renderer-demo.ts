import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { SubtitleRendererComponent } from '@erst_dev/ngx-video-extras';

import { CodeSnippetComponent } from '../../shared/code-snippet/code-snippet';
import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Статическая дорожка WebVTT для демо.
 *
 * Содержит `NOTE`, cue с идентификатором, многострочные реплики, HTML-тег,
 * сущность `&amp;` и настройки после таймстемпа — чтобы проверить парсер.
 */
const DEMO_VTT = `WEBVTT

NOTE Этот блок парсер пропускает: NOTE, STYLE и REGION не становятся cue.

intro
00:00.500 --> 00:03.500
Sintel — короткометражный фильм Blender Foundation.

00:03.800 --> 00:07.500
Девушка ищет своего дракончика.
Вторая строка остаётся многострочной.

00:08.000 --> 00:13.000
Первая встреча с <i>драконом</i> &amp; начало пути.

00:13.500 --> 00:19.000
Небо, снег и долгая дорога.
Одна строка здесь — часть одной реплики.

00:19.500 --> 00:25.000
Субтитры рисуются поверх видео, не перехватывают клики
и не мешают управлению плеером.

00:26.000 --> 00:30.000 align:start position:10%
Шестой cue: настройки после таймстемпа игнорируются, а этот текст проверяет перенос длинной строки по ширине контейнера.
`;

/**
 * Демо для SubtitleRendererComponent.
 *
 * Один живой плеер: компонент получает статическую VTT-строку и
 * `video.time()`, а переключатели управляют `enabled` и `customClass`.
 * Три блока «Код примера» показывают разметку, загрузку VTT родителем и
 * стилизацию через CSS-переменные.
 */
@Component({
  selector: 'app-subtitle-renderer-demo',
  imports: [
    CodeSnippetComponent,
    DemoShellComponent,
    SubtitleRendererComponent,
    VideoDirective,
  ],
  providers: [VideoService],
  templateUrl: './subtitle-renderer-demo.html',
  styleUrl: './subtitle-renderer-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubtitleRendererDemo {
  protected readonly video = inject(VideoService);

  protected readonly src = 'https://media.w3.org/2010/05/sintel/trailer.mp4';

  protected readonly vtt = DEMO_VTT;

  protected readonly subtitlesEnabled = signal(true);
  protected readonly largeText = signal(false);
  protected readonly customStyle = signal(false);

  protected readonly subtitleClass = computed(() =>
    [
      this.largeText() ? 'demo-subtitle--large' : '',
      this.customStyle() ? 'demo-subtitle--custom' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly isPlaying = computed(() => {
    const state = this.video.state();
    return state === 'playing' || state === 'buffering';
  });

  protected readonly responsibilities = [
    'Входы: vtt (содержимое, не URL), currentTime, enabled, customClass; выходов нет.',
    'Парсит WebVTT только при изменении vtt и выбирает активные cues по currentTime.',
    'Не загружает VTT, не управляет дорожками и не знает о VideoService; pointer-events: none.',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
readonly video = inject(VideoService);

<!-- player.component.html -->
<div class="player">
  <video ngxVideo [src]="src" playsinline></video>

  <ngx-subtitle-renderer
    [vtt]="vtt()"
    [currentTime]="video.time()"
    [enabled]="subtitlesEnabled()"
    [customClass]="subtitleClass()"
  />
</div>

/* player.component.scss */
.player {
  position: relative;
  overflow: hidden;
}`,

    sync: `// player.component.ts
readonly video = inject(VideoService);
readonly vtt = signal('');

protected async loadVtt(): Promise<void> {
  const response = await fetch('/subtitles/sintel.vtt');
  this.vtt.set(await response.text());
}

<!-- player.component.html -->
<ngx-subtitle-renderer
  [vtt]="vtt()"
  [currentTime]="video.time()"
/>`,

    custom: `<!-- player.component.html -->
<ngx-subtitle-renderer
  customClass="my-subtitles"
  [vtt]="vtt()"
  [currentTime]="video.time()"
/>

/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-subtitles {
  --ngx-subtitle-font-size: 1.5rem;
  --ngx-subtitle-font-family: Georgia, 'Times New Roman', serif;
  --ngx-subtitle-color: #fef3c7;
  --ngx-subtitle-bg: rgba(120, 53, 15, 0.85);
  --ngx-subtitle-border-radius: 0.5rem;
}`,
  } as const;

  protected togglePlay(): void {
    this.video.toggle();
  }

  protected toggleSubtitles(): void {
    this.subtitlesEnabled.update((value) => !value);
  }

  protected toggleLargeText(): void {
    this.largeText.update((value) => !value);
  }

  protected toggleCustomStyle(): void {
    this.customStyle.update((value) => !value);
  }
}
