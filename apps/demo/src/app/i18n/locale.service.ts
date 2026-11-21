import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
} from './constants/locale.constants';
import { UI_STRINGS } from './constants/ui-strings.constants';
import type { UiStrings } from './interfaces/ui-strings.interface';
import type { Locale } from './types/locale.type';
import type { UiKey } from './types/ui-key.type';
import { isLocale } from './utils/is-locale.util';
import { localeFromUrl } from './utils/locale-from-url.util';
import { splitOnce } from '../utils/split-once.util';

/**
 * Текущая локаль сайта и словарь UI-строк.
 *
 * Локаль — производная от URL: сервис слушает навигацию и обновляет сигнал.
 * Явный выбор пользователя (переключатель в шапке) дополнительно пишется в
 * `localStorage`, чтобы `/` открывался на выбранном языке.
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  readonly locale = signal<Locale>(
    localeFromUrl(this.router.url) ?? this.preferredLocale(),
  );

  readonly strings = computed<UiStrings>(() => UI_STRINGS[this.locale()]);
  readonly homeLink = computed(() => `/${this.locale()}`);
  readonly docsLink = computed(() => `/${this.locale()}/docs`);

  constructor() {
    this.applyDocumentLang(this.locale());

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const locale = localeFromUrl(this.router.url) ?? DEFAULT_LOCALE;
        if (locale !== this.locale()) this.locale.set(locale);
        this.applyDocumentLang(locale);
      });
  }

  t(key: UiKey): string {
    return this.strings()[key];
  }

  /** Локаль для `/`: сохранённый выбор или значение по умолчанию. */
  preferredLocale(): Locale {
    try {
      const stored =
        this.document.defaultView?.localStorage?.getItem(LOCALE_STORAGE_KEY);

      return isLocale(stored) ? stored : DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  }

  /** Переключает язык, сохраняя текущий путь, query и якорь. */
  switchLocale(locale: Locale): void {
    if (locale === this.locale()) return;

    this.persistLocale(locale);
    this.locale.set(locale);
    this.applyDocumentLang(locale);
    void this.router.navigateByUrl(this.localizedUrl(locale));
  }

  private localizedUrl(locale: Locale): string {
    const [pathAndQuery, hash = ''] = splitOnce(this.router.url, '#');
    const [pathname, query = ''] = splitOnce(pathAndQuery, '?');
    const segments = pathname.split('/').filter(Boolean);

    if (isLocale(segments[0])) {
      segments[0] = locale;
    } else {
      segments.unshift(locale);
    }

    return `/${segments.join('/')}${query ? `?${query}` : ''}${
      hash ? `#${hash}` : ''
    }`;
  }

  private persistLocale(locale: Locale): void {
    try {
      this.document.defaultView?.localStorage?.setItem(
        LOCALE_STORAGE_KEY,
        locale,
      );
    } catch {
      // Приватный режим или отключённое хранилище — язык просто не запомнится.
    }
  }

  private applyDocumentLang(locale: Locale): void {
    this.document.documentElement.lang = locale;
  }
}
