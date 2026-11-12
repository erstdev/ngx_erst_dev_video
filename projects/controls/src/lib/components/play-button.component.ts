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
import type { VideoState } from '@erst_dev/ngx-video-core';

/**
 * Контекст, доступный в пользовательском шаблоне иконки.
 *
 * @example
 * ```html
 * <ng-template #icon let-playing="playing" let-state="state">...</ng-template>
 * ```
 */
export interface PlayButtonIconContext {
  /** Текущее состояние плеера. */
  readonly state: VideoState;
  /** Идёт воспроизведение или буферизация. */
  readonly playing: boolean;
}

/**
 * Кнопка Play/Pause.
 *
 * Показывает иконку по переданному состоянию и сообщает наружу о клике.
 * Не управляет медиа-элементом: решение о запуске или остановке принимает
 * родитель, подписываясь на `toggle`.
 *
 * @example
 * ```html
 * <ngx-play-button
 *   [state]="video.state()"
 *   (toggle)="video.toggle()"
 * />
 * ```
 */
@Component({
  selector: 'ngx-play-button',
  imports: [NgTemplateOutlet],
  templateUrl: './play-button.component.html',
  styleUrl: './play-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayButtonComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private appliedClasses: readonly string[] = [];

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));
  }

  /** Текущее состояние плеера: по нему выбирается иконка. */
  readonly state = input.required<VideoState>();

  /**
   * Дополнительный CSS-класс для хост-элемента `<ngx-play-button>`.
   *
   * Класс вешается на хост, поэтому потребитель может стилизовать компонент
   * обычными scoped-стилями своего компонента — без `::ng-deep` и без
   * глобальных стилей. CSS-переменные с хоста наследуются внутрь.
   */
  readonly customClass = input('');

  /** Переопределение `aria-label`; по умолчанию «Воспроизвести» или «Пауза». */
  readonly ariaLabel = input<string | null>(null);

  /** Пользовательская иконка вместо стандартной. */
  readonly iconTemplate = input<TemplateRef<PlayButtonIconContext> | null>(
    null,
  );

  /**
   * Клик по кнопке: решение принимает родитель.
   *
   * Имя `toggle` зафиксировано публичным контрактом (раздел 10 `CONTEXT.md`),
   * поэтому правило `no-output-native` отключено точечно: нативное событие
   * `toggle` относится к `<details>` и popover, а не к кастомному элементу.
   */
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly toggle = output<void>();

  /** Идёт воспроизведение или буферизация — показываем иконку паузы. */
  protected readonly playing = computed(
    () => this.state() === 'playing' || this.state() === 'buffering',
  );

  protected readonly label = computed(
    () => this.ariaLabel() ?? (this.playing() ? 'Пауза' : 'Воспроизвести'),
  );

  protected readonly iconContext = computed<PlayButtonIconContext>(() => ({
    state: this.state(),
    playing: this.playing(),
  }));

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
