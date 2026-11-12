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

import { clamp } from '../../utils';

/**
 * Ползунок громкости.
 *
 * Показывает переданный уровень и сообщает наружу о новом значении.
 * Не хранит состояние и не вызывает методы медиа-элемента: громкость применяет
 * родитель, подписываясь на `volumeChange`. Mute не входит в ответственность
 * компонента — для него нужна отдельная кнопка.
 *
 * @example
 * ```html
 * <ngx-volume-slider
 *   [volume]="video.volume()"
 *   (volumeChange)="video.setVolume($event)"
 * />
 * ```
 */
@Component({
  selector: 'ngx-volume-slider',
  templateUrl: './volume-slider.component.html',
  styleUrl: './volume-slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolumeSliderComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private appliedClasses: readonly string[] = [];

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));
  }

  /**
   * Текущий уровень громкости от `0` до `1`.
   *
   * Значения вне диапазона зажимаются при отображении: компонент не меняет
   * переданное значение, а только показывает его в допустимых границах.
   */
  readonly volume = input.required<number>();

  /**
   * Дополнительный CSS-класс для хост-элемента `<ngx-volume-slider>`.
   *
   * Класс вешается на хост, поэтому потребитель может стилизовать компонент
   * обычными scoped-стилями своего компонента — без `::ng-deep` и без
   * глобальных стилей. CSS-переменные с хоста наследуются внутрь.
   */
  readonly customClass = input('');

  /** Переопределение `aria-label`; по умолчанию «Громкость». */
  readonly ariaLabel = input<string | null>(null);

  /**
   * Новое значение громкости от `0` до `1`.
   *
   * Эмитится на нативное событие `input` — во время перетаскивания, клика
   * по треку и изменения с клавиатуры. Решение о применении принимает родитель.
   */
  readonly volumeChange = output<number>();

  /** Уровень, зажатый в диапазон `0…1`, — основа для отображения. */
  protected readonly normalizedVolume = computed(() =>
    clamp(this.volume(), 0, 1),
  );

  /** Уровень в процентах — для `aria-valuetext` и заливки трека. */
  protected readonly volumePercent = computed(() =>
    Math.round(this.normalizedVolume() * 100),
  );

  protected readonly label = computed(() => this.ariaLabel() ?? 'Громкость');

  protected onInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(value)) {
      return;
    }

    this.volumeChange.emit(clamp(value, 0, 1));
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
