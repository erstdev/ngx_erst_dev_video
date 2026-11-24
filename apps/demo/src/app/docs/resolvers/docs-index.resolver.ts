import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';

import type { DocsIndex } from '../interfaces/docs-index.interface';
import { DocsStore } from '../services/docs-store.service';

/**
 * Индекс документации нужен и странице, и сайдбару: resolver отдаёт данные
 * до создания компонентов, поэтому на пререндере в HTML сразу попадает
 * полный сайдбар.
 */
export const docsIndexResolver: ResolveFn<DocsIndex | null> = (route) =>
  inject(DocsStore).resolveIndex(route.paramMap.get('locale') ?? '');
