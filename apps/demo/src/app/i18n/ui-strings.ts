import type { Locale } from './locale';

/**
 * Словарь UI-строк сайта. Без `@angular/localize`: строк немного, обе локали
 * лежат рядом и проверяются типами. Контент README переводится отдельно —
 * файлами `README.en.md`.
 */
export interface UiStrings {
  readonly siteName: string;
  readonly navHome: string;
  readonly navDocs: string;
  readonly language: string;
  readonly example: string;
  readonly api: string;
  readonly allExamples: string;
  readonly fullPlayer: string;
  readonly liveDemo: string;
  readonly selector: string;
  readonly demosTitle: string;
  readonly demosSubtitle: string;
  readonly docsTitle: string;
  readonly docsSubtitle: string;
  readonly onThisPage: string;
  readonly translationFallback: string;
  readonly notFound: string;
  readonly loading: string;
  readonly loadError: string;
  readonly statusReady: string;
  readonly statusWip: string;
  readonly statusPlanned: string;
}

export type UiKey = keyof UiStrings;

export const UI_STRINGS = {
  ru: {
    siteName: 'ngx-video',
    navHome: 'Главная',
    navDocs: 'Документация',
    language: 'Язык',
    example: 'Пример',
    api: 'API',
    allExamples: 'Все примеры',
    fullPlayer: 'Полный плеер',
    liveDemo: 'Живое демо',
    selector: 'Селектор',
    demosTitle: 'ngx-video — живые примеры',
    demosSubtitle:
      'Кирпичи экосистемы ngx-video: у каждого — рабочий пример и API-справка, собранная из README.',
    docsTitle: 'Документация',
    docsSubtitle:
      'API-справка пакетов и кирпичей. Страницы собираются из README на этапе сборки сайта.',
    onThisPage: 'На этой странице',
    translationFallback:
      'Английский перевод ещё не готов — показан русский оригинал.',
    notFound: 'Страница не найдена',
    loading: 'Загружаем…',
    loadError:
      'Не удалось загрузить страницу. Обновите страницу и попробуйте снова.',
    statusReady: 'готово',
    statusWip: 'в работе',
    statusPlanned: 'запланировано',
  },
  en: {
    siteName: 'ngx-video',
    navHome: 'Home',
    navDocs: 'Docs',
    language: 'Language',
    example: 'Example',
    api: 'API',
    allExamples: 'All examples',
    fullPlayer: 'Full player',
    liveDemo: 'Live demo',
    selector: 'Selector',
    demosTitle: 'ngx-video live examples',
    demosSubtitle:
      'Building blocks of the ngx-video ecosystem: every item has a live example and an API reference generated from its README.',
    docsTitle: 'Documentation',
    docsSubtitle:
      'API reference for packages and building blocks. Pages are generated from README files at build time.',
    onThisPage: 'On this page',
    translationFallback:
      'The English translation is not ready yet. Showing the Russian original.',
    notFound: 'Page not found',
    loading: 'Loading…',
    loadError: 'Could not load the page. Refresh the page and try again.',
    statusReady: 'ready',
    statusWip: 'in progress',
    statusPlanned: 'planned',
  },
} as const satisfies Record<Locale, UiStrings>;
