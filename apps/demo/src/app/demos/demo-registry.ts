import type { UiKey } from '../i18n/ui-strings';

/**
 * Реестр сайта: используется главной, сайдбаром документации и demo-shell.
 * У каждого кирпича два адреса — живой пример и API-справка.
 */
export type DemoStatus = 'ready' | 'wip' | 'planned';

/** Идентификаторы пакетов сайта. */
export type DemoGroupId =
  'core' | 'controls' | 'timeline' | 'extras' | 'sources' | 'capture';

export interface DemoEntry {
  /** Идентификатор внутри группы (совпадает с именем каталога демо). */
  readonly id: string;
  /**
   * Путь маршрута примера без ведущего слэша (совпадает с `path` в
   * `app.routes.ts`). Ссылка строится как `'/' + path`: массив команд вида
   * `['/', path]` Angular превращает в один закодированный сегмент (`%2F`)
   * и маршрут не находится.
   */
  readonly path: string;
  /** Маршрут API-справки без локали: `docs/<пакет>` или `docs/<пакет>/<кирпич>`. */
  readonly docsPath: string;
  readonly title: string;
  /** Ключ перевода для заголовков, которые отличаются в локалях. */
  readonly titleKey?: UiKey;
  readonly status: DemoStatus;
}

export interface DemoGroup {
  readonly id: DemoGroupId;
  readonly title: string;
  readonly pkg: string;
  /** Маршрут README пакета без локали: `docs/<пакет>`. */
  readonly docsPath: string;
  /** Платный пакет (capture). */
  readonly pro?: boolean;
  readonly demos: readonly DemoEntry[];
}

