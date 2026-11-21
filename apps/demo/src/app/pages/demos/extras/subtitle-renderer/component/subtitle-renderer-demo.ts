import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { SubtitleRendererComponent } from '@erst_dev/ngx-video-extras';

import { CodeSnippetComponent } from '../../../../../code-snippet/code-snippet';
import { DemoShellComponent } from '../../../../../demo-shell/demo-shell';
import { DEMO_VTT } from '../constants/subtitle-renderer-demo.constants';

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
