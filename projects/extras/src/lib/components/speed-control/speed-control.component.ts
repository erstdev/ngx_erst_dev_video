import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';

import { formatRate, isValidRate } from './utils';

/**
 * Селектор скорости воспроизведения.
 *
 * Показывает текущую скорость и сообщает о выборе новой через `rateChange`.
 * Компонент presentational: не хранит состояние, не вызывает
 * `setPlaybackRate()` и не знает о `VideoService` — скорость к видео применяет
 * родитель.
 *
 * Если `playbackRate` нет среди `rates`, он добавляется в конец списка, чтобы
 * селект не показывал пустое значение.
 *
 * @example
 * ```html
 * <ngx-speed-control
 *   [playbackRate]="video.playbackRate()"
 *   (rateChange)="onRateChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'ngx-speed-control',
  templateUrl: './speed-control.component.html',
  styleUrl: './speed-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeedControlComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private appliedClasses: readonly string[] = [];

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));
  }

  /** Текущая скорость воспроизведения. */
  readonly playbackRate = input.required<number>();

  /**
   * Доступные скорости в порядке показа.
   *
   * Некорректные значения (не конечные или не больше нуля) отбрасываются,
   * дубликаты схлопываются. Текущая скорость добавляется в конец, если её нет
   * в списке.
   */
  readonly rates = input<readonly number[]>([0.5, 1, 1.5, 2]);

  /**
   * Дополнительный CSS-класс для хост-элемента `<ngx-speed-control>`.
   *
   * Класс вешается на хост, поэтому потребитель может переопределять
   * CSS-переменные обычными scoped-стилями своего компонента.
   */
  readonly customClass = input('');

  /**
   * Выбранная скорость.
   *
   * Эмитится на нативное событие `change`; решение о применении принимает
   * родитель.
   */
  readonly rateChange = output<number>();

  /** Опции селекта: `rates` без дублей плюс текущая скорость, если её нет. */
  protected readonly options = computed<readonly number[]>(() => {
    const result: number[] = [];

    for (const rate of this.rates()) {
      if (isValidRate(rate) && !result.includes(rate)) {
        result.push(rate);
      }
    }

    const current = this.playbackRate();
    if (isValidRate(current) && !result.includes(current)) {
      result.push(current);
    }

    return result;
  });

  /** Скорость, отмеченная в селекте; при некорректном входе — первая опция. */
  protected readonly selectedRate = computed(() => {
    const current = this.playbackRate();
    const options = this.options();

    return options.includes(current) ? current : (options[0] ?? current);
  });

  /** Подпись скорости для шаблона. */
  protected readonly formatRate = formatRate;

  protected onChange(event: Event): void {
    const rate = Number((event.target as HTMLSelectElement).value);
    if (!isValidRate(rate)) {
      return;
    }

    this.rateChange.emit(rate);
  }

  /**
   * Синхронизирует классы хоста с `customClass`.
   *
   * Классы, заданные пользователем вручную через `class="..."`, не
   * затрагиваются: удаляются только те, что были добавлены этим входом.
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
