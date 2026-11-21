import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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

  protected changeLocale(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (isLocale(value)) this.i18n.switchLocale(value);
  }
}
