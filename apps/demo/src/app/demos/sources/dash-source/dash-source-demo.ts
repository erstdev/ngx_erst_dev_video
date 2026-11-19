import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import type { QualityInterface, VideoError } from '@erst_dev/ngx-video-core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { DashSourceDirective } from '@erst_dev/ngx-video-sources';

import { CodeSnippetComponent } from '../../shared/code-snippet/code-snippet';
import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для DashSourceDirective.
 *
 * Живой DASH-плеер и три блока «Код примера»: базовая разметка, уровни качества
 * и ошибки/autoplay/SSR. Директива только подключает поток и отдаёт уровни;
 * воспроизведением управляет `VideoService`, а выбор качества — локальный
 * сигнал демо, который уходит во вход `level`.
 */
@Component({
  selector: 'app-dash-source-demo',
  imports: [
    CodeSnippetComponent,
    DashSourceDirective,
    DemoShellComponent,
    VideoDirective,
  ],
  providers: [VideoService],
  templateUrl: './dash-source-demo.html',
  styleUrl: './dash-source-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashSourceDemo {
  protected readonly video = inject(VideoService);

  /** Публичный DASH-манифест с несколькими уровнями качества (180–1080p). */
  protected readonly src =
    'https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd';

  /** Уровни, которые директива отдала после `STREAM_INITIALIZED`. */
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
    'Селектор [ngxDashSource]: DASH-манифест через dash.js, только MSE.',
    'Уровни и ошибки — только через выходы; интерфейс рисует потребитель.',
    'Состояние ведёт VideoService: директиву не вызывают через play() и seek().',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { DashSourceDirective } from '@erst_dev/ngx-video-sources';

@Component({
  imports: [VideoDirective, DashSourceDirective],
  providers: [VideoService],
  template: \`
    <video ngxVideo [ngxDashSource]="src" playsinline></video>
  \`,
})
export class PlayerComponent {
  readonly src = 'https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd';
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
  [ngxDashSource]="src"
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
  [ngxDashSource]="src"
  [autoplay]="false"
  [enabled]="enabled()"
  (error)="onError($event)"
></video>

@if (error(); as error) {
  <p role="alert">{{ error.message }} ({{ error.code }})</p>
}

// SSR: dashjs импортируется динамически только в браузере.
// Нативного DASH в браузерах нет: без MediaSource директива
// эмитит source-not-supported, фолбэка через video.src не будет.`,
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

/** Отличает `VideoError` директивы от нативного события `error` на `<video>`. */
function isVideoError(value: unknown): value is VideoError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { code?: unknown; message?: unknown };

  return (
    typeof candidate.code === 'string' && typeof candidate.message === 'string'
  );
}
