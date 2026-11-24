import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

import { LocaleService } from '../../../i18n/services/locale.service';
import { SITE_NAME } from '../../../constants/site.constants';
import { SeoService } from '../../../services/seo.service';
import { splitOnce } from '../../../utils/split-once.util';
import { DocsLayoutComponent } from '../../components/docs-layout/docs-layout';
import { DocsTabsComponent } from '../../components/docs-tabs/docs-tabs';
import type { DocsPageData } from '../../interfaces/docs-page-data.interface';
import { decodeFragment } from '../../utils/decode-fragment.util';

/**
 * Страница API-справки `/docs/<пакет>` и `/docs/<пакет>/<кирпич>`.
 *
 * HTML приходит из resolver'а: на сборке — из сгенерированного серверного
 * модуля, в браузере — из `TransferState` после пререндера или из JSON-ассета
 * при клиентском переходе. Поэтому статья готова к первому рендеру и hydration
 * не находит расхождений.
 *
 * `bypassSecurityTrustHtml` используется осознанно: генератор экранирует сырой
 * HTML из README и сам собирает разметку, а стандартный санитайзер Angular
 * вырезал бы `id` заголовков — без них не работают якоря.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-docs-page',
  imports: [DocsLayoutComponent, DocsTabsComponent, RouterLink],
  templateUrl: './docs-page.html',
  styleUrl: './docs-page.scss',
})
export class DocsPage {
  readonly locale = input.required<string>();
  readonly pkg = input.required<string>();
  readonly brick = input('');
  /** Страница из resolver'а: статья есть до первого рендера. */
  readonly docsPage = input<DocsPageData | null>(null);

  protected readonly i18n = inject(LocaleService);
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  protected readonly toc = computed(() =>
    (this.docsPage()?.headings ?? []).filter(
      (heading) => heading.level === 2 || heading.level === 3,
    ),
  );
  protected readonly safeHtml = computed<SafeHtml | string>(() => {
    const page = this.docsPage();

    return page ? this.sanitizer.bypassSecurityTrustHtml(page.html) : '';
  });

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.scrollToFragment());

    // Данные приходят resolver'ом, но DOM ещё не отрисован: якорь ищем после
    // первого рендера. На сервере колбэк не выполняется.
    afterNextRender(() => this.scrollToFragment());

    effect(() => {
      const doc = this.docsPage();
      if (!doc) return;

      const locale = this.i18n.locale();
      const base = `/${locale}/docs`;
      const brick = this.brick();
      const pkg = this.pkg();
      const breadcrumbs = [
        { name: this.i18n.t('navHome'), path: `/${locale}` },
        { name: this.i18n.t('docsTitle'), path: base },
      ];

      if (brick) {
        breadcrumbs.push({ name: pkg, path: `${base}/${pkg}` });
        breadcrumbs.push({ name: doc.title, path: `${base}/${pkg}/${brick}` });
      } else {
        breadcrumbs.push({ name: doc.title, path: `${base}/${pkg}` });
      }

      this.seo.apply({
        title: brick
          ? `${doc.title} API — ${SITE_NAME}`
          : `${doc.title} — ${SITE_NAME}`,
        description: doc.description,
        type: 'article',
        breadcrumbs,
      });
    });
  }

  /** Оглавление: тот же якорь, но без перезагрузки страницы. */
  protected onTocClick(event: MouseEvent, id: string): void {
    event.preventDefault();
    const path = splitOnce(this.router.url, '#')[0];
    void this.router.navigateByUrl(`${path}#${id}`, { replaceUrl: true });
    this.document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }

  /** Внутренние ссылки из README ведут через роутер, а не перезагрузкой. */
  protected onContentClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const anchor = target.closest('a');
    if (!(anchor instanceof HTMLAnchorElement)) return;
    if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    if (href.startsWith('#')) {
      event.preventDefault();
      const path = splitOnce(this.router.url, '#')[0];
      void this.router.navigateByUrl(`${path}${href}`, { replaceUrl: true });
      this.scrollToFragment();
      return;
    }

    if (href.startsWith('/')) {
      event.preventDefault();
      void this.router.navigateByUrl(href);
    }
  }

  private scrollToFragment(): void {
    const [, hash = ''] = splitOnce(this.router.url, '#');
    if (!hash) return;

    this.document
      .getElementById(decodeFragment(hash))
      ?.scrollIntoView({ block: 'start' });
  }
}
