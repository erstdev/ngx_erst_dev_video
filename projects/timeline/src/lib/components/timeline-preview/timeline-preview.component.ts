import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { formatTime } from '@erst_dev/ngx-video-core';

import { waitForMetadata, waitForSeek } from './utils';

/**
 * Превью кадра для таймлайна.
 *
 * Компонент презентационный: он получает время и источник, а кадр достаёт
 * через отдельный скрытый `<video>` и рисует в `<canvas>`. Основной `<video>`
 * плеера не трогается, поэтому наведение на таймлайн не сбивает playback.
 *
 * Скрытое видео создаётся лениво при первом запросе и полностью освобождается
 * при `enabled = false` или уничтожении компонента.
 *
 * @example
 * ```html
 * <ngx-timeline-preview [time]="time" [src]="src" />
 * ```
 */
@Component({
  selector: 'ngx-timeline-preview',
  templateUrl: './timeline-preview.component.html',
  styleUrl: './timeline-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelinePreviewComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private appliedClasses: readonly string[] = [];

  private video: HTMLVideoElement | null = null;
  private videoSrc: string | null = null;
  private generation = 0;
  private pendingTime: number | null = null;
  private seeking = false;
  private lastRequested = Number.NaN;
  private destroyed = false;

  private readonly canvasRef =
    viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  /** Время, для которого нужно показать кадр, в секундах. */
  readonly time = input.required<number>();

  /** Источник видео; обычно тот же `src`, что у основного плеера. */
  readonly src = input.required<string>();

  /**
   * Включает превью. При `false` компонент ничего не рендерит и не создаёт
   * скрытое видео — это способ отключить лишнюю нагрузку.
   */
  readonly enabled = input(true);

  /**
   * Необязательный лёгкий источник для превью (например, низкобитрейтный
   * прокси). Если не задан, используется `src`.
   */
  readonly previewSrc = input<string | null>(null);

  /**
   * Дополнительный CSS-класс для хост-элемента `<ngx-timeline-preview>`.
   *
   * Класс вешается на хост, поэтому потребитель может стилизовать компонент
   * обычными scoped-стилями своего компонента — без `::ng-deep`.
   */
  readonly customClass = input('');

  /** Получен ли хотя бы один кадр; до этого показываем заглушку со временем. */
  protected readonly hasFrame = signal(false);

  /** Время в формате `мм:сс` / `ч:мм:сс` для подписи. */
  protected readonly timeText = computed(() => formatTime(this.time()));

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));

    effect(() => {
      const enabled = this.enabled();
      const src = this.previewSrc() ?? this.src();
      const time = this.time();
      const canvas = this.canvasRef()?.nativeElement;

      if (!this.isBrowser) {
        return;
      }

      if (!enabled || !canvas) {
        if (!enabled) {
          this.releaseVideo();
        }
        return;
      }

      if (!Number.isFinite(time) || time < 0) {
        return;
      }

      this.requestFrame(src, time);
    });

    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.releaseVideo();
    });
  }

  /** Планирует получение кадра, не запуская параллельные seek. */
  private requestFrame(src: string, time: number): void {
    this.ensureVideo(src);

    if (!this.video) {
      return;
    }

    if (this.hasFrame() && Math.abs(time - this.lastRequested) < 0.2) {
      return;
    }

    this.pendingTime = time;

    if (!this.seeking) {
      void this.processPending();
    }
  }

  /** Создаёт или переиспользует скрытое видео для указанного источника. */
  private ensureVideo(src: string): void {
    if (this.video && this.videoSrc === src) {
      return;
    }

    this.releaseVideo();
    this.generation += 1;

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = src;

    /*
     * Видео не должно влиять на layout и попадать в дерево доступности.
     * Инлайновые стили нужны потому, что элемент создан вне шаблона Angular
     * и не получает атрибут инкапсуляции компонента.
     */
    Object.assign(video.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      opacity: '0',
      pointerEvents: 'none',
      left: '0',
      top: '0',
    });

    this.host.nativeElement.appendChild(video);
    this.video = video;
    this.videoSrc = src;
    video.load();
  }

  /** Останавливает и полностью освобождает скрытое видео. */
  private releaseVideo(): void {
    this.generation += 1;
    this.pendingTime = null;
    this.seeking = false;
    this.lastRequested = Number.NaN;

    const video = this.video;
    this.video = null;
    this.videoSrc = null;

    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
    }

    this.hasFrame.set(false);
  }

  /** Выполняет последний запрошенный seek и рисует кадр. */
  private async processPending(): Promise<void> {
    const video = this.video;
    const target = this.pendingTime;

    if (!video || target === null || this.seeking || this.destroyed) {
      return;
    }

    const generation = this.generation;
    this.pendingTime = null;
    this.seeking = true;

    try {
      await waitForMetadata(video);

      if (!this.isCurrent(generation)) {
        return;
      }

      if (Math.abs(video.currentTime - target) > 0.05) {
        video.currentTime = target;
        await waitForSeek(video);
      }

      if (!this.isCurrent(generation) || video.readyState < 2) {
        return;
      }

      this.draw(video);
      this.lastRequested = target;
    } finally {
      this.seeking = false;

      if (
        this.pendingTime !== null &&
        this.isCurrent(generation) &&
        !this.destroyed
      ) {
        void this.processPending();
      }
    }
  }

  /** Актуален ли ещё текущий источник/поколение. */
  private isCurrent(generation: number): boolean {
    return (
      !this.destroyed &&
      this.enabled() &&
      generation === this.generation &&
      this.video !== null
    );
  }

  /** Рисует текущий кадр видео в canvas с сохранением пропорций. */
  private draw(video: HTMLVideoElement): void {
    const canvas = this.canvasRef()?.nativeElement;
    const context = canvas?.getContext('2d');

    if (!canvas || !context || !video.videoWidth || !video.videoHeight) {
      this.hasFrame.set(false);
      return;
    }

    const scale = Math.min(
      canvas.width / video.videoWidth,
      canvas.height / video.videoHeight,
    );
    const width = video.videoWidth * scale;
    const height = video.videoHeight * scale;
    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;

    try {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(video, x, y, width, height);
      this.hasFrame.set(true);
    } catch {
      // Например, DRM/защищённый источник: остаётся заглушка со временем.
      this.hasFrame.set(false);
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
