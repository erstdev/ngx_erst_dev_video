import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Раскрывающийся блок с кодом примера.
 *
 * Код передаётся строкой и выводится через интерполяцию, поэтому HTML
 * экранируется автоматически и его не нужно вручную оборачивать в `&lt;`.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-code-snippet',
  templateUrl: './code-snippet.html',
  styleUrl: './code-snippet.scss',
})
export class CodeSnippetComponent {
  /** Подпись в заголовке блока. */
  readonly title = input('Код примера');

  /** Открыть блок сразу, без клика. */
  readonly open = input(false);

  /** Код для отображения. */
  readonly code = input.required<string>();
}
