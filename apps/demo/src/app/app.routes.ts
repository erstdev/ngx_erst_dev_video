import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'core/video-service',
    loadComponent: () =>
      import('./demos/core/video-service/video-service-demo').then(
        (m) => m.VideoServiceDemo,
      ),
  },
  {
    path: 'controls/play-button',
    loadComponent: () =>
      import('./demos/controls/play-button/play-button-demo').then(
        (m) => m.PlayButtonDemo,
      ),
  },
  {
    path: 'controls/volume-slider',
    loadComponent: () =>
      import('./demos/controls/volume-slider/volume-slider-demo').then(
        (m) => m.VolumeSliderDemo,
      ),
  },
  {
    path: 'controls/time-display',
    loadComponent: () =>
      import('./demos/controls/time-display/time-display-demo').then(
        (m) => m.TimeDisplayDemo,
      ),
  },
  {
    path: 'controls/fullscreen-button',
    loadComponent: () =>
      import('./demos/controls/fullscreen-button/fullscreen-button-demo').then(
        (m) => m.FullscreenButtonDemo,
      ),
  },
  {
    path: 'controls/buffering-indicator',
    loadComponent: () =>
      import(
        './demos/controls/buffering-indicator/buffering-indicator-demo'
      ).then((m) => m.BufferingIndicatorDemo),
  },
  {
    path: 'controls/player',
    loadComponent: () =>
      import('./demos/controls/player/player-demo').then((m) => m.PlayerDemo),
  },
  {
    path: 'timeline/timeline',
    loadComponent: () =>
      import('./demos/timeline/timeline/timeline-demo').then(
        (m) => m.TimelineDemo,
      ),
  },
  {
    path: 'timeline/timeline-preview',
    loadComponent: () =>
      import('./demos/timeline/timeline-preview/timeline-preview-demo').then(
        (m) => m.TimelinePreviewDemo,
      ),
  },
  {
    path: 'timeline/chapter-markers',
    loadComponent: () =>
      import('./demos/timeline/chapter-markers/chapter-markers-demo').then(
        (m) => m.ChapterMarkersDemo,
      ),
  },
  {
    path: 'extras/click-to-play-overlay',
    loadComponent: () =>
      import(
        './demos/extras/click-to-play-overlay/click-to-play-overlay-demo'
      ).then((m) => m.ClickToPlayOverlayDemo),
  },
  {
    path: 'extras/error-display',
    loadComponent: () =>
      import('./demos/extras/error-display/error-display-demo').then(
        (m) => m.ErrorDisplayDemo,
      ),
  },
  {
    path: 'extras/speed-control',
    loadComponent: () =>
      import('./demos/extras/speed-control/speed-control-demo').then(
        (m) => m.SpeedControlDemo,
      ),
  },
  {
    path: 'extras/keyboard-shortcuts',
    loadComponent: () =>
      import('./demos/extras/keyboard-shortcuts/keyboard-shortcuts-demo').then(
        (m) => m.KeyboardShortcutsDemo,
      ),
  },
  {
    path: 'extras/gesture',
    loadComponent: () =>
      import('./demos/extras/gesture/gesture-demo').then((m) => m.GestureDemo),
  },
  {
    path: 'extras/subtitle-renderer',
    loadComponent: () =>
      import('./demos/extras/subtitle-renderer/subtitle-renderer-demo').then(
        (m) => m.SubtitleRendererDemo,
      ),
  },
  {
    path: 'sources/hls-source',
    loadComponent: () =>
      import('./demos/sources/hls-source/hls-source-demo').then(
        (m) => m.HlsSourceDemo,
      ),
  },
  {
    path: 'sources/dash-source',
    loadComponent: () =>
      import('./demos/sources/dash-source/dash-source-demo').then(
        (m) => m.DashSourceDemo,
      ),
  },
  {
    path: 'sources/quality-switcher',
    loadComponent: () =>
      import('./demos/sources/quality-switcher/quality-switcher-demo').then(
        (m) => m.QualitySwitcherDemo,
      ),
  },
  {
    path: 'capture/capture-service',
    loadComponent: () =>
      import('./demos/capture/capture-service/capture-service-demo').then(
        (m) => m.CaptureServiceDemo,
      ),
  },
  {
    path: 'capture/screenshot-button',
    loadComponent: () =>
      import('./demos/capture/screenshot-button/screenshot-button-demo').then(
        (m) => m.ScreenshotButtonDemo,
      ),
  },
  {
    path: 'capture/clip-recorder',
    loadComponent: () =>
      import('./demos/capture/clip-recorder/clip-recorder-demo').then(
        (m) => m.ClipRecorderDemo,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
