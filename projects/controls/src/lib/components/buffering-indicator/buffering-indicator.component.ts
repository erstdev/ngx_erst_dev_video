import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import type { VideoState } from '@erst_dev/ngx-video-core';

/**
 * Индикатор загрузки (спиннер).
 *
 * Показывается, когда переданное состояние равно `buffering`. Момент включения
 * буферизации определяет `VideoService`, а не компонент: он только отражает
 * состояние и ничего не решает сам.
 *
 * @example
 * ```html
 * <ngx-buffering-indicator [state]="video.state()" />
 * ```
 */
@Component({
  selector: 'ngx-buffering-indicator',
  templateUrl: './buffering-indicator.component.html',
  styleUrl: './buffering-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BufferingIndicatorComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly show = signal(false);
  private appliedClasses: readonly string[] = [];

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));

    effect((onCleanup) => {
      const buffering = this.state() === 'buffering';
      const rawDelay = this.delay();
      const delay = Number.isFinite(rawDelay) ? Math.max(rawDelay, 0) : 0;

      /*
       * На сервере таймер не нужен: отдаём индикатор сразу, если состояние
       * уже buffering. В браузере задержка защищает от мигания спиннера.
       */
      if (buffering && this.isBrowser && delay > 0) {
        const timer = setTimeout(() => this.show.set(true), delay);
        onCleanup(() => clearTimeout(timer));
        return;
      }

      this.show.set(buffering);
    });
  }

  /** Текущее состояние плеера; индикатор виден только при `buffering`. */
  readonly state = input.required<VideoState>();

  /**
   * Задержка появления в миллисекундах.
   *
   * Защищает от мигания при короткой буферизации: индикатор появится, только
   * если состояние `buffering` длится дольше указанного времени. По умолчанию
   * `0` — показывать сразу. Отрицательные и некорректные значения считаются
   * нулём.
   */
  readonly delay = input(0);

  /**
   * Дополнительный CSS-класс для хост-элемента `<ngx-buffering-indicator>`.
   *
   * Класс вешается на хост, поэтому потребитель может стилизовать компонент
   * обычными scoped-стилями своего компонента — без `::ng-deep` и без
   * глобальных стилей. CSS-переменные с хоста наследуются внутрь.
   */
  readonly customClass = input('');

  /** Виден ли индикатор с учётом задержки появления. */
  protected readonly visible = this.show.asReadonly();

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
