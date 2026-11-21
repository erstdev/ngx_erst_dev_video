import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  DEMO_GROUPS,
  type DemoEntry,
  type DemoGroup,
  type DemoGroupId,
  type DemoStatus,
} from '../../demos/demo-registry';
import { LocaleService } from '../../i18n/locale.service';
import type { UiKey } from '../../i18n/ui-strings';
import { CodeSnippetComponent } from '../../demos/shared/code-snippet/code-snippet';
import { LANDING_CONTENT } from './home-content';

const STATUS_KEYS: Readonly<Record<DemoStatus, UiKey>> = {
  ready: 'statusReady',
  wip: 'statusWip',
  planned: 'statusPlanned',
};

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
    return this.i18n.t(STATUS_KEYS[status]);
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
