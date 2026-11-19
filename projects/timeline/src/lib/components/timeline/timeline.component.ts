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
  signal,
  viewChild,
} from '@angular/core';
import { formatTime } from '@erst_dev/ngx-video-core';

import { clamp } from './utils';
import type { TimelinePreviewContext } from './interfaces';

/**
 * Базовая полоса перемотки.
 *
 * Компонент управляемый: он не хранит текущее время и не вызывает методы
 * `<video>`. Он рисует переданные `currentTime`, `duration` и `buffered`,
 * а действия пользователя отдаёт наружу.
 *
 * Базовая версия использует вариант A: во время перетаскивания двигается только
 * локальный `dragTime`, а `seek` эмитится один раз — при отпускании. Это не
 * дёргает основной `<video>` десятками перемоток. Live-scrub (вариант B) можно
 * добавить позже отдельным входом, не ломая текущий контракт.
 *
 * @example
 * ```html
 * <ngx-timeline
 *   [currentTime]="video.time()"
 *   [duration]="video.duration()"
 *   [buffered]="video.buffered()"
 *   (seek)="video.seek($event)"
 * />
 * ```
 */
@Component({
  selector: 'ngx-timeline',
  imports: [NgTemplateOutlet],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private appliedClasses: readonly string[] = [];

  /** Текущая позиция в секундах. */
  readonly currentTime = input.required<number>();

  /** Общая длительность в секундах; `0`, пока метаданные не загружены. */
  readonly duration = input.required<number>();

  /** Конец буферизованного диапазона в секундах. */
  readonly buffered = input(0);

  /** Шаг стрелок клавиатуры в секундах; по умолчанию 5. */
  readonly keyboardStep = input(5);

  /**
   * Дополнительный CSS-класс для хост-элемента `<ngx-timeline>`.
   *
   * Класс вешается на хост, поэтому потребитель может стилизовать компонент
   * обычными scoped-стилями своего компонента — без `::ng-deep` и без
   * глобальных стилей. CSS-переменные с хоста наследуются внутрь.
   */
  readonly customClass = input('');

  /** Переопределение `aria-label`; по умолчанию «Перемотка». */
  readonly ariaLabel = input<string | null>(null);

  /**
   * Необязательный шаблон превью, который рендерится над полосой при наведении.
   *
   * В контекст передаётся время под курсором. Сам таймлайн не знает, что
   * показывать: кадр, время или что-то ещё — это решение потребителя.
   */
  readonly previewTemplate = input<TemplateRef<TimelinePreviewContext> | null>(
    null,
  );

  /** Запрос на перемотку; эмитится при отпускании, клике или с клавиатуры. */
  readonly seek = output<number>();

  /** Начало pointer-жеста по полосе. */
  readonly scrubStart = output<void>();

  /** Конец pointer-жеста: отпускание или отмена. */
  readonly scrubEnd = output<void>();

  private readonly dragging = signal(false);
  private readonly dragTime = signal(0);

  /** Время под курсором для preview; `null`, когда курсор вне полосы. */
  protected readonly hoverTime = signal<number | null>(null);

  /** Длительность, приведённая к корректному неотрицательному числу. */
  protected readonly maxValue = computed(() => this.safeDuration());

  /** Отображаемое время: во время drag — локальное, иначе — входное. */
  protected readonly displayTime = computed(() => {
    const duration = this.safeDuration();
    const value = this.dragging() ? this.dragTime() : this.currentTime();
    return clamp(value, 0, duration);
  });

  protected readonly progressPercent = computed(() => {
    const duration = this.safeDuration();
    return duration > 0 ? (this.displayTime() / duration) * 100 : 0;
  });

  protected readonly bufferedPercent = computed(() => {
    const duration = this.safeDuration();
    return duration > 0
      ? (clamp(this.buffered(), 0, duration) / duration) * 100
      : 0;
  });

  protected readonly hoverPercent = computed(() => {
    const duration = this.safeDuration();
    const time = this.hoverTime();
    return duration > 0 && time !== null ? (time / duration) * 100 : 0;
  });

  protected readonly label = computed(() => this.ariaLabel() ?? 'Перемотка');

  protected readonly valueText = computed(
    () => `${formatTime(this.displayTime())} из ${formatTime(this.maxValue())}`,
  );

  protected readonly disabled = computed(() => this.maxValue() <= 0);

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.disabled()) {
      return;
    }

    const time = this.timeFromEvent(event);
    this.dragging.set(true);
    this.dragTime.set(time);
    this.hoverTime.set(time);
    this.scrubStart.emit();
    this.track().nativeElement.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.disabled()) {
      return;
    }

    const time = this.timeFromEvent(event);
    this.hoverTime.set(time);

    if (this.dragging()) {
      this.dragTime.set(time);
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.dragging()) {
      return;
    }

    const time = this.timeFromEvent(event);
    this.dragTime.set(time);
    this.hoverTime.set(time);
    this.dragging.set(false);
    this.releasePointerCapture(event.pointerId);

    /*
     * Сначала сообщаем точную позицию, потом закрываем жест: родитель успевает
     * применить seek до возможного resume по scrubEnd.
     */
    this.seek.emit(time);
    this.scrubEnd.emit();
  }

  protected onPointerCancel(event: PointerEvent): void {
    if (!this.dragging()) {
      return;
    }

    this.dragging.set(false);
    this.hoverTime.set(null);
    this.releasePointerCapture(event.pointerId);
    this.scrubEnd.emit();
  }

  protected onPointerLeave(): void {
    if (!this.dragging()) {
      this.hoverTime.set(null);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    const duration = this.maxValue();
    const step = this.safeStep();
    let target: number;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        target = this.displayTime() - step;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        target = this.displayTime() + step;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = duration;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.seek.emit(clamp(target, 0, duration));
  }

  /** Переводит координату указателя в секунды с учётом границ полосы. */
  private timeFromEvent(event: PointerEvent): number {
    const rect = this.track().nativeElement.getBoundingClientRect();
    if (rect.width <= 0) {
      return 0;
    }

    const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    return ratio * this.safeDuration();
  }

  private safeDuration(): number {
    const duration = this.duration();
    return Number.isFinite(duration) && duration > 0 ? duration : 0;
  }

  private safeStep(): number {
    const step = this.keyboardStep();
    return Number.isFinite(step) && step > 0 ? step : 5;
  }

  private releasePointerCapture(pointerId: number): void {
    const element = this.track().nativeElement;

    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
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
