import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';

import type { DocsPageData } from '../interfaces/docs-page-data.interface';
import { DocsStore } from '../services/docs-store.service';

/**
 * README пакета или кирпича: данные приходят до создания страницы, поэтому
 * первый клиентский рендер совпадает с серверным.
 */
export const docsPageResolver: ResolveFn<DocsPageData | null> = (route) =>
  inject(DocsStore).resolvePage(
    route.paramMap.get('locale') ?? '',
    route.paramMap.get('pkg') ?? '',
    route.paramMap.get('brick'),
  );
