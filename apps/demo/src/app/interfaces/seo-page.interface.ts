import type { SeoBreadcrumb } from './seo-breadcrumb.interface';
import type { SeoPageType } from '../types/seo-page-type.type';

/** Метаданные страницы: заголовок, описание, тип и хлебные крошки. */
export interface SeoPage {
  readonly title: string;
  readonly description?: string;
  readonly type?: SeoPageType;
  readonly breadcrumbs?: readonly SeoBreadcrumb[];
}
