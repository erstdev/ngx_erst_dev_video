import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';

import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * Серверная конфигурация нужна только для пререндера на сборке.
 *
 * `withRoutes` задаёт режим рендера для каждого маршрута: главные страницы
 * пререндерятся, документация и живые демо пока остаются клиентскими.
 */
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