export const DEMO_GROUPS: readonly DemoGroup[] = [
  {
    id: 'core',
    title: 'Core',
    pkg: '@erst_dev/ngx-video-core',
    docsPath: 'docs/core',
    demos: [
      {
        id: 'video-service',
        path: 'core/video-service',
        docsPath: 'docs/core',
        title: 'VideoService',
        status: 'ready',
      },
    ],
  },
  {
    id: 'controls',
    title: 'Controls',
    pkg: '@erst_dev/ngx-video-controls',
    docsPath: 'docs/controls',
    demos: [
      {
        id: 'player',
        path: 'controls/player',
        docsPath: 'docs/controls',
        title: 'Полный плеер',
        titleKey: 'fullPlayer',
        status: 'ready',
      },
      {
        id: 'play-button',
        path: 'controls/play-button',
        docsPath: 'docs/controls/play-button',
        title: 'PlayButtonComponent',
        status: 'ready',
      },
      {
        id: 'volume-slider',
        path: 'controls/volume-slider',
        docsPath: 'docs/controls/volume-slider',
        title: 'VolumeSliderComponent',
        status: 'ready',
      },
      {
        id: 'time-display',
        path: 'controls/time-display',
        docsPath: 'docs/controls/time-display',
        title: 'TimeDisplayComponent',
        status: 'ready',
      },
      {
        id: 'fullscreen-button',
        path: 'controls/fullscreen-button',
        docsPath: 'docs/controls/fullscreen-button',
        title: 'FullscreenButtonComponent',
        status: 'ready',
      },
      {
        id: 'buffering-indicator',
        path: 'controls/buffering-indicator',
        docsPath: 'docs/controls/buffering-indicator',
        title: 'BufferingIndicatorComponent',
        status: 'ready',
      },
    ],
  },
  {
    id: 'timeline',
    title: 'Timeline',
    pkg: '@erst_dev/ngx-video-timeline',
    docsPath: 'docs/timeline',
    demos: [
      {
        id: 'timeline',
        path: 'timeline/timeline',
        docsPath: 'docs/timeline/timeline',
        title: 'TimelineComponent',
        status: 'ready',
      },
      {
        id: 'timeline-preview',
        path: 'timeline/timeline-preview',
        docsPath: 'docs/timeline/timeline-preview',
        title: 'TimelinePreviewComponent',
        status: 'ready',
      },
      {
        id: 'chapter-markers',
        path: 'timeline/chapter-markers',
        docsPath: 'docs/timeline/chapter-markers',
        title: 'ChapterMarkersComponent',
        status: 'ready',
      },
    ],
  },
  {
    id: 'extras',
    title: 'Extras',
    pkg: '@erst_dev/ngx-video-extras',
    docsPath: 'docs/extras',
    demos: [
      {
        id: 'click-to-play-overlay',
        path: 'extras/click-to-play-overlay',
        docsPath: 'docs/extras/click-to-play-overlay',
        title: 'ClickToPlayOverlayComponent',
        status: 'ready',
      },
      {
        id: 'error-display',
        path: 'extras/error-display',
        docsPath: 'docs/extras/error-display',
        title: 'ErrorDisplayComponent',
        status: 'ready',
      },
      {
        id: 'speed-control',
        path: 'extras/speed-control',
        docsPath: 'docs/extras/speed-control',
        title: 'SpeedControlComponent',
        status: 'ready',
      },
      {
        id: 'keyboard-shortcuts',
        path: 'extras/keyboard-shortcuts',
        docsPath: 'docs/extras/keyboard-shortcuts',
        title: 'KeyboardShortcutsDirective',
        status: 'ready',
      },
      {
        id: 'gesture',
        path: 'extras/gesture',
        docsPath: 'docs/extras/gesture',
        title: 'GestureDirective',
        status: 'ready',
      },
      {
        id: 'subtitle-renderer',
        path: 'extras/subtitle-renderer',
        docsPath: 'docs/extras/subtitle-renderer',
        title: 'SubtitleRendererComponent',
        status: 'ready',
      },
    ],
  },
  {
    id: 'sources',
    title: 'Sources',
    pkg: '@erst_dev/ngx-video-sources',
    docsPath: 'docs/sources',
    demos: [
      {
        id: 'hls-source',
        path: 'sources/hls-source',
        docsPath: 'docs/sources/hls-source',
        title: 'HlsSourceDirective',
        status: 'ready',
      },
      {
        id: 'dash-source',
        path: 'sources/dash-source',
        docsPath: 'docs/sources/dash-source',
        title: 'DashSourceDirective',
        status: 'ready',
      },
      {
        id: 'quality-switcher',
        path: 'sources/quality-switcher',
        docsPath: 'docs/sources/quality-switcher',
        title: 'QualitySwitcherComponent',
        status: 'ready',
      },
    ],
  },
  {
    id: 'capture',
    title: 'Capture',
    pkg: '@erst_dev/ngx-video-capture',
    docsPath: 'docs/capture',
    pro: true,
    demos: [
      {
        id: 'capture-service',
        path: 'capture/capture-service',
        docsPath: 'docs/capture',
        title: 'CaptureService',
        status: 'ready',
      },
      {
        id: 'screenshot-button',
        path: 'capture/screenshot-button',
        docsPath: 'docs/capture/screenshot-button',
        title: 'ScreenshotButtonComponent',
        status: 'ready',
      },
      {
        id: 'clip-recorder',
        path: 'capture/clip-recorder',
        docsPath: 'docs/capture/clip-recorder',
        title: 'ClipRecorderComponent',
        status: 'ready',
      },
    ],
  },
];

/** Группа по id пакета. */
export function findDemoGroup(id: string): DemoGroup | undefined {
  return DEMO_GROUPS.find((group) => group.id === id);
}

/** Кирпич по id группы и id кирпича. */
export function findDemoById(
  groupId: string,
  demoId: string,
): DemoEntry | undefined {
  return findDemoGroup(groupId)?.demos.find((demo) => demo.id === demoId);
}

/** Кирпич по пути примера (`controls/play-button`). */
export function findDemoByPath(
  path: string,
): { group: DemoGroup; demo: DemoEntry } | undefined {
  for (const group of DEMO_GROUPS) {
    const demo = group.demos.find((entry) => entry.path === path);
    if (demo) return { group, demo };
  }

  return undefined;
}
