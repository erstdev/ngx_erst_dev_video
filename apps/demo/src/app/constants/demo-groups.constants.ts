import type { DemoGroup } from '../interfaces/demo-group.interface';

/**
 * Реестр сайта: используется главной, сайдбаром документации и demo-shell.
 * У каждого кирпича два адреса — живой пример и API-справка.
 */
export const DEMO_GROUPS: readonly DemoGroup[] = [
  {
    id: 'core',
    title: 'Core',
    pkg: '@erst_dev/ngx-video-core',
    docsPath: 'docs/core',
    demos: [
      {
        id: 'video-service',
        path: 'docs/core/video-service',
        docsPath: 'docs/core',
        title: 'VideoService',
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
        path: 'docs/controls/player',
        docsPath: 'docs/controls',
        title: 'Полный плеер',
        titleKey: 'fullPlayer',
      },
      {
        id: 'play-button',
        path: 'docs/controls/play-button',
        docsPath: 'docs/controls/play-button/api',
        title: 'PlayButtonComponent',
      },
      {
        id: 'volume-slider',
        path: 'docs/controls/volume-slider',
        docsPath: 'docs/controls/volume-slider/api',
        title: 'VolumeSliderComponent',
      },
      {
        id: 'time-display',
        path: 'docs/controls/time-display',
        docsPath: 'docs/controls/time-display/api',
        title: 'TimeDisplayComponent',
      },
      {
        id: 'fullscreen-button',
        path: 'docs/controls/fullscreen-button',
        docsPath: 'docs/controls/fullscreen-button/api',
        title: 'FullscreenButtonComponent',
      },
      {
        id: 'buffering-indicator',
        path: 'docs/controls/buffering-indicator',
        docsPath: 'docs/controls/buffering-indicator/api',
        title: 'BufferingIndicatorComponent',
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
        path: 'docs/timeline/timeline',
        docsPath: 'docs/timeline/timeline/api',
        title: 'TimelineComponent',
      },
      {
        id: 'timeline-preview',
        path: 'docs/timeline/timeline-preview',
        docsPath: 'docs/timeline/timeline-preview/api',
        title: 'TimelinePreviewComponent',
      },
      {
        id: 'chapter-markers',
        path: 'docs/timeline/chapter-markers',
        docsPath: 'docs/timeline/chapter-markers/api',
        title: 'ChapterMarkersComponent',
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
        path: 'docs/extras/click-to-play-overlay',
        docsPath: 'docs/extras/click-to-play-overlay/api',
        title: 'ClickToPlayOverlayComponent',
      },
      {
        id: 'error-display',
        path: 'docs/extras/error-display',
        docsPath: 'docs/extras/error-display/api',
        title: 'ErrorDisplayComponent',
      },
      {
        id: 'speed-control',
        path: 'docs/extras/speed-control',
        docsPath: 'docs/extras/speed-control/api',
        title: 'SpeedControlComponent',
      },
      {
        id: 'keyboard-shortcuts',
        path: 'docs/extras/keyboard-shortcuts',
        docsPath: 'docs/extras/keyboard-shortcuts/api',
        title: 'KeyboardShortcutsDirective',
      },
      {
        id: 'gesture',
        path: 'docs/extras/gesture',
        docsPath: 'docs/extras/gesture/api',
        title: 'GestureDirective',
      },
      {
        id: 'subtitle-renderer',
        path: 'docs/extras/subtitle-renderer',
        docsPath: 'docs/extras/subtitle-renderer/api',
        title: 'SubtitleRendererComponent',
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
        path: 'docs/sources/hls-source',
        docsPath: 'docs/sources/hls-source/api',
        title: 'HlsSourceDirective',
      },
      {
        id: 'dash-source',
        path: 'docs/sources/dash-source',
        docsPath: 'docs/sources/dash-source/api',
        title: 'DashSourceDirective',
      },
      {
        id: 'quality-switcher',
        path: 'docs/sources/quality-switcher',
        docsPath: 'docs/sources/quality-switcher/api',
        title: 'QualitySwitcherComponent',
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
        path: 'docs/capture/capture-service',
        docsPath: 'docs/capture',
        title: 'CaptureService',
      },
      {
        id: 'screenshot-button',
        path: 'docs/capture/screenshot-button',
        docsPath: 'docs/capture/screenshot-button/api',
        title: 'ScreenshotButtonComponent',
      },
      {
        id: 'clip-recorder',
        path: 'docs/capture/clip-recorder',
        docsPath: 'docs/capture/clip-recorder/api',
        title: 'ClipRecorderComponent',
      },
    ],
  },
];
