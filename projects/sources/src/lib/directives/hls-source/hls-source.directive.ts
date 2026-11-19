import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  input,
  output,
  untracked,
} from '@angular/core';
import type {
  QualityInterface,
  VideoError,
  VideoErrorCode,
} from '@erst_dev/ngx-video-core';

import {
  HLS_AUTO_LEVEL,
  HLS_ERROR_MESSAGES,
  HLS_EVENT_ERROR,
  HLS_EVENT_LEVEL_SWITCHED,
  HLS_EVENT_MANIFEST_PARSED,
  HLS_NATIVE_MIME_TYPE,
} from './constants';
import type { HlsConstructor, HlsHandler, HlsInstance } from './interfaces';
import { mapHlsError, mapHlsLevels } from './utils';

/**
 * Подключает HLS-манифест к `<video>`.
 *
 * Директива работает вместе с `ngxVideo`, но не требует его: она только
 * доставляет поток в медиа-элемент и отдаёт уровни качества. Состоянием плеера
 * по-прежнему владеет `VideoService`; `play()`, `seek()` и другие команды
 * директива не вызывает.
 *
 * В браузере с MSE поток грузит `hls.js` (динамический импорт) — так доступны
 * уровни качества. Без MSE (iOS Safari) `hls.js` не загружается: URL
 * выставляется прямо в `video.src`; тот же фолбэк используется, если
 * `Hls.isSupported()` вернул `false`. Когда не работает ни то, ни другое,
 * эмитится `error` с кодом `source-not-supported`.
 *
 * @example
 * ```html
 * <video
 *   ngxVideo
 *   [ngxHlsSource]="src"
 *   [autoplay]="false"
 *   [enabled]="true"
 *   [level]="level()"
 *   (levelsChange)="onLevelsChange($event)"
 *   (levelChange)="onLevelChange($event)"
 *   (error)="onError($event)"
 * ></video>
 * ```
 */
@Directive({
  selector: '[ngxHlsSource]',
})
export class HlsSourceDirective {
  /** URL HLS-манифеста; `null` или пустая строка выгружают поток. */
  readonly ngxHlsSource = input<string | null>(null);

  /** Запускать воспроизведение после успешного разбора манифеста. */
  readonly autoplay = input(false);

  /** Включает источник: `false` уничтожает hls.js и очищает `<video>`. */
  readonly enabled = input(true);

  /** `id` уровня из `QualityInterface`; `null` — автоматический выбор. */
  readonly level = input<string | null>(null);

  /** Доступные уровни после разбора манифеста, без «auto». */
  readonly levelsChange = output<readonly QualityInterface[]>();

  /** Фактически выбранный уровень; `null` означает автоматический выбор. */
  readonly levelChange = output<QualityInterface | null>();

  /** Фатальная ошибка hls.js, неподдерживаемый браузер или блокировка autoplay. */
  // Имя входа задано публичным API пакета: это не DOM-событие `error`,
  // а выход директивы. Правило про нативные имена здесь неприменимо.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly error = output<VideoError>();

  private readonly host = inject<ElementRef<HTMLVideoElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Поколение источника: отсекает результаты устаревших асинхронных шагов. */
  private generation = 0;

  private destroyed = false;
  private hls: HlsInstance | null = null;
  private levels: readonly QualityInterface[] = [];

  constructor() {
    effect(() => {
      const url = this.ngxHlsSource()?.trim() || null;
      const enabled = this.enabled();

      if (!this.isBrowser) {
        return;
      }

      void this.reload(url, enabled);
    });

    effect(() => {
      this.applyLevel(this.level());
    });

    this.destroyRef.onDestroy(() => this.destroy());
  }

  /** Полностью пересоздаёт источник под текущие `ngxHlsSource` и `enabled`. */
  private async reload(url: string | null, enabled: boolean): Promise<void> {
    const generation = ++this.generation;

    this.disposeHls();
    this.resetLevels();
    this.clearSource();

    if (!enabled || url === null) {
      return;
    }

    const video = this.host.nativeElement;

    // Без MediaSource hls.js работать не может: iOS Safari играет HLS сам,
    // и библиотеку в этом случае даже не скачиваем.
    if (!this.hasMediaSource()) {
      this.loadNative(video, url, generation);
      return;
    }

    let HlsClass: HlsConstructor;

    try {
      const module = await import('hls.js');
      HlsClass = module.default as unknown as HlsConstructor;
    } catch (cause) {
      if (this.isStale(generation)) {
        return;
      }

      this.fail('source-not-supported', cause);
      return;
    }

    if (this.isStale(generation)) {
      return;
    }

    // hls.js не осилил поток, но браузер умеет HLS сам — отдаём ему.
    if (!HlsClass.isSupported()) {
      if (this.canPlayNative(video)) {
        this.loadNative(video, url, generation);
        return;
      }

      this.fail('source-not-supported');
      return;
    }

    const hls = new HlsClass();

    this.hls = hls;
    this.bindEvents(hls);

    hls.attachMedia(video);
    hls.loadSource(url);
  }

