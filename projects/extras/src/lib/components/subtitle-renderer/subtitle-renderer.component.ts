import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';

import type { SubtitleCueInterface } from './interfaces';
import { findActiveCues, parseVtt } from './utils';

/**
 * Слой субтитров WebVTT поверх видео.
 *
 * Компонент presentational: получает уже загруженное содержимое `vtt` и
 * текущее время, разбирает дорожку и рисует активные cues простым текстом.
 * Он не скачивает VTT, не управляет дорожками и не знает о `VideoService`.
 *
 * @example
 * ```html
 * <div class="player">
 *   <video ngxVideo [src]="src" playsinline></video>
 *
 *   <ngx-subtitle-renderer
 *     [vtt]="vtt()"
 *     [currentTime]="video.time()"
 *     [enabled]="subtitlesEnabled()"
 *     [customClass]="subtitleClass()"
 *   />
 * </div>
 * ```
 */
@Component({
  selector: 'ngx-subtitle-renderer',
  templateUrl: './subtitle-renderer.component.html',
  styleUrl: './subtitle-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubtitleRendererComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private appliedClasses: readonly string[] = [];

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));
  }

  /**
   * Содержимое WebVTT, а не URL.
   *
   * Пустая строка означает, что субтитров нет. Загрузку по URL, CORS и кэш
   * выполняет родитель.
   */
  readonly vtt = input('');

  /** Текущая позиция в секундах; `start <= currentTime < end`. */
  readonly currentTime = input.required<number>();

  /** Показывать ли субтитры. При `false` cues удаляются из DOM. */
  readonly enabled = input(true);

  /** Дополнительный CSS-класс для хост-элемента `<ngx-subtitle-renderer>`. */
  readonly customClass = input('');

  /** Разобранные cues; пересчитываются только при изменении `vtt`. */
  private readonly cues = computed(() => parseVtt(this.vtt()));

  /** Cues, активные в текущий момент; при `enabled = false` — пусто. */
  protected readonly activeCues = computed<readonly SubtitleCueInterface[]>(
    () =>
      this.enabled() ? findActiveCues(this.cues(), this.currentTime()) : [],
  );

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
