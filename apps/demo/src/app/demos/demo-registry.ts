/**
 * Реестр демо-страниц: используется главной страницей и как источник правды
 * о списке кирпичей и их статусах.
 */
export type DemoStatus = 'ready' | 'wip' | 'planned';

export const DEMO_STATUS_LABELS: Readonly<Record<DemoStatus, string>> = {
  ready: 'готово',
  wip: 'в работе',
  planned: 'запланировано',
};

export interface DemoEntry {
  /** Идентификатор внутри группы (совпадает с именем каталога демо). */
  readonly id: string;
  /**
   * Путь маршрута без ведущего слэша (совпадает с `path` в `app.routes.ts`).
   * Ссылка строится как `'/' + path`: массив команд вида `['/', path]`
   * Angular превращает в один закодированный сегмент (`%2F`) и маршрут не находится.
   */
  readonly path: string;
  readonly title: string;
  readonly status: DemoStatus;
}

export interface DemoGroup {
  readonly id: string;
  readonly title: string;
  readonly pkg: string;
  /** Платный пакет (capture). */
  readonly pro?: boolean;
  readonly demos: readonly DemoEntry[];
}

export const DEMO_GROUPS: readonly DemoGroup[] = [
  {
    id: 'core',
    title: 'Core',
    pkg: '@erst_dev/ngx-video-core',
    demos: [
      {
        id: 'video-service',
        path: 'core/video-service',
        title: 'VideoService',
        status: 'ready',
      },
    ],
  },
  {
    id: 'controls',
    title: 'Controls',
    pkg: '@erst_dev/ngx-video-controls',
    demos: [
      {
        id: 'player',
        path: 'controls/player',
        title: 'Полный плеер',
        status: 'ready',
      },
      {
        id: 'play-button',
        path: 'controls/play-button',
        title: 'PlayButtonComponent',
        status: 'ready',
      },
      {
        id: 'volume-slider',
        path: 'controls/volume-slider',
        title: 'VolumeSliderComponent',
        status: 'ready',
      },
      {
        id: 'time-display',
        path: 'controls/time-display',
        title: 'TimeDisplayComponent',
        status: 'ready',
      },
      {
        id: 'fullscreen-button',
        path: 'controls/fullscreen-button',
        title: 'FullscreenButtonComponent',
        status: 'ready',
      },
      {
        id: 'buffering-indicator',
        path: 'controls/buffering-indicator',
        title: 'BufferingIndicatorComponent',
        status: 'ready',
      },
    ],
  },
  {
    id: 'timeline',
    title: 'Timeline',
    pkg: '@erst_dev/ngx-video-timeline',
    demos: [
      {
        id: 'timeline',
        path: 'timeline/timeline',
        title: 'TimelineComponent',
        status: 'ready',
      },
      {
        id: 'timeline-preview',
        path: 'timeline/timeline-preview',
        title: 'TimelinePreviewComponent',
        status: 'ready',
      },
      {
        id: 'chapter-markers',
        path: 'timeline/chapter-markers',
        title: 'ChapterMarkersComponent',
        status: 'ready',
      },
    ],
  },
  {
    id: 'extras',
    title: 'Extras',
    pkg: '@erst_dev/ngx-video-extras',
    demos: [
      {
        id: 'click-to-play-overlay',
        path: 'extras/click-to-play-overlay',
        title: 'ClickToPlayOverlayComponent',
        status: 'ready',
      },
      {
        id: 'error-display',
        path: 'extras/error-display',
        title: 'ErrorDisplayComponent',
        status: 'ready',
      },
      {
        id: 'speed-control',
        path: 'extras/speed-control',
        title: 'SpeedControlComponent',
        status: 'ready',
      },
      {
        id: 'keyboard-shortcuts',
        path: 'extras/keyboard-shortcuts',
        title: 'KeyboardShortcutsDirective',
        status: 'ready',
      },
      {
        id: 'gesture',
        path: 'extras/gesture',
        title: 'GestureDirective',
        status: 'ready',
      },
      {
        id: 'subtitle-renderer',
        path: 'extras/subtitle-renderer',
        title: 'SubtitleRendererComponent',
        status: 'ready',
      },
    ],
  },
  {
    id: 'sources',
    title: 'Sources',
    pkg: '@erst_dev/ngx-video-sources',
    demos: [
      {
        id: 'hls-source',
        path: 'sources/hls-source',
        title: 'HlsSourceDirective',
        status: 'planned',
      },
      {
        id: 'dash-source',
        path: 'sources/dash-source',
        title: 'DashSourceDirective',
        status: 'planned',
      },
      {
        id: 'quality-switcher',
        path: 'sources/quality-switcher',
        title: 'QualitySwitcherComponent',
        status: 'planned',
      },
    ],
  },
  {
    id: 'capture',
    title: 'Capture',
    pkg: '@erst_dev/ngx-video-capture',
    pro: true,
    demos: [
      {
        id: 'capture-service',
        path: 'capture/capture-service',
        title: 'CaptureService',
        status: 'planned',
      },
      {
        id: 'screenshot-button',
        path: 'capture/screenshot-button',
        title: 'ScreenshotButtonComponent',
        status: 'planned',
      },
      {
        id: 'clip-recorder',
        path: 'capture/clip-recorder',
        title: 'ClipRecorderComponent',
        status: 'planned',
      },
    ],
  },
];
