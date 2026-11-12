import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { formatTime } from '@erst_dev/ngx-video-core';

/**
 * Текущее время и длительность в виде «текущее / общее».
 *
 * Оба значения форматируются общей утилитой `formatTime` из core: до часа —
 * `мм:сс`, начиная с часа — `ч:мм:сс`, некорректные числа — `00:00`.
 *
 * Компонент ничего не запрашивает у `VideoService` и не следит за `<video>`:
 * значения приходят через входы, обновляет их родитель.
 *
 * @example
 * ```html
 * <ngx-time-display
 *   [currentTime]="video.time()"
 *   [duration]="video.duration()"
 * />
 * ```
 */
@Component({
  selector: 'ngx-time-display',
  templateUrl: './time-display.component.html',
  styleUrl: './time-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeDisplayComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private appliedClasses: readonly string[] = [];

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));
  }

  /** Текущая позиция в секундах. */
  readonly currentTime = input.required<number>();

  /** Общая длительность в секундах; `0`, пока метаданные не загружены. */
  readonly duration = input.required<number>();

  /**
   * Дополнительный CSS-класс для хост-элемента `<ngx-time-display>`.
   *
   * Класс вешается на хост, поэтому потребитель может стилизовать компонент
   * обычными scoped-стилями своего компонента — без `::ng-deep` и без
   * глобальных стилей. CSS-переменные с хоста наследуются внутрь.
   */
  readonly customClass = input('');

  /** Текущее время в формате `мм:сс` или `ч:мм:сс`. */
  protected readonly currentText = computed(() =>
    formatTime(this.currentTime()),
  );

  /** Длительность в формате `мм:сс` или `ч:мм:сс`. */
  protected readonly durationText = computed(() => formatTime(this.duration()));

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
