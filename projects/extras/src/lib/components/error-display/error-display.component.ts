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
import type { VideoError } from '@erst_dev/ngx-video-core';

/** Сообщение, если в `VideoError.message` ничего не пришло. */
const FALLBACK_MESSAGE = 'Не удалось воспроизвести видео';

/**
 * Карточка с сообщением об ошибке плеера и кнопкой «Повторить».
 *
 * Компонент presentational: он показывает то, что передал родитель, и только
 * сообщает о клике через выход `retry`. Никаких попыток исправить ошибку,
 * обратиться к медиа-элементу или `VideoService` он не делает.
 *
 * При `error === null` карточки нет в DOM: рендер идёт через `@if`, а пустой
 * хост не перехватывает клики.
 *
 * @example
 * ```html
 * <div class="player">
 *   <video ngxVideo [src]="src"></video>
 *
 *   <ngx-error-display
 *     [error]="video.error()"
 *     (retry)="onRetry()"
 *   />
 * </div>
 * ```
 */
@Component({
  selector: 'ngx-error-display',
  templateUrl: './error-display.component.html',
  styleUrl: './error-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDisplayComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private appliedClasses: readonly string[] = [];

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));
  }

  /** Ошибка плеера; `null` — карточка не рендерится. */
  readonly error = input.required<VideoError | null>();

  /**
   * Дополнительный CSS-класс для хост-элемента `<ngx-error-display>`.
   *
   * Класс вешается на хост, поэтому потребитель может переопределять
   * CSS-переменные обычными scoped-стилями своего компонента.
   */
  readonly customClass = input('');

  /**
   * Клик по кнопке «Повторить»: решение о повторе принимает родитель.
   *
   * Компонент не вызывает `play()`, `seek()` и другие методы медиа-элемента.
   */
  readonly retry = output<void>();

  /** Текст ошибки; пустой `message` заменяется на нейтральный fallback. */
  protected readonly message = computed(
    () => this.error()?.message.trim() || FALLBACK_MESSAGE,
  );

  protected onRetry(): void {
    this.retry.emit();
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
