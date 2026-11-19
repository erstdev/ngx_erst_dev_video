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
import { formatTime } from '@erst_dev/ngx-video-core';

import { chapterLabel } from './utils';
import type { ChapterInterface } from './interfaces';
import type { ChapterMarkerView } from './interfaces/chapter-marker-view.interface';

/**
 * Метки глав поверх таймлайна.
 *
 * Компонент принимает список глав и длительность, рисует кнопки-маркеры и
 * сообщает наружу, какую главу выбрали. Он не вызывает `video.seek()`:
 * перемотку применяет родитель.
 *
 * @example
 * ```html
 * <ngx-chapter-markers
 *   [chapters]="chapters"
 *   [duration]="video.duration()"
 *   [currentTime]="video.time()"
 *   (chapterSelect)="video.seek($event.time)"
 * />
 * ```
 */
@Component({
  selector: 'ngx-chapter-markers',
  templateUrl: './chapter-markers.component.html',
  styleUrl: './chapter-markers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChapterMarkersComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private appliedClasses: readonly string[] = [];

  /** Список глав; можно передать пустой массив. */
  readonly chapters = input.required<readonly ChapterInterface[]>();

  /** Длительность видео в секундах: нужна для перевода времени в проценты. */
  readonly duration = input.required<number>();

  /** Текущая позиция в секундах: по ней подсвечивается активная глава. */
  readonly currentTime = input(0);

  /**
   * Дополнительный CSS-класс для хост-элемента `<ngx-chapter-markers>`.
   *
   * Класс вешается на хост, поэтому потребитель может стилизовать компонент
   * обычными scoped-стилями своего компонента — без `::ng-deep`.
   */
  readonly customClass = input('');

  /** Переопределение `aria-label`; по умолчанию «Главы». */
  readonly ariaLabel = input<string | null>(null);

  /** Клик по главе: родитель решает, как применить перемотку. */
  readonly chapterSelect = output<ChapterInterface>();

  /** Валидные главы, отсортированные по времени, с готовыми процентами. */
  private readonly sortedChapters = computed<readonly ChapterMarkerView[]>(
    () => {
      const duration = this.safeDuration();
      if (duration <= 0) {
        return [];
      }

      return [...this.chapters()]
        .filter(
          (chapter) =>
            Number.isFinite(chapter.time) &&
            chapter.time >= 0 &&
            chapter.time <= duration,
        )
        .sort((left, right) => left.time - right.time)
        .map((chapter) => ({
          chapter,
          percent: (chapter.time / duration) * 100,
        }));
    },
  );

  /** Маркеры для шаблона. */
  protected readonly markers = this.sortedChapters;

  /** Активная глава: последняя, начавшаяся не позже `currentTime`. */
  protected readonly activeChapter = computed<ChapterInterface | null>(() => {
    const time = this.currentTime();
    let active: ChapterInterface | null = null;

    for (const marker of this.sortedChapters()) {
      if (marker.chapter.time <= time) {
        active = marker.chapter;
      }
    }

    return active;
  });

  protected readonly label = computed(() => this.ariaLabel() ?? 'Главы');

  /** Форматирование времени главы для шаблона. */
  protected readonly formatTime = formatTime;

  /** Подпись маркера для скринридера. */
  protected readonly chapterLabel = chapterLabel;

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));
  }

  protected isActive(chapter: ChapterInterface): boolean {
    return this.activeChapter() === chapter;
  }

  protected onSelect(chapter: ChapterInterface, event: MouseEvent): void {
    event.stopPropagation();
    this.chapterSelect.emit(chapter);
  }

  private safeDuration(): number {
    const duration = this.duration();
    return Number.isFinite(duration) && duration > 0 ? duration : 0;
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
