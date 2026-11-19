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

import type { ClickToPlayOverlayIconContext } from './interfaces';

/**
 * Прозрачный слой поверх видео с большой кнопкой Play.
 *
 * Нужен, чтобы обойти ограничения автоплея: первый запуск происходит по жесту
 * пользователя. Компонент не управляет медиа-элементом, а только сообщает
 * наружу о клике через выход `play`.
 *
 * Оверлей существует в DOM только в состояниях `idle` и `paused`; в остальных
 * состояниях кнопка не рендерится, а пустой хост не перехватывает клики.
 *
 * @example
 * ```html
 * <div class="player">
 *   <video ngxVideo [src]="src" (click)="video.pause()"></video>
 *
 *   <ngx-click-to-play-overlay
 *     [state]="video.state()"
 *     (play)="video.play()"
 *   />
 * </div>
 * ```
 */
@Component({
  selector: 'ngx-click-to-play-overlay',
  imports: [NgTemplateOutlet],
  templateUrl: './click-to-play-overlay.component.html',
  styleUrl: './click-to-play-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClickToPlayOverlayComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private appliedClasses: readonly string[] = [];

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));
  }

  /** Текущее состояние плеера: по нему вычисляется видимость оверлея. */
  readonly state = input.required<VideoState>();

  /**
   * Дополнительный CSS-класс для хост-элемента
   * `<ngx-click-to-play-overlay>`.
   *
   * Класс вешается на хост, поэтому потребитель может переопределять
   * CSS-переменные обычными scoped-стилями своего компонента.
   */
  readonly customClass = input('');

  /** Переопределение `aria-label`; по умолчанию «Воспроизвести видео». */
  readonly ariaLabel = input<string | null>(null);

  /** Пользовательская иконка вместо стандартной SVG-иконки Play. */
  readonly iconTemplate =
    input<TemplateRef<ClickToPlayOverlayIconContext> | null>(null);

  /**
   * Клик по оверлею: решение о запуске принимает родитель.
   *
   * Имя `play` зафиксировано публичным контрактом, поэтому правило
   * `no-output-native` отключено точечно: нативное событие `play` относится
   * к медиа-элементам, а не к кастомному элементу оверлея.
   */
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly play = output<void>();

  /** Оверлей виден только до первого запуска и на паузе. */
  protected readonly visible = computed(() => {
    const state = this.state();
    return state === 'idle' || state === 'paused';
  });

  protected readonly label = computed(
    () => this.ariaLabel() ?? 'Воспроизвести видео',
  );

  protected readonly iconContext = computed<ClickToPlayOverlayIconContext>(
    () => ({ state: this.state() }),
  );

  protected onClick(): void {
    this.play.emit();
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
