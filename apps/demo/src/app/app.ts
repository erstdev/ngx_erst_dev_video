import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';

import { type Locale, isLocale } from './i18n/locale';
import { LocaleService } from './i18n/locale.service';

/** Корневая оболочка сайта: шапка с навигацией и переключателем языка. */
@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly i18n = inject(LocaleService);
  protected readonly locales: readonly { code: Locale; label: string }[] = [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
  ];

  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  constructor() {
    // Обычная навигация начинается с верха страницы; переходы к якорям
    // прокручивает DocsPage (там известен загруженный контент).
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (!this.router.parseUrl(this.router.url).fragment) {
          this.document.defaultView?.scrollTo({ top: 0 });
        }
      });
  }

  protected changeLocale(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (isLocale(value)) this.i18n.switchLocale(value);
  }
}
