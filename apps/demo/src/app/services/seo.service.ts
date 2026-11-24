import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { SITE_NAME, SITE_URL } from '../constants/site.constants';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from '../i18n/constants/locale.constants';
import { LocaleService } from '../i18n/services/locale.service';
import type { Locale } from '../i18n/types/locale.type';
import { isLocale } from '../i18n/utils/is-locale.util';
import type { SeoBreadcrumb } from '../interfaces/seo-breadcrumb.interface';
import type { SeoPage } from '../interfaces/seo-page.interface';
import type { SeoPageType } from '../types/seo-page-type.type';

const JSON_LD_ID = 'seo-json-ld';
const CANONICAL_SELECTOR = 'link[rel="canonical"]';
const ALTERNATE_SELECTOR = 'link[rel="alternate"][data-seo-alternate]';

/** Тип schema.org для каждого типа страницы сайта. */
const SCHEMA_TYPES: Record<SeoPageType, string> = {
  website: 'WebSite',
  collection: 'CollectionPage',
  article: 'TechArticle',
  webpage: 'WebPage',
};

/**
 * Метаданные страницы: `title`, `description`, canonical, hreflang, Open Graph
 * и JSON-LD.
 *
 * Работает и в браузере, и при пререндере: `Title`, `Meta` и `DOCUMENT`
 * платформо-независимы, поэтому теги попадают в статический HTML. Ссылки
 * строятся от `SITE_URL`; пока домена нет, они относительные.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly i18n = inject(LocaleService);

  apply(page: SeoPage): void {
    const path = this.currentPath();
    const locale = this.i18n.locale();
    const url = this.absolute(path);
    const description =
      page.description?.trim() || this.i18n.t('siteDescription');
    const type = page.type ?? 'webpage';

    this.title.setTitle(page.title);
    this.setMeta('name', 'description', description);
    this.setMeta('name', 'robots', 'index,follow');
    this.setMeta('property', 'og:site_name', SITE_NAME);
    this.setMeta('property', 'og:title', page.title);
    this.setMeta('property', 'og:description', description);
    this.setMeta(
      'property',
      'og:type',
      type === 'article' ? 'article' : 'website',
    );
    this.setMeta('property', 'og:url', url);
    this.setMeta('property', 'og:locale', locale === 'ru' ? 'ru_RU' : 'en_US');
    this.setMeta('name', 'twitter:card', 'summary');
    this.setMeta('name', 'twitter:title', page.title);
    this.setMeta('name', 'twitter:description', description);

    this.setCanonical(url);
    this.setAlternates(path);
    this.setJsonLd(page, { url, locale, description, type });
  }

  /** Текущий путь без query и якоря — основа canonical. */
  private currentPath(): string {
    const [pathname] = this.router.url.split(/[?#]/);

    return pathname || '/';
  }

  /** Абсолютный адрес, если домен задан; иначе относительный. */
  private absolute(path: string): string {
    const origin = SITE_URL.replace(/\/+$/, '');
    const normalized = path.startsWith('/') ? path : `/${path}`;

    return `${origin}${normalized}`;
  }

  private setMeta(
    attribute: 'name' | 'property',
    key: string,
    content: string,
  ): void {
    if (attribute === 'name') {
      this.meta.updateTag({ name: key, content });
      return;
    }

    this.meta.updateTag({ property: key, content });
  }

  private setCanonical(url: string): void {
    this.document.head
      .querySelectorAll(CANONICAL_SELECTOR)
      .forEach((link) => link.remove());

    const link = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    this.document.head.appendChild(link);
  }

  /** Альтернативы для поисковиков: `en`, `ru` и `x-default`. */
  private setAlternates(path: string): void {
    this.document.head
      .querySelectorAll(ALTERNATE_SELECTOR)
      .forEach((link) => link.remove());

    for (const locale of SUPPORTED_LOCALES) {
      this.appendAlternate(
        locale,
        this.absolute(this.swapLocale(path, locale)),
      );
    }

    this.appendAlternate(
      'x-default',
      this.absolute(this.swapLocale(path, DEFAULT_LOCALE)),
    );
  }

  private appendAlternate(hreflang: string, href: string): void {
    const link = this.document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', href);
    link.setAttribute('data-seo-alternate', '');
    this.document.head.appendChild(link);
  }

  private swapLocale(path: string, locale: Locale): string {
    const segments = path.split('/').filter(Boolean);

    if (isLocale(segments[0])) {
      segments[0] = locale;
    } else {
      segments.unshift(locale);
    }

    return `/${segments.join('/')}`;
  }

  private setJsonLd(
    page: SeoPage,
    context: {
      url: string;
      locale: Locale;
      description: string;
      type: SeoPageType;
    },
  ): void {
    this.document.getElementById(JSON_LD_ID)?.remove();

    const { url, locale, description, type } = context;
    const siteUrl = this.absolute('/');
    const site = {
      '@type': 'WebSite',
      '@id': `${siteUrl}#website`,
      name: SITE_NAME,
      url: siteUrl,
    };
    const node: Record<string, unknown> =
      type === 'website'
        ? {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': `${url}#website`,
            url,
            name: page.title,
            description,
            inLanguage: locale,
          }
        : {
            '@context': 'https://schema.org',
            '@type': SCHEMA_TYPES[type],
            '@id': `${url}#page`,
            url,
            name: page.title,
            description,
            inLanguage: locale,
            isPartOf: site,
          };

    if (type === 'article') node['headline'] = page.title;
    if (page.breadcrumbs?.length) {
      node['breadcrumb'] = this.breadcrumbList(page.breadcrumbs);
    }

    const script = this.document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.id = JSON_LD_ID;
    script.textContent = JSON.stringify(node);
    this.document.head.appendChild(script);
  }

  private breadcrumbList(
    items: readonly SeoBreadcrumb[],
  ): Record<string, unknown> {
    return {
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: this.absolute(item.path),
      })),
    };
  }
}
