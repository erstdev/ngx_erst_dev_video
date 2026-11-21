import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { localeGuard } from './i18n/guards/locale.guard';
import { LocaleService } from './i18n/services/locale.service';

/**
 * Маршруты примеров без локали. Локаль — первый сегмент URL, поэтому весь
 * список живёт внутри `path: ':locale'`.
 */
const demoRoutes: Routes = [
  {
    path: 'core/video-service',
    loadComponent: () =>
      import('./demos/core/video-service/pages/video-service-demo').then(
        (m) => m.VideoServiceDemo,
      ),
  },
  {
    path: 'controls/play-button',
    loadComponent: () =>
      import('./demos/controls/play-button/pages/play-button-demo').then(
        (m) => m.PlayButtonDemo,
      ),
  },
  {
    path: 'controls/volume-slider',
    loadComponent: () =>
      import('./demos/controls/volume-slider/pages/volume-slider-demo').then(
        (m) => m.VolumeSliderDemo,
      ),
  },
  {
    path: 'controls/time-display',
    loadComponent: () =>
      import('./demos/controls/time-display/pages/time-display-demo').then(
        (m) => m.TimeDisplayDemo,
      ),
  },
  {
    path: 'controls/fullscreen-button',
    loadComponent: () =>
      import('./demos/controls/fullscreen-button/pages/fullscreen-button-demo').then(
        (m) => m.FullscreenButtonDemo,
      ),
  },
  {
    path: 'controls/buffering-indicator',
    loadComponent: () =>
      import('./demos/controls/buffering-indicator/pages/buffering-indicator-demo').then(
        (m) => m.BufferingIndicatorDemo,
      ),
  },
  {
    path: 'controls/player',
    loadComponent: () =>
      import('./demos/controls/player/pages/player-demo').then(
        (m) => m.PlayerDemo,
      ),
  },
  {
    path: 'timeline/timeline',
    loadComponent: () =>
      import('./demos/timeline/timeline/pages/timeline-demo').then(
        (m) => m.TimelineDemo,
      ),
  },
  {
    path: 'timeline/timeline-preview',
    loadComponent: () =>
      import('./demos/timeline/timeline-preview/pages/timeline-preview-demo').then(
        (m) => m.TimelinePreviewDemo,
      ),
  },
  {
    path: 'timeline/chapter-markers',
    loadComponent: () =>
      import('./demos/timeline/chapter-markers/pages/chapter-markers-demo').then(
        (m) => m.ChapterMarkersDemo,
      ),
  },
  {
    path: 'extras/click-to-play-overlay',
    loadComponent: () =>
      import('./demos/extras/click-to-play-overlay/pages/click-to-play-overlay-demo').then(
        (m) => m.ClickToPlayOverlayDemo,
      ),
  },
  {
    path: 'extras/error-display',
    loadComponent: () =>
      import('./demos/extras/error-display/pages/error-display-demo').then(
        (m) => m.ErrorDisplayDemo,
      ),
  },
  {
    path: 'extras/speed-control',
    loadComponent: () =>
      import('./demos/extras/speed-control/pages/speed-control-demo').then(
        (m) => m.SpeedControlDemo,
      ),
  },
  {
    path: 'extras/keyboard-shortcuts',
    loadComponent: () =>
      import('./demos/extras/keyboard-shortcuts/pages/keyboard-shortcuts-demo').then(
        (m) => m.KeyboardShortcutsDemo,
      ),
  },
  {
    path: 'extras/gesture',
    loadComponent: () =>
      import('./demos/extras/gesture/pages/gesture-demo').then(
        (m) => m.GestureDemo,
      ),
  },
  {
    path: 'extras/subtitle-renderer',
    loadComponent: () =>
      import('./demos/extras/subtitle-renderer/pages/subtitle-renderer-demo').then(
        (m) => m.SubtitleRendererDemo,
      ),
  },
  {
    path: 'sources/hls-source',
    loadComponent: () =>
      import('./demos/sources/hls-source/pages/hls-source-demo').then(
        (m) => m.HlsSourceDemo,
      ),
  },
  {
    path: 'sources/dash-source',
    loadComponent: () =>
      import('./demos/sources/dash-source/pages/dash-source-demo').then(
        (m) => m.DashSourceDemo,
      ),
  },
  {
    path: 'sources/quality-switcher',
    loadComponent: () =>
      import('./demos/sources/quality-switcher/pages/quality-switcher-demo').then(
        (m) => m.QualitySwitcherDemo,
      ),
  },
  {
    path: 'capture/capture-service',
    loadComponent: () =>
      import('./demos/capture/capture-service/pages/capture-service-demo').then(
        (m) => m.CaptureServiceDemo,
      ),
  },
  {
    path: 'capture/screenshot-button',
    loadComponent: () =>
      import('./demos/capture/screenshot-button/pages/screenshot-button-demo').then(
        (m) => m.ScreenshotButtonDemo,
      ),
  },
  {
    path: 'capture/clip-recorder',
    loadComponent: () =>
      import('./demos/capture/clip-recorder/pages/clip-recorder-demo').then(
        (m) => m.ClipRecorderDemo,
      ),
  },
];

const docsRoutes: Routes = [
  {
    path: 'docs',
    loadComponent: () =>
      import('./docs/pages/docs-index-page/docs-index-page').then(
        (m) => m.DocsIndexPage,
      ),
  },
  {
    path: 'docs/:pkg',
    loadComponent: () =>
      import('./docs/pages/docs-page/docs-page').then((m) => m.DocsPage),
  },
  {
    path: 'docs/:pkg/:brick',
    loadComponent: () =>
      import('./docs/pages/docs-page/docs-page').then((m) => m.DocsPage),
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
        loadComponent: () => import('./home/pages/home').then((m) => m.Home),
      },
      ...demoRoutes,
      ...docsRoutes,
      { path: '**', redirectTo: '' },
    ],
  },
  { path: '**', redirectTo: '' },
];
