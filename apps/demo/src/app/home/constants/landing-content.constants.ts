import type { Locale } from '../../i18n/types/locale.type';
import type { LandingContent } from '../interfaces/landing-content.interface';

/** Тексты витрины на двух локалях; проверяются типом `LandingContent`. */
export const LANDING_CONTENT = {
  ru: {
    heroEyebrow: 'Angular 22 · headless · signals',
    heroTitle: 'Видеоплеер, который собирается из кирпичей',
    heroSubtitle:
      'ngx-video — headless-библиотеки для Angular. core держит состояние video, остальные пакеты добавляют контролы, таймлайн, источники и захват. Разметку и стили выбираете вы.',
    ctaDocs: 'Открыть документацию',
    facts: [
      'Angular 22+',
      'Standalone',
      'Signals + RxJS',
      'SSR-safe',
      'CSS-переменные',
    ],
    featuresTitle: 'Почему кирпичи',
    featuresSubtitle:
      'Один пакет — одна задача. Можно взять только core и написать свой UI или собрать готовый плеер из controls и timeline.',
    features: [
      {
        tag: 'headless',
        title: 'Состояние отдельно от разметки',
        description:
          'VideoService и VideoDirective работают с нативным video: сигналы, Observable и команды без собственного DOM.',
      },
      {
        tag: 'composable',
        title: 'Плеер из независимых частей',
        description:
          'Кнопки, слайдеры, таймлайн, оверлеи и субтитры — отдельные компоненты с узким контрактом.',
      },
      {
        tag: 'styling',
        title: 'Ваш дизайн, а не наш',
        description:
          'CSS-переменные с дефолтами, customClass на хосте и ng-template для замены внутренностей.',
      },
      {
        tag: 'a11y',
        title: 'Доступность в API',
        description:
          'ARIA, клавиатура, focus-visible и prefers-reduced-motion — часть поведения кирпичей.',
      },
      {
        tag: 'sources',
        title: 'HLS и DASH',
        description:
          'Директивы подключают hls.js и dash.js, отдают уровни качества и ошибки в общий контракт.',
      },
      {
        tag: 'PRO',
        title: 'Кадры, клипы и GIF',
        description:
          'capture снимает кадр, записывает клип через MediaRecorder и собирает GIF без сторонних зависимостей.',
      },
    ],
    packagesTitle: 'Пакеты',
    packagesSubtitle:
      'Шесть пакетов с понятным публичным API. Начните с core, остальное подключайте по мере необходимости.',
    packageDescriptions: {
      core: 'Фундамент: VideoService, VideoDirective, типы состояния, ошибки и formatTime.',
      controls:
        'Готовые контролы: Play/Pause, громкость, время, fullscreen и индикатор буферизации.',
      timeline:
        'Таймлайн с перемоткой, превью кадра под курсором и метками глав.',
      extras:
        'Оверлей первого запуска, ошибки, скорость, клавиатура, жесты и WebVTT-субтитры.',
      sources: 'HLS через hls.js, DASH через dash.js и переключатель качества.',
      capture:
        'PRO-пакет: скриншот, запись клипа и GIF без UI и лишних зависимостей.',
    },
    docsLink: 'Документация',
    examplesLink: 'Примеры',
    quickStartTitle: 'Быстрый старт',
    quickStartSubtitle:
      'Минимум: установить core и controls, подключить директиву и одну кнопку.',
    installLabel: 'Установка',
    installNote:
      'Пакеты пока не опубликованы в npm: внутри монорепо они подключаются через paths в tsconfig.base.json.',
    usageLabel: 'Минимальный плеер',
  },
  en: {
    heroEyebrow: 'Angular 22 · headless · signals',
    heroTitle: 'A video player built from building blocks',
    heroSubtitle:
      'ngx-video is a set of headless Angular libraries. core owns the video state; the other packages add controls, a timeline, streaming sources, and capture. You keep the markup and the styles.',
    ctaDocs: 'Read the docs',
    facts: [
      'Angular 22+',
      'Standalone',
      'Signals + RxJS',
      'SSR-safe',
      'CSS variables',
    ],
    featuresTitle: 'Why building blocks',
    featuresSubtitle:
      'One package, one job. Take only core and write your own UI, or assemble a complete player from controls and timeline.',
    features: [
      {
        tag: 'headless',
        title: 'State without markup',
        description:
          'VideoService and VideoDirective work with a native video element: signals, Observables, and commands with no DOM of their own.',
      },
      {
        tag: 'composable',
        title: 'A player from independent parts',
        description:
          'Buttons, sliders, a timeline, overlays, and subtitles are separate components with a narrow contract.',
      },
      {
        tag: 'styling',
        title: 'Your design, not ours',
        description:
          'CSS variables with defaults, customClass on the host, and ng-template to replace the internals.',
      },
      {
        tag: 'a11y',
        title: 'Accessibility is part of the API',
        description:
          'ARIA, keyboard support, focus-visible, and prefers-reduced-motion are part of each building block.',
      },
      {
        tag: 'sources',
        title: 'HLS and DASH',
        description:
          'Directives wire hls.js and dash.js, expose quality levels, and normalize errors into the shared contract.',
      },
      {
        tag: 'PRO',
        title: 'Frames, clips, and GIF',
        description:
          'capture takes a still frame, records a clip with MediaRecorder, and builds GIFs without third-party dependencies.',
      },
    ],
    packagesTitle: 'Packages',
    packagesSubtitle:
      'Six packages with a clear public API at every level. Start with core and add the rest as you need them.',
    packageDescriptions: {
      core: 'The foundation: VideoService, VideoDirective, state and error types, and formatTime.',
      controls:
        'Ready-made controls: play/pause, volume, time, fullscreen, and a buffering indicator.',
      timeline:
        'A timeline with seeking, a frame preview under the cursor, and chapter markers.',
      extras:
        'First-play overlay, errors, playback speed, keyboard, gestures, and WebVTT subtitles.',
      sources:
        'HLS through hls.js, DASH through dash.js, and a quality switcher.',
      capture:
        'The PRO package: screenshots, clip recording, and GIFs with no UI and no extra dependencies.',
    },
    docsLink: 'Documentation',
    examplesLink: 'Examples',
    quickStartTitle: 'Quick start',
    quickStartSubtitle:
      'The minimum: install core and controls, wire the directive, and add one button.',
    installLabel: 'Install',
    installNote:
      'The packages are not published to npm yet; inside the monorepo they are wired through paths in tsconfig.base.json.',
    usageLabel: 'Minimal player',
  },
} as const satisfies Record<Locale, LandingContent>;