  /** Отдаёт поток браузеру: `video.src` и, при `autoplay`, запуск. */
  private loadNative(
    video: HTMLVideoElement,
    url: string,
    generation: number,
  ): void {
    video.src = url;

    if (untracked(() => this.autoplay())) {
      void this.playSafely(video, generation);
    }
  }

  /** Есть ли в браузере MediaSource Extensions. */
  private hasMediaSource(): boolean {
    return typeof MediaSource !== 'undefined';
  }

  /** Подписывает директиву на события экземпляра hls.js. */
  private bindEvents(hls: HlsInstance): void {
    hls.on(HLS_EVENT_MANIFEST_PARSED, this.onManifestParsed);
    hls.on(HLS_EVENT_LEVEL_SWITCHED, this.onLevelSwitched);
    hls.on(HLS_EVENT_ERROR, this.onHlsError);
  }

  /** Уровни готовы: эмитит `levelsChange`, применяет `level` и `autoplay`. */
  private readonly onManifestParsed: HlsHandler = (): void => {
    const hls = this.hls;

    if (this.destroyed || !hls) {
      return;
    }

    this.levels = mapHlsLevels(hls.levels);
    this.levelsChange.emit(this.levels);

    this.applyLevel(untracked(() => this.level()));

    if (untracked(() => this.autoplay())) {
      void this.playSafely(this.host.nativeElement, this.generation);
    }
  };

  /** Фактический уровень сменился: эмитит `levelChange` или `null` для auto. */
  private readonly onLevelSwitched: HlsHandler = (): void => {
    const hls = this.hls;

    if (this.destroyed || !hls) {
      return;
    }

    // `currentLevel` в auto-режиме показывает играющий вариант, поэтому
    // автоматический выбор определяется по `manualLevel === -1`.
    const index = hls.manualLevel;
    const level = this.levels[index];

    this.levelChange.emit(index < 0 ? null : (level ?? null));
  };

  /** Ошибка hls.js: нефатальные игнорируются, фатальные уходят в `error`. */
  private readonly onHlsError: HlsHandler = (_event, data): void => {
    if (this.destroyed) {
      return;
    }

    const error = mapHlsError(data);

    if (error) {
      this.error.emit(error);
    }
  };

  /** Находит уровень по `id` и выставляет его; `null` включает auto. */
  private applyLevel(id: string | null): void {
    const hls = this.hls;

    if (!hls) {
      return;
    }

    if (id === null) {
      hls.currentLevel = HLS_AUTO_LEVEL;
      return;
    }

    const index = this.levels.findIndex((level) => level.id === id);

    if (index < 0) {
      return;
    }

    hls.currentLevel = index;
  }

  /** Запускает воспроизведение и переводит отказ браузера в `VideoError`. */
  private async playSafely(
    video: HTMLVideoElement,
    generation: number,
  ): Promise<void> {
    try {
      await video.play();
    } catch (cause) {
      if (this.isStale(generation)) {
        return;
      }

      if (cause instanceof DOMException && cause.name === 'AbortError') {
        // Воспроизведение прервали (pause/seek) — это не ошибка.
        return;
      }

      if (cause instanceof DOMException && cause.name === 'NotAllowedError') {
        this.fail('playback-blocked', cause);
        return;
      }

      this.fail('unknown', cause);
    }
  }

  /** Сбрасывает уровни: выходы получают пустой список и auto. */
  private resetLevels(): void {
    if (this.levels.length === 0) {
      return;
    }

    this.levels = [];
    this.levelsChange.emit([]);
    this.levelChange.emit(null);
  }

  /** Снимает слушатели и уничтожает текущий экземпляр hls.js. */
  private disposeHls(): void {
    const hls = this.hls;

    if (!hls) {
      return;
    }

    this.hls = null;

    hls.off(HLS_EVENT_MANIFEST_PARSED, this.onManifestParsed);
    hls.off(HLS_EVENT_LEVEL_SWITCHED, this.onLevelSwitched);
    hls.off(HLS_EVENT_ERROR, this.onHlsError);
    hls.destroy();
  }

  /** Убирает `src` и сбрасывает медиа-элемент. */
  private clearSource(): void {
    const video = this.host.nativeElement;

    if (!video.hasAttribute('src')) {
      return;
    }

    video.removeAttribute('src');
    video.load();
  }

  /** Умеет ли браузер играть HLS без hls.js. */
  private canPlayNative(video: HTMLVideoElement): boolean {
    return video.canPlayType(HLS_NATIVE_MIME_TYPE) !== '';
  }

  /** Эмитит ошибку с готовым сообщением. */
  private fail(code: VideoErrorCode, cause?: unknown): void {
    this.error.emit({ code, message: HLS_ERROR_MESSAGES[code], cause });
  }

  /** Проверяет, что асинхронный шаг всё ещё актуален. */
  private isStale(generation: number): boolean {
    return this.destroyed || generation !== this.generation;
  }

  /** Освобождает ресурсы; после destroy никаких эмитов и работы с DOM нет. */
  private destroy(): void {
    this.destroyed = true;
    this.generation += 1;
    this.disposeHls();
    this.levels = [];
  }
}
