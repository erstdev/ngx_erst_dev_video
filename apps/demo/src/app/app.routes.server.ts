import { RenderMode, ServerRoute } from '@angular/ssr';

/** Локали сайта: главные страницы пререндерятся для каждой. */
const LOCALES = ['en', 'ru'];

/**
 * Режимы рендера маршрутов при сборке.
 *
 * Пока статическими делаем только главные страницы: их содержимое — константы,
 * ему не нужны браузер и запросы. Документация и живые демо остаются
 * клиентскими: README грузятся JSON-запросом, а демо работают с медиа и
 * браузерными API. Их пререндер — следующий шаг, когда появится серверный
 * источник данных для документации.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: ':locale',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => LOCALES.map((locale) => ({ locale })),
  },
  { path: ':locale/docs', renderMode: RenderMode.Client },
  { path: ':locale/docs/:pkg', renderMode: RenderMode.Client },
  { path: ':locale/docs/:pkg/:brick', renderMode: RenderMode.Client },
  { path: ':locale/docs/:pkg/:brick/api', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Client },
];
