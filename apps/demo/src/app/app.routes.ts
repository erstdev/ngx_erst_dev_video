import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { localeGuard } from './i18n/locale.guard';
import { LocaleService } from './i18n/locale.service';

/**
 * Маршруты примеров без локали. Локаль — первый сегмент URL, поэтому весь
 * список живёт внутри `path: ':locale'`.
 */
const demoRoutes: Routes = [
  {
    path: 'core/video-service',
    loadComponent: () =>
      import('./pages/demos/core/video-service/component/video-service-demo').then(
        (m) => m.VideoServiceDemo,
      ),
  },
  {
    path: 'controls/play-button',
    loadComponent: () =>
      import('./pages/demos/controls/play-button/component/play-button-demo').then(
        (m) => m.PlayButtonDemo,
      ),
  },
  {
    path: 'controls/volume-slider',
    loadComponent: () =>
      import('./pages/demos/controls/volume-slider/component/volume-slider-demo').then(
        (m) => m.VolumeSliderDemo,
      ),
  },
  {
    path: 'controls/time-display',
    loadComponent: () =>
      import('./pages/demos/controls/time-display/component/time-display-demo').then(
        (m) => m.TimeDisplayDemo,
      ),
  },
  {
    path: 'controls/fullscreen-button',
    loadComponent: () =>
      import('./pages/demos/controls/fullscreen-button/component/fullscreen-button-demo').then(
        (m) => m.FullscreenButtonDemo,
      ),
  },
  {
    path: 'controls/buffering-indicator',
    loadComponent: () =>
      import('./pages/demos/controls/buffering-indicator/component/buffering-indicator-demo').then(
        (m) => m.BufferingIndicatorDemo,
      ),
  },
  {
    path: 'controls/player',
    loadComponent: () =>
      import('./pages/demos/controls/player/component/player-demo').then(
        (m) => m.PlayerDemo,
      ),
  },
  {
    path: 'timeline/timeline',
    loadComponent: () =>
      import('./pages/demos/timeline/timeline/component/timeline-demo').then(
        (m) => m.TimelineDemo,
      ),
  },
  {
    path: 'timeline/timeline-preview',
    loadComponent: () =>
      import('./pages/demos/timeline/timeline-preview/component/timeline-preview-demo').then(
        (m) => m.TimelinePreviewDemo,
      ),
  },
  {
    path: 'timeline/chapter-markers',
    loadComponent: () =>
      import('./pages/demos/timeline/chapter-markers/component/chapter-markers-demo').then(
        (m) => m.ChapterMarkersDemo,
      ),
  },
  {
    path: 'extras/click-to-play-overlay',
    loadComponent: () =>
      import('./pages/demos/extras/click-to-play-overlay/component/click-to-play-overlay-demo').then(
        (m) => m.ClickToPlayOverlayDemo,
      ),
  },
  {
    path: 'extras/error-display',
    loadComponent: () =>
      import('./pages/demos/extras/error-display/component/error-display-demo').then(
        (m) => m.ErrorDisplayDemo,
      ),
  },
  {
    path: 'extras/speed-control',
    loadComponent: () =>
      import('./pages/demos/extras/speed-control/component/speed-control-demo').then(
        (m) => m.SpeedControlDemo,
      ),
  },
  {
    path: 'extras/keyboard-shortcuts',
    loadComponent: () =>
      import('./pages/demos/extras/keyboard-shortcuts/component/keyboard-shortcuts-demo').then(
        (m) => m.KeyboardShortcutsDemo,
      ),
  },
  {
    path: 'extras/gesture',
    loadComponent: () =>
      import('./pages/demos/extras/gesture/component/gesture-demo').then(
        (m) => m.GestureDemo,
      ),
  },
  {
    path: 'extras/subtitle-renderer',
    loadComponent: () =>
      import('./pages/demos/extras/subtitle-renderer/component/subtitle-renderer-demo').then(
        (m) => m.SubtitleRendererDemo,
      ),
  },
  {
    path: 'sources/hls-source',
    loadComponent: () =>
      import('./pages/demos/sources/hls-source/component/hls-source-demo').then(
        (m) => m.HlsSourceDemo,
      ),
  },
  {
    path: 'sources/dash-source',
    loadComponent: () =>
      import('./pages/demos/sources/dash-source/component/dash-source-demo').then(
        (m) => m.DashSourceDemo,
      ),
  },
  {
    path: 'sources/quality-switcher',
    loadComponent: () =>
      import('./pages/demos/sources/quality-switcher/component/quality-switcher-demo').then(
        (m) => m.QualitySwitcherDemo,
      ),
  },
  {
    path: 'capture/capture-service',
    loadComponent: () =>
      import('./pages/demos/capture/capture-service/component/capture-service-demo').then(
        (m) => m.CaptureServiceDemo,
      ),
  },
  {
    path: 'capture/screenshot-button',
    loadComponent: () =>
      import('./pages/demos/capture/screenshot-button/component/screenshot-button-demo').then(
        (m) => m.ScreenshotButtonDemo,
      ),
  },
  {
    path: 'capture/clip-recorder',
    loadComponent: () =>
      import('./pages/demos/capture/clip-recorder/component/clip-recorder-demo').then(
        (m) => m.ClipRecorderDemo,
      ),
  },
];

const docsRoutes: Routes = [
  {
    path: 'docs',
    loadComponent: () =>
      import('./pages/docs/docs-index-page').then((m) => m.DocsIndexPage),
  },
  {
    path: 'docs/:pkg',
    loadComponent: () =>
      import('./pages/docs/docs-page').then((m) => m.DocsPage),
  },
  {
    path: 'docs/:pkg/:brick',
    loadComponent: () =>
      import('./pages/docs/docs-page').then((m) => m.DocsPage),
  },
];

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    // `/` ведёт на сохранённую локаль, а если выбора ещё не было — на дефолт.
    redirectTo: () => `/${inject(LocaleService).preferredLocale()}`,
  },
  {
    path: ':locale',
    canActivate: [localeGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      ...demoRoutes,
      ...docsRoutes,
      { path: '**', redirectTo: '' },
    ],
  },
  { path: '**', redirectTo: '' },
];
