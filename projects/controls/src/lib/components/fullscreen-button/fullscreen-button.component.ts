import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';

import type { FullscreenButtonIconContext } from './interfaces';

/**
 * Кнопка входа и выхода из полноэкранного режима.
 *
 * Показывает иконку по переданному состоянию и сообщает наружу о клике.
 * Fullscreen API не вызывает: решение и сам запрос выполняет родитель,
 * подписываясь на `toggle` (например, `video.toggleFullscreen()`).
 *
 * @example
 * ```html
 * <ngx-fullscreen-button
 *   [fullscreen]="video.fullscreen()"
 *   (toggle)="video.toggleFullscreen()"
 * />
 * ```
 */
@Component({
  selector: 'ngx-fullscreen-button',
  imports: [NgTemplateOutlet],
  templateUrl: './fullscreen-button.component.html',
  styleUrl: './fullscreen-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FullscreenButtonComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private appliedClasses: readonly string[] = [];

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));
  }

  /** Включён ли полноэкранный режим: по нему выбираются иконка и подпись. */
  readonly fullscreen = input.required<boolean>();

  /**
   * Дополнительный CSS-класс для хост-элемента `<ngx-fullscreen-button>`.
   *
   * Класс вешается на хост, поэтому потребитель может стилизовать компонент
   * обычными scoped-стилями своего компонента — без `::ng-deep` и без
   * глобальных стилей. CSS-переменные с хоста наследуются внутрь.
   */
  readonly customClass = input('');

  /**
   * Переопределение `aria-label`; по умолчанию «Полноэкранный режим» или
   * «Выйти из полноэкранного режима».
   */
  readonly ariaLabel = input<string | null>(null);

  /** Пользовательская иконка вместо стандартной. */
  readonly iconTemplate =
    input<TemplateRef<FullscreenButtonIconContext> | null>(null);

  /**
   * Клик по кнопке: решение и вызов Fullscreen API принимает родитель.
   *
   * Имя `toggle` зафиксировано публичным контрактом (раздел 10 `CONTEXT.md`),
   * поэтому правило `no-output-native` отключено точечно: нативное событие
   * `toggle` относится к `<details>` и popover, а не к кастомному элементу.
   */
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly toggle = output<void>();

  protected readonly label = computed(
    () =>
      this.ariaLabel() ??
      (this.fullscreen()
        ? 'Выйти из полноэкранного режима'
        : 'Полноэкранный режим'),
  );

  protected readonly iconContext = computed<FullscreenButtonIconContext>(
    () => ({
      fullscreen: this.fullscreen(),
    }),
  );

  protected onClick(): void {
    this.toggle.emit();
  }

  /**
   * Синхронизирует классы хоста с `customClass`.
   *
   * Классы, которые пользователь задал на элементе вручную (`class="..."`),
   * не затрагиваются: удаляются только те, что были добавлены этим входом.
   */
  private syncCustomClass(value: string): void {
    const next = value.split(/\s+/).filter(Boolean);
    const element = this.host.nativeElement;

    for (const name of this.appliedClasses) {
      if (!next.includes(name)) {
        element.classList.remove(name);
      }
    }

    for (const name of next) {
      if (!this.appliedClasses.includes(name)) {
        element.classList.add(name);
      }
    }

    this.appliedClasses = next;
  }
}
