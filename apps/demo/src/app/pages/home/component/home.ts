import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { DEMO_GROUPS } from '../../demos/constants/demo-groups.constants';
import { DEMO_STATUS_KEYS } from '../../demos/constants/demo-status.constants';
import type { DemoEntry } from '../../demos/interfaces/demo-entry.interface';
import type { DemoGroup } from '../../demos/interfaces/demo-group.interface';
import type { DemoGroupId } from '../../demos/types/demo-group-id.type';
import type { DemoStatus } from '../../demos/types/demo-status.type';
import { LocaleService } from '../../../i18n/locale.service';
import { CodeSnippetComponent } from '../../../code-snippet/code-snippet';
import { LANDING_CONTENT } from '../constants/landing-content.constants';

/**
 * Главная-витрина сайта: что это за библиотеки, из каких пакетов состоят,
 * быстрый старт и индекс всех примеров. Отдельной точки входа нет.
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
  private readonly document = inject(DOCUMENT);
  protected readonly content = computed(
    () => LANDING_CONTENT[this.i18n.locale()],
  );

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

  protected statusLabel(status: DemoStatus): string {
    return this.i18n.t(DEMO_STATUS_KEYS[status]);
  }

  protected link(path: string): string {
    return `/${this.i18n.locale()}/${path}`;
  }

  /**
   * Прокрутка к индексу примеров. Обычный href="#examples" под <base href="/">
   * разрешается от корня и теряет локаль, поэтому ведём вручную.
   */
  protected scrollToExamples(event: MouseEvent): void {
    event.preventDefault();
    this.document
      .getElementById('examples')
      ?.scrollIntoView({ block: 'start' });
    this.document.defaultView?.history.replaceState(
      null,
      '',
      `${this.i18n.homeLink()}#examples`,
    );
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
