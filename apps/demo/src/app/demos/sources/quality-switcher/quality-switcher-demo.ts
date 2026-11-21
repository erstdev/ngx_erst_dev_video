import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import type { QualityInterface, VideoError } from '@erst_dev/ngx-video-core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import {
  HlsSourceDirective,
  QualitySwitcherComponent,
} from '@erst_dev/ngx-video-sources';

import { CodeSnippetComponent } from '../../shared/code-snippet/code-snippet';
import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';
import { isVideoError } from '../../shared/utils/is-video-error.util';
import type { QualityThemeId } from './types/quality-theme-id.type';

/**
 * Демо для QualitySwitcherComponent.
 *
 * Живой HLS-плеер: директива доставляет поток и отдаёт уровни, компонент
 * показывает селект и эмитит `id` выбора. Применяет качество директива через
 * вход `level`, а фактический уровень приходит из её `levelChange`.
 */
@Component({
  selector: 'app-quality-switcher-demo',
  imports: [
    CodeSnippetComponent,
    DemoShellComponent,
    HlsSourceDirective,
    QualitySwitcherComponent,
    VideoDirective,
  ],
  providers: [VideoService],
  templateUrl: './quality-switcher-demo.html',
  styleUrl: './quality-switcher-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QualitySwitcherDemo {
  protected readonly video = inject(VideoService);

  /** Публичный HLS-манифест с несколькими уровнями качества. */
  protected readonly src = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  /** Уровни, которые директива отдала после `MANIFEST_PARSED`. */
  protected readonly levels = signal<readonly QualityInterface[]>([]);

  /** `id` для компонента и входа `level` директивы; `null` — Auto. */
  protected readonly level = signal<string | null>(null);

  /** Фактический уровень из `levelChange` директивы — для подписи. */
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

  /** Выбранная тема оформления: меняет только CSS-переменные через класс. */
  protected readonly theme = signal<QualityThemeId>('emerald');

  /** Готовые темы: подпись и классы, которые уходят в `customClass`. */
  protected readonly themes = [
    { id: 'default', label: 'По умолчанию', className: '' },
    { id: 'emerald', label: 'Изумруд', className: 'demo-quality' },
    {
      id: 'compact',
      label: 'Компактный',
      className: 'demo-quality demo-quality--compact',
    },
    {
      id: 'light',
      label: 'Светлый',
      className: 'demo-quality demo-quality--light',
    },
  ] as const;

  /** Классы для живого селекта и предпросмотра. */
  protected readonly qualityClass = computed(
    () => this.themes.find((item) => item.id === this.theme())?.className ?? '',
  );

  /** Уровни для предпросмотра темы — не связаны с потоком. */
  protected readonly previewLevels: readonly QualityInterface[] = [
    { id: '360', label: '360p' },
    { id: '720', label: '720p' },
    { id: '1080', label: '1080p' },
  ];

  /** Выбранный уровень в предпросмотре. */
  protected readonly previewLevel = signal<string | null>('720');

  /** Дефолты CSS-переменных компонента — публичный контракт. */
  protected readonly cssVariables = [
    { name: '--ngx-quality-bg', defaultValue: 'rgba(0, 0, 0, 0.6)' },
    { name: '--ngx-quality-color', defaultValue: '#ffffff' },
    {
      name: '--ngx-quality-border-color',
      defaultValue: 'rgba(255, 255, 255, 0.3)',
    },
    { name: '--ngx-quality-border-radius', defaultValue: '0.375rem' },
    { name: '--ngx-quality-padding', defaultValue: '0.25rem 0.5rem' },
    { name: '--ngx-quality-font-size', defaultValue: '0.8125rem' },
    { name: '--ngx-quality-focus-color', defaultValue: '#60a5fa' },
    { name: '--ngx-quality-transition', defaultValue: '0.15s ease' },
  ] as const;

  protected readonly responsibilities = [
    'Компонент показывает Auto и levels в заданном порядке и эмитит id выбора или null.',
    'Он не парсит манифесты, не хранит состояние и не применяет качество.',
    'Качество применяет директива через [level], фактический уровень отдаёт её (levelChange).',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
import { signal } from '@angular/core';
import type { QualityInterface } from '@erst_dev/ngx-video-core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import {
  HlsSourceDirective,
  QualitySwitcherComponent,
} from '@erst_dev/ngx-video-sources';

@Component({
  imports: [VideoDirective, HlsSourceDirective, QualitySwitcherComponent],
  providers: [VideoService],
  template: \`
    <video
      ngxVideo
      [ngxHlsSource]="src"
      [level]="level()"
      (levelsChange)="onLevelsChange($event)"
      (levelChange)="onLevelChange($event)"
      playsinline
    ></video>

    <ngx-quality-switcher
      [levels]="levels()"
      [level]="level()"
      (levelChange)="level.set($event)"
    />
  \`,
})
export class PlayerComponent {
  readonly src = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  // id для компонента и входа level директивы; null — Auto.
  readonly level = signal<string | null>(null);

  // Уровни приходят из levelsChange директивы.
  readonly levels = signal<readonly QualityInterface[]>([]);

  // Фактический уровень из levelChange директивы — для подписи.
  readonly currentLevel = signal<QualityInterface | null>(null);

  protected onLevelsChange(levels: readonly QualityInterface[]): void {
    this.levels.set(levels);

    // Выбранный id исчез из списка — возвращаемся к Auto.
    if (this.level() !== null && !levels.some((item) => item.id === this.level())) {
      this.level.set(null);
    }
  }

  protected onLevelChange(level: QualityInterface | null): void {
    this.currentLevel.set(level);
  }
}`,

    dash: `// player.component.ts
import {
  DashSourceDirective,
  QualitySwitcherComponent,
} from '@erst_dev/ngx-video-sources';

@Component({
  imports: [VideoDirective, DashSourceDirective, QualitySwitcherComponent],
  // ...
})
export class DashPlayerComponent {
  readonly dashSrc = 'https://example.com/stream.mpd';
  // levels, level и currentLevel — как в HLS-примере.
}

<!-- player.component.html -->
<video
  ngxVideo
  [ngxDashSource]="dashSrc"
  [level]="level()"
  (levelsChange)="onLevelsChange($event)"
  (levelChange)="onLevelChange($event)"
  playsinline
></video>

<ngx-quality-switcher
  [levels]="levels()"
  [level]="level()"
  (levelChange)="level.set($event)"
/>

// Контракт компонента не зависит от источника:
//   levelChange компонента — string | null (id уровня);
//   levelChange директивы  — QualityInterface | null (фактический уровень).
// DASH без MSE не играется: levelsChange не эмитится, список остаётся пустым.`,

    styling: `<!-- player.component.html -->
<ngx-quality-switcher
  customClass="player-quality"
  ariaLabel="Выберите качество видео"
  [levels]="levels()"
  [level]="level()"
  (levelChange)="level.set($event)"
/>

/* player.component.scss — scoped-стили, без ::ng-deep */
.player-quality {
  --ngx-quality-bg: #111827;
  --ngx-quality-color: #e5e7eb;
  --ngx-quality-border-color: #374151;
  --ngx-quality-border-radius: 999px;
  --ngx-quality-padding: 0.375rem 0.75rem;
  --ngx-quality-font-size: 0.875rem;
  --ngx-quality-focus-color: #34d399;
  --ngx-quality-transition: 0.2s ease;
}

// CSS-переменные — публичный контракт с дефолтами в :host.
// customClass вешается на <ngx-quality-switcher>, не на внутренний <select>.
// ariaLabel уходит в aria-label нативного селекта.`,
  } as const;

  protected selectTheme(id: QualityThemeId): void {
    this.theme.set(id);
  }

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
    // Angular позовёт обработчик и для него. Отличаем по полям code/message.
    if (!isVideoError(error)) {
      return;
    }

    this.error.set(error);
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
