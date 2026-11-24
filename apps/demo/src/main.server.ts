import {
  BootstrapContext,
  bootstrapApplication,
} from '@angular/platform-browser';

import { App } from './app/app';
import { config } from './app/app.config.server';

/**
 * Серверная точка входа: используется сборкой для пререндера страниц.
 * В прод не деплоится — на VPS уезжает только `browser/`.
 */
const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(App, config, context);

export default bootstrap;
