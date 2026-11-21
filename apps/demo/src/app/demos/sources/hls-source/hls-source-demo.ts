import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import type { QualityInterface, VideoError } from '@erst_dev/ngx-video-core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { HlsSourceDirective } from '@erst_dev/ngx-video-sources';

import { CodeSnippetComponent } from '../../shared/code-snippet/code-snippet';
import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';
import { isVideoError } from '../../shared/utils/is-video-error.util';

/**
 * Демо для HlsSourceDirective.
 *
 * Живой HLS-плеер и три блока «Код примера»: базовая разметка, уровни качества
 * и ошибки/autoplay/SSR. Директива только подключает поток и отдаёт уровни;
 * воспроизведением управляет `VideoService`, а выбор качества — локальный
 * сигнал демо, который уходит во вход `level`.
 */
@Component({
  selector: 'app-hls-source-demo',
  imports: [
    CodeSnippetComponent,
    DemoShellComponent,
    HlsSourceDirective,
    VideoDirective,
  ],
  providers: [VideoService],
  templateUrl: './hls-source-demo.html',
  styleUrl: './hls-source-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlsSourceDemo {
  protected readonly video = inject(VideoService);

  /** Публичный HLS-манифест с несколькими уровнями качества. */
  protected readonly src = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  /** Уровни, которые директива отдала после `MANIFEST_PARSED`. */
  protected readonly levels = signal<readonly QualityInterface[]>([]);

  /** Выбранный уровень: `id` из `levelsChange`, `null` — auto. */
  protected readonly level = signal<string | null>(null);

  /** Фактически выбранный уровень: `null` означает auto. */
  protected readonly currentLevel = signal<QualityInterface | null>(null);

  /** Последняя ошибка директивы. */
  protected readonly error = signal<VideoError | null>(null);

  protected readonly enabled = signal(true);

  protected readonly autoplay = signal(false);

  protected readonly playLabel = computed(() =>
    this.video.state() === 'playing' || this.video.state() === 'buffering'
      ? 'Пауза'
      : 'Play',
  );

  protected readonly currentLevelLabel = computed(
    () => this.currentLevel()?.label ?? 'auto',
  );

  protected readonly responsibilities = [
    'Селектор [ngxHlsSource]: hls.js через динамический импорт или нативный HLS.',
    'Уровни и ошибки — только через выходы; интерфейс рисует потребитель.',
    'Состояние ведёт VideoService: директиву не вызывают через play() и seek().',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { HlsSourceDirective } from '@erst_dev/ngx-video-sources';

@Component({
  imports: [VideoDirective, HlsSourceDirective],
  providers: [VideoService],
  template: \`
    <video ngxVideo [ngxHlsSource]="src" playsinline></video>
  \`,
})
export class PlayerComponent {
  readonly src = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
}`,

    levels: `// player.component.ts
readonly levels = signal<readonly QualityInterface[]>([]);
readonly level = signal<string | null>(null);

protected onLevelsChange(levels: readonly QualityInterface[]): void {
  this.levels.set(levels);
}

protected onLevelChange(level: QualityInterface | null): void {
  this.currentLevel.set(level);
}

protected onLevelSelect(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;
  this.level.set(value === '' ? null : value);
}

<!-- player.component.html -->
<video
  ngxVideo
  [ngxHlsSource]="src"
  [level]="level()"
  (levelsChange)="onLevelsChange($event)"
  (levelChange)="onLevelChange($event)"
></video>

<select [value]="level() ?? ''" (change)="onLevelSelect($event)">
  <option value="">Auto</option>
  @for (item of levels(); track item.id) {
    <option [value]="item.id">{{ item.label }}</option>
  }
</select>`,

    errors: `// player.component.ts
protected onError(error: VideoError | Event): void {
  // На <video> имя выхода совпадает с нативным событием error:
  // обработчик получает и его. У VideoError есть code и message.
  if (!isVideoError(error)) {
    return;
  }

  this.error.set(error);
  // error.code: network | decode | source-not-supported
  //            | playback-blocked | unknown
}

<!-- player.component.html -->
<video
  ngxVideo
  [ngxHlsSource]="src"
  [autoplay]="false"
  [enabled]="enabled()"
  (error)="onError($event)"
></video>

@if (error(); as error) {
  <p role="alert">{{ error.message }} ({{ error.code }})</p>
}

// SSR: hls.js импортируется динамически только в браузере.
// На сервере директива не трогает DOM и не загружает манифест.`,
  } as const;

  protected onLevelsChange(levels: readonly QualityInterface[]): void {
    this.levels.set(levels);

    const selected = this.level();

    if (selected !== null && !levels.some((item) => item.id === selected)) {
      this.level.set(null);
    }
  }

  protected onLevelChange(level: QualityInterface | null): void {
    this.currentLevel.set(level);
  }

  protected onError(error: VideoError | Event): void {
    // На `<video>` имя выхода `error` совпадает с нативным событием:
    // Angular позовёт обработчик и для него. Нативные ошибки медиа ведёт
    // VideoService, а директорный `VideoError` приходит с `code` и `message`.
    if (!isVideoError(error)) {
      return;
    }

    this.error.set(error);
  }

  protected onLevelSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.level.set(value === '' ? null : value);
  }

  protected togglePlay(): void {
    this.video.toggle();
  }

  protected toggleEnabled(): void {
    this.error.set(null);
    this.enabled.update((value) => !value);
  }

  protected toggleAutoplay(): void {
    this.autoplay.update((value) => !value);
  }
}
