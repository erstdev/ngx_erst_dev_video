import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';

import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import {
  DOCS_INDEXES,
  DOCS_PAGES,
} from './docs/generated/docs-content.generated';
import { DOCS_CONTENT_SOURCE } from './docs/tokens/docs-content-source.token';

/**
 * Серверная конфигурация нужна только для пререндера на сборке.
 *
 * `withRoutes` задаёт режим рендера для каждого маршрута: документация и
 * главные страницы пререндерятся, живые демо остаются клиентскими.
 * `DOCS_CONTENT_SOURCE` — те же README, что уходят в `public/docs-content`,
 * но импортом: при сборке в Node нет HTTP-сервера. В браузерный бандл этот
 * импорт не попадает.
 */
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: DOCS_CONTENT_SOURCE,
      useValue: { indexes: DOCS_INDEXES, pages: DOCS_PAGES },
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
