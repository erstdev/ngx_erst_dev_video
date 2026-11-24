import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { DEMO_GROUPS } from '../../constants/demo-groups.constants';
import { SITE_NAME } from '../../constants/site.constants';
import type { DemoEntry } from '../../interfaces/demo-entry.interface';
import type { DemoGroup } from '../../interfaces/demo-group.interface';
import type { DemoGroupId } from '../../types/demo-group-id.type';
import { LocaleService } from '../../i18n/services/locale.service';
import { CodeSnippetComponent } from '../../components/code-snippet/code-snippet';
import { SeoService } from '../../services/seo.service';
import { LANDING_CONTENT } from '../constants/landing-content.constants';

/**
 * Главная-витрина сайта: что это за библиотеки, из каких пакетов состоят
 * и быстрый старт. Каталог примеров живёт в разделе `/docs`.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  imports: [CodeSnippetComponent, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly groups = DEMO_GROUPS;
  protected readonly i18n = inject(LocaleService);
  private readonly seo = inject(SeoService);

  protected readonly content = computed(
    () => LANDING_CONTENT[this.i18n.locale()],
  );

  constructor() {
    effect(() => {
      const content = this.content();

      this.seo.apply({
        title: `${content.heroTitle} — ${SITE_NAME}`,
        description: content.heroSubtitle,
        type: 'website',
      });
    });
  }

  protected readonly installCode =
    'npm install @erst_dev/ngx-video-core @erst_dev/ngx-video-controls';

  protected readonly usageCode = [
    "import { Component, inject } from '@angular/core';",
    "import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';",
    "import { PlayButtonComponent } from '@erst_dev/ngx-video-controls';",
    '',
    '@Component({',
    "  selector: 'app-player',",
    '  imports: [VideoDirective, PlayButtonComponent],',
    '  template: `',
    '    <video ngxVideo [src]="src" playsinline></video>',
    '    <ngx-play-button [state]="video.state()" (toggle)="video.toggle()" />',
    '  `,',
    '})',
    'export class PlayerComponent {',
    '  readonly video = inject(VideoService);',
    "  readonly src = 'https://example.com/video.mp4';",
    '}',
  ].join('\n');

  protected link(path: string): string {
    return `/${this.i18n.locale()}/${path}`;
  }

  protected demoTitle(demo: DemoEntry): string {
    return demo.titleKey ? this.i18n.t(demo.titleKey) : demo.title;
  }

  protected packageDescription(id: DemoGroupId): string {
    return this.content().packageDescriptions[id];
  }

  protected firstDemoPath(group: DemoGroup): string {
    return group.demos[0]?.path ?? group.docsPath;
  }
}
