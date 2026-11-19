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
  DASH_ABR_AUTO_SWITCH_OFF,
  DASH_ABR_AUTO_SWITCH_ON,
  DASH_ERROR_MESSAGES,
  DASH_EVENT_ERROR,
  DASH_EVENT_PLAYBACK_NOT_ALLOWED,
  DASH_EVENT_QUALITY_CHANGE_RENDERED,
  DASH_EVENT_STREAM_INITIALIZED,
  DASH_MEDIA_TYPE_VIDEO,
} from './constants';
import type {
  DashHandler,
  DashLevelViewInterface,
  DashModuleInterface,
  DashPlayerInterface,
  DashQualityChangeEventInterface,
} from './interfaces';
import {
  findDashLevelById,
  findDashLevelByRepresentation,
  mapDashError,
  mapDashLevels,
} from './utils';

/**
 * Подключает DASH-манифест к `<video>`.
 *
 * Директива работает вместе с `ngxVideo`, но не требует его: она только
 * доставляет поток в медиа-элемент и отдаёт уровни качества. Состоянием плеера
 * по-прежнему владеет `VideoService`; `play()`, `seek()` и другие команды
 * директива не вызывает.
 *
 * В браузере динамически импортируется `dashjs` (MSE-only). Если `MediaSource`
 * нет или `dashjs.supportsMediaSource()` вернул `false`, нативного фолбэка нет:
 * эмитится `error` с кодом `source-not-supported`.
 *
 * @example
 * ```html
 * <video
 *   ngxVideo
 *   [ngxDashSource]="src"
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
  selector: '[ngxDashSource]',
})
export class DashSourceDirective {
  /** URL DASH-манифеста; `null` или пустая строка выгружают поток. */
  readonly ngxDashSource = input<string | null>(null);

  /** Запускать воспроизведение после инициализации потока. */
  readonly autoplay = input(false);

  /** Включает источник: `false` уничтожает player и очищает `<video>`. */
  readonly enabled = input(true);

  /** `id` уровня из `QualityInterface`; `null` — автоматический выбор. */
  readonly level = input<string | null>(null);

  /** Доступные уровни после `STREAM_INITIALIZED`, без «auto». */
  readonly levelsChange = output<readonly QualityInterface[]>();

  /** Фактически выбранный уровень; `null` означает автоматический выбор. */
  readonly levelChange = output<QualityInterface | null>();

  /** Фатальная ошибка dash.js, неподдерживаемый браузер или блокировка autoplay. */
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
  private player: DashPlayerInterface | null = null;
  private levels: readonly DashLevelViewInterface[] = [];

  /** Текущий выбор уровня управляется ABR, а не входом `level`. */
  private autoQuality = true;

  /** Защита от дублей `playback-blocked` при одновременном отказе и событии. */
  private playbackBlockedEmitted = false;

  constructor() {
    effect(() => {
      const url = this.ngxDashSource()?.trim() || null;
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

  /** Полностью пересоздаёт источник под текущие `ngxDashSource` и `enabled`. */
  private async reload(url: string | null, enabled: boolean): Promise<void> {
    const generation = ++this.generation;

    this.disposePlayer();
    this.resetLevels();
    this.clearSource();
    this.playbackBlockedEmitted = false;

    if (!enabled || url === null) {
      return;
    }

    const video = this.host.nativeElement;

    // DASH играется только через MSE: нативного fallback в браузерах нет,
    // поэтому библиотеку даже не скачиваем, если MediaSource недоступен.
    if (!this.hasMediaSource()) {
      this.fail('source-not-supported');
      return;
    }

    let module: DashModuleInterface;

    try {
      module = (await import('dashjs')) as unknown as DashModuleInterface;
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

    // Форма экспорта проверена по dashjs 5.x: нужные сущности есть и в
    // named-экспортах, и в `default`; поддержаны оба варианта.
    const factory = module.MediaPlayer ?? module.default?.MediaPlayer;
    const supportsMediaSource =
      module.supportsMediaSource ?? module.default?.supportsMediaSource;

    if (!factory || !supportsMediaSource || !supportsMediaSource()) {
      this.fail('source-not-supported');
      return;
    }

    const player = factory().create();

    this.player = player;
    this.autoQuality = true;
    this.bindEvents(player);

    try {
      // autoplay выключен: запуском управляет только `video.play()`.
      player.initialize(video, url, false);
    } catch (cause) {
      if (this.isStale(generation)) {
        return;
      }

      this.disposePlayer();
      this.fail('unknown', cause);
    }
  }

  /** Есть ли в браузере MediaSource Extensions. */
  private hasMediaSource(): boolean {
    return typeof MediaSource !== 'undefined';
  }

  /** Подписывает директиву на события экземпляра dash.js. */
  private bindEvents(player: DashPlayerInterface): void {
    player.on(DASH_EVENT_STREAM_INITIALIZED, this.onStreamInitialized);
    player.on(DASH_EVENT_QUALITY_CHANGE_RENDERED, this.onQualityChange);
    player.on(DASH_EVENT_ERROR, this.onDashError);
    player.on(DASH_EVENT_PLAYBACK_NOT_ALLOWED, this.onPlaybackNotAllowed);
  }

  /** Уровни готовы: эмитит `levelsChange`, применяет `level` и `autoplay`. */
  private readonly onStreamInitialized: DashHandler = (): void => {
    const player = this.player;

    if (this.destroyed || !player) {
      return;
    }

    const representations = player.getRepresentationsByType(
      DASH_MEDIA_TYPE_VIDEO,
    );

    this.levels = mapDashLevels(representations);
    this.levelsChange.emit(this.levels.map((level) => level.quality));

    this.applyLevel(untracked(() => this.level()));

    if (untracked(() => this.autoplay())) {
      void this.playSafely(this.host.nativeElement, this.generation);
    }
  };

  /** Фактический уровень сменился: эмитит `levelChange` или `null` для auto. */
  private readonly onQualityChange: DashHandler = (event): void => {
    const data = event as DashQualityChangeEventInterface | null;

    if (this.destroyed || !this.player) {
      return;
    }

    if (!data || data.mediaType !== DASH_MEDIA_TYPE_VIDEO) {
      return;
    }

    // В auto-режиме dash.js тоже возвращает конкретное представление, поэтому
    // автоматический выбор определяется по собственному флагу, а не по этому
    // событию.
    const level = findDashLevelByRepresentation(
      this.levels,
      data.newRepresentation,
    );

    if (!level) {
      return;
    }

    this.levelChange.emit(this.autoQuality ? null : level.quality);
  };

  /** Ошибка dash.js: нефатальные игнорируются, терминальные уходят в `error`. */
  private readonly onDashError: DashHandler = (event): void => {
    if (this.destroyed) {
      return;
    }

    const error = mapDashError(event);

    if (error) {
      this.error.emit(error);
    }
  };

  /** dash.js сообщил, что браузер запретил запуск: эмитит `playback-blocked`. */
  private readonly onPlaybackNotAllowed: DashHandler = (event): void => {
    if (this.destroyed) {
      return;
    }

    this.emitPlaybackBlocked(event);
  };

  /** Находит уровень по `id` и выставляет его; `null` включает auto. */
  private applyLevel(id: string | null): void {
    const player = this.player;

    if (!player || this.levels.length === 0) {
      return;
    }

    if (id === null) {
      this.autoQuality = true;
      player.updateSettings(DASH_ABR_AUTO_SWITCH_ON);
      return;
    }

    const level = findDashLevelById(this.levels, id);

    if (!level) {
      return;
    }

    this.autoQuality = false;
    // Сначала выключаем ABR, иначе он перебьёт ручной выбор на следующем
    // сегменте.
    player.updateSettings(DASH_ABR_AUTO_SWITCH_OFF);
    player.setRepresentationForTypeByIndex(
      DASH_MEDIA_TYPE_VIDEO,
      level.qualityIndex,
    );
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
        this.emitPlaybackBlocked(cause);
        return;
      }

      this.fail('unknown', cause);
    }
  }

  /** Эмитит `playback-blocked` один раз на источник и попытку autoplay. */
  private emitPlaybackBlocked(cause?: unknown): void {
    if (this.playbackBlockedEmitted) {
      return;
    }

    this.playbackBlockedEmitted = true;
    this.fail('playback-blocked', cause);
  }

  /** Сбрасывает уровни: выходы получают пустой список и auto. */
  private resetLevels(): void {
    this.autoQuality = true;

    if (this.levels.length === 0) {
      return;
    }

    this.levels = [];
    this.levelsChange.emit([]);
    this.levelChange.emit(null);
  }

  /** Снимает слушатели и уничтожает текущий экземпляр dash.js. */
  private disposePlayer(): void {
    const player = this.player;

    if (!player) {
      return;
    }

    this.player = null;

    player.off(DASH_EVENT_STREAM_INITIALIZED, this.onStreamInitialized);
    player.off(DASH_EVENT_QUALITY_CHANGE_RENDERED, this.onQualityChange);
    player.off(DASH_EVENT_ERROR, this.onDashError);
    player.off(DASH_EVENT_PLAYBACK_NOT_ALLOWED, this.onPlaybackNotAllowed);

    try {
      player.reset();
    } catch {
      // Player мог не успеть инициализироваться; destroy всё равно нужен.
    }

    try {
      player.destroy();
    } catch {
      // Уничтожение не должно ломать очистку директивы.
    }
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

  /** Эмитит ошибку с готовым сообщением. */
  private fail(code: VideoErrorCode, cause?: unknown): void {
    this.error.emit({ code, message: DASH_ERROR_MESSAGES[code], cause });
  }

  /** Проверяет, что асинхронный шаг всё ещё актуален. */
  private isStale(generation: number): boolean {
    return this.destroyed || generation !== this.generation;
  }

  /** Освобождает ресурсы; после destroy никаких эмитов и работы с DOM нет. */
  private destroy(): void {
    this.destroyed = true;
    this.generation += 1;
    this.disposePlayer();
    this.levels = [];
  }
}
