import { InjectionToken } from '@angular/core';

import type { DocsContentSource } from '../interfaces/docs-content-source.interface';

/**
 * Серверный источник документации.
 *
 * В браузере — `null`: там данные приходят из `TransferState` (после
 * пререндера) или запрашиваются JSON-ассетом при клиентском переходе.
 * Значение подставляет только `app.config.server.ts`, поэтому сгенерированный
 * модуль не попадает в браузерный бандл.
 */
export const DOCS_CONTENT_SOURCE = new InjectionToken<DocsContentSource | null>(
  'DOCS_CONTENT_SOURCE',
  { factory: () => null },
);
