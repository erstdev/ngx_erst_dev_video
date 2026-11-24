import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';

import { DEMO_GROUPS } from '../../constants/demo-groups.constants';
import { SITE_NAME } from '../../constants/site.constants';
import { DocsLayoutComponent } from '../../docs/components/docs-layout/docs-layout';
import { DocsTabsComponent } from '../../docs/components/docs-tabs/docs-tabs';
import { LocaleService } from '../../i18n/services/locale.service';
import { SeoService } from '../../services/seo.service';

/**
 * Каркас страницы примера: заголовок компонента, описание, ответственности
 * и слот «живого демо». Вкладки «Пример» и «API» даёт `app-docs-tabs`.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-demo-shell',
  imports: [DocsLayoutComponent, DocsTabsComponent],
  templateUrl: './demo-shell.html',
  styleUrl: './demo-shell.scss',
})
export class DemoShellComponent {
  readonly title = input.required<string>();
  readonly pkg = input.required<string>();
  readonly selector = input<string>('');
  readonly description = input.required<string>();
  readonly responsibilities = input<readonly string[]>([]);
  readonly pro = input(false);

  protected readonly i18n = inject(LocaleService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  /**
   * Пакет, кирпич и адрес API из URL и реестра:
   * `/<локаль>/docs/<пакет>/<кирпич>`.
   */
  protected readonly route = this.parseRoute();

  constructor() {
    effect(() => {
      const title = this.title();
      const locale = this.i18n.locale();
      const base = `/${locale}/docs`;
      const { pkg, brick } = this.route;

      this.seo.apply({
        title: `${title} — ${SITE_NAME}`,
        description: this.description(),
        type: 'webpage',
        breadcrumbs: [
          { name: this.i18n.t('navHome'), path: `/${locale}` },
          { name: this.i18n.t('docsTitle'), path: base },
          { name: pkg, path: `${base}/${pkg}` },
          { name: title, path: `${base}/${pkg}/${brick}` },
        ],
      });
    });
  }

  private parseRoute(): { pkg: string; brick: string; apiPath: string } {
    const [pathname] = this.router.url.split(/[?#]/);
    const [, , pkg = '', brick = ''] = pathname.split('/').filter(Boolean);
    const path = `docs/${pkg}/${brick}`;
    const entry = DEMO_GROUPS.flatMap((group) => group.demos).find(
      (demo) => demo.path === path,
    );

    return { pkg, brick, apiPath: entry?.docsPath ?? `${path}/api` };
  }
}
