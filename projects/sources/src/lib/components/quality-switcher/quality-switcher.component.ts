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

import type { QualityInterface } from '@erst_dev/ngx-video-core';

import {
  QUALITY_AUTO_LABEL,
  QUALITY_AUTO_VALUE,
  QUALITY_SWITCHER_ARIA_LABEL,
} from './constants';

/**
 * Селектор качества видео.
 *
 * Показывает пункт «Auto» и доступные уровни в заданном порядке, а на выбор
 * пользователя эмитит `id` уровня или `null` для Auto. Компонент presentational:
 * не хранит состояние, не парсит манифесты, не знает о `VideoService` и не
 * применяет качество — это делает родитель через вход `level` директивы
 * `HlsSourceDirective`/`DashSourceDirective`.
 *
 * @example
 * ```html
 * <ngx-quality-switcher
 *   [levels]="levels()"
 *   [level]="level()"
 *   (levelChange)="level.set($event)"
 * />
 * ```
 */
@Component({
  selector: 'ngx-quality-switcher',
  templateUrl: './quality-switcher.component.html',
  styleUrl: './quality-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QualitySwitcherComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private appliedClasses: readonly string[] = [];

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));
  }

  /**
   * Доступные уровни качества без «auto».
   *
   * Порядок показа сохраняется: компонент ничего не сортирует, не фильтрует и
   * не добавляет отсутствующие уровни.
   */
  readonly levels = input<readonly QualityInterface[]>([]);

  /**
   * `id` выбранного уровня; `null` — автоматический выбор.
   *
   * Если значения нет среди `levels`, селект показывает Auto, но выход ничего не
   * эмитит: качество нельзя «выдумать».
   */
  readonly level = input<string | null>(null);

  /**
   * Дополнительный CSS-класс для хост-элемента `<ngx-quality-switcher>`.
   *
   * Класс вешается на хост, поэтому потребитель может переопределять
   * CSS-переменные обычными scoped-стилями своего компонента.
   */
  readonly customClass = input('');

  /** Доступное имя нативного `<select>`. */
  readonly ariaLabel = input(QUALITY_SWITCHER_ARIA_LABEL);

  /**
   * Выбранный `id` уровня или `null` для Auto.
   *
   * Эмитится на нативное событие `change`; решение о применении принимает
   * родитель.
   */
  readonly levelChange = output<string | null>();

  /** Подпись пункта Auto. */
  protected readonly autoLabel = QUALITY_AUTO_LABEL;

  /** Значение пункта Auto в нативном `<select>`. */
  protected readonly autoValue = QUALITY_AUTO_VALUE;

  /**
   * Значение, отмеченное в селекте.
   *
   * Известный `id` выбирает свой уровень, всё остальное (включая `null` и
   * неизвестный `id`) — Auto.
   */
  protected readonly selectedLevel = computed<string>(() => {
    const level = this.level();

    if (level === null) {
      return QUALITY_AUTO_VALUE;
    }

    return this.levels().some((item) => item.id === level)
      ? level
      : QUALITY_AUTO_VALUE;
  });

  protected onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.levelChange.emit(value === QUALITY_AUTO_VALUE ? null : value);
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
