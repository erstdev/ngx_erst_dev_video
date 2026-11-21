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
