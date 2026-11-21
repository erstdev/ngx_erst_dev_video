import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Прокрутку ведём сами: встроенный anchorScrolling игнорирует
    // scroll-margin-top, а scrollPositionRestoration сбрасывает позицию
    // после ручной прокрутки к якорю.
    provideRouter(appRoutes, withComponentInputBinding()),
  ],
};
