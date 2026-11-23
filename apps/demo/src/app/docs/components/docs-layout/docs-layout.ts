import { ChangeDetectionStrategy, Component } from '@angular/core';

import { DocsNavComponent } from '../docs-nav/docs-nav';

/** Каркас страниц `/docs`: слева сайдбар, справа статья. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-docs-layout',
  imports: [DocsNavComponent],
  templateUrl: './docs-layout.html',
})
export class DocsLayoutComponent {}
