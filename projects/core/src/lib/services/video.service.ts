import { isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';
import { VideoErrorCode } from '../types';
import { VideoState } from '../types';
import { VideoError } from '../interfaces';
import { ERROR_MESSAGES } from './constants';
import { bufferedEnd, normalizeError, resolveState } from './utils';

/**
 * Единственный источник правды о состоянии медиа-элемента.
 *
 * Сервис оборачивает `<video>`, слушает его нативные события и отдаёт состояние
 * в двух представлениях (гибридный API):
 *
 * - **сигналы** — `time`, `state`, `volume`, … — для шаблонов без `AsyncPipe`;
 * - **Observable** — `time$`, `state$`, `volume$`, … — для RxJS-операторов.
 *
 * Источник правды — сигналы; Observable получаются из них через `toObservable()`,
 * поэтому оба представления всегда согласованы.
 *
 * @example
 * ```typescript
 * @Component({
 *   imports: [VideoDirective],
 *   template: `
 *     <video ngxVideo [src]="src" (click)="video.toggle()"></video>
 *     <button (click)="video.toggle()">{{ video.isPlaying() ? 'Пауза' : 'Играть' }}</button>
 *     <span>{{ video.time() }}</span>
 *   `,
 * })
 * export class PlayerComponent {
 *   readonly video = inject(VideoService);
 * }
 * ```
 *
 * @remarks
 * По умолчанию сервис доступен в корне (`providedIn: 'root'`) — этого достаточно
 * для одного плеера. Если плееров несколько, добавьте `providers: [VideoService]`
 * в компонент каждого плеера: директива внутри его шаблона получит локальный
 * экземпляр, и состояния плееров не будут смешиваться.
 */
@Injectable({ providedIn: 'root' })
export class VideoService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _time = signal(0);
  private readonly _duration = signal(0);
  private readonly _state = signal<VideoState>('idle');
  private readonly _volume = signal(1);
  private readonly _muted = signal(false);
  private readonly _playbackRate = signal(1);
  private readonly _buffered = signal(0);
  private readonly _fullscreen = signal(false);
  private readonly _error = signal<VideoError | null>(null);

  private element: HTMLVideoElement | null = null;
  private listeners: AbortController | null = null;

  /** Текущая позиция в секундах. */
  readonly time = this._time.asReadonly();
  /** Длительность в секундах (`0`, пока метаданные не загружены). */
  readonly duration = this._duration.asReadonly();
  /** Текущее состояние плеера. */
  readonly state = this._state.asReadonly();
  /** Громкость от `0` до `1`. */
  readonly volume = this._volume.asReadonly();
  /** Флаг «звук выключен». */
  readonly muted = this._muted.asReadonly();
  /** Скорость воспроизведения (`1` — обычная). */
  readonly playbackRate = this._playbackRate.asReadonly();
  /** Конец буферизованного диапазона, содержащего текущую позицию, в секундах. */
  readonly buffered = this._buffered.asReadonly();
  /** Флаг полноэкранного режима. */
  readonly fullscreen = this._fullscreen.asReadonly();
  /** Последняя ошибка или `null`. */
  readonly error = this._error.asReadonly();

  /** Прогресс воспроизведения от `0` до `1`. */
  readonly progress = computed(() => {
    const duration = this._duration();
    return duration > 0 ? Math.min(this._time() / duration, 1) : 0;
  });

  /** Идёт ли воспроизведение прямо сейчас. */
  readonly isPlaying = computed(() => this._state() === 'playing');

  /** Есть ли активная ошибка. */
  readonly hasError = computed(() => this._error() !== null);

  /** RxJS-представление позиции. */
  readonly time$: Observable<number> = toObservable(this.time);
  /** RxJS-представление длительности. */
  readonly duration$: Observable<number> = toObservable(this.duration);
  /** RxJS-представление состояния. */
  readonly state$: Observable<VideoState> = toObservable(this.state);
  /** RxJS-представление громкости. */
  readonly volume$: Observable<number> = toObservable(this.volume);
  /** RxJS-представление флага «звук выключен». */
  readonly muted$: Observable<boolean> = toObservable(this.muted);
  /** RxJS-представление скорости воспроизведения. */
  readonly playbackRate$: Observable<number> = toObservable(this.playbackRate);
  /** RxJS-представление буфера. */
  readonly buffered$: Observable<number> = toObservable(this.buffered);
  /** RxJS-представление полноэкранного режима. */
  readonly fullscreen$: Observable<boolean> = toObservable(this.fullscreen);
  /** RxJS-представление ошибки. */
  readonly error$: Observable<VideoError | null> = toObservable(this.error);

  /**
   * Привязывает сервис к `<video>`.
   *
   * Вызывается директивой `VideoDirective`; вручную нужен только при
   * использовании сервиса без директивы. Повторный вызов с тем же элементом
   * игнорируется, с другим — перепривязывает сервис.
   */
  connect(element: HTMLVideoElement): void {
    if (this.element === element) {
      return;
    }

    this.disconnect();
    this.element = element;

    if (!this.isBrowser) {
      return;
    }

    this.bind(element);
    this.sync(element);
  }

  /**
   * Отвязывает сервис от элемента: снимает слушатели и сбрасывает состояние.
   *
   * Сам элемент из DOM не удаляется — это ответственность Angular.
   */
  disconnect(): void {
    this.listeners?.abort();
    this.listeners = null;

    if (!this.element) {
      return;
    }

    this.element = null;
    this.reset();
  }

  /**
   * Запускает воспроизведение.
   *
   * Не бросает исключений: отказ браузера (автоплей, прерывание) превращается
   * в `VideoError` с кодом `playback-blocked` либо игнорируется, если
   * воспроизведение было прервано другим действием.
   */
  async play(): Promise<void> {
    const element = this.element;
    if (!element) {
      return;
    }

    try {
      await element.play();
    } catch (cause) {
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

  /** Останавливает воспроизведение. */
  pause(): void {
    this.element?.pause();
  }

  /** Переключает воспроизведение: играет — ставит на паузу, иначе запускает. */
  toggle(): void {
    const element = this.element;
    if (!element) {
      return;
    }

    if (element.paused) {
      void this.play();
      return;
    }

    this.pause();
  }

  /** Перематывает на абсолютную позицию в секундах (обрезается по границам). */
  seek(time: number): void {
    const element = this.element;
    if (!element || !Number.isFinite(time)) {
      return;
    }

    const duration = element.duration;
    const target =
      Number.isFinite(duration) && duration > 0
        ? Math.min(Math.max(time, 0), duration)
        : Math.max(time, 0);

    try {
      element.currentTime = target;
    } catch {
      // Элемент ещё не готов к перемотке — состояние обновится по событию.
      return;
    }

    this._time.set(target);
  }

  /** Перематывает на смещение относительно текущей позиции (может быть отрицательным). */
  seekBy(delta: number): void {
    const element = this.element;
    if (!element || !Number.isFinite(delta)) {
      return;
    }

    this.seek(element.currentTime + delta);
  }

  /** Устанавливает громкость; значение обрезается до диапазона `0…1`. */
  setVolume(volume: number): void {
    const element = this.element;
    if (!element || !Number.isFinite(volume)) {
      return;
    }

    const next = Math.min(Math.max(volume, 0), 1);
    element.volume = next;
    this._volume.set(next);
  }

  /** Включает или выключает звук. */
  setMuted(muted: boolean): void {
    const element = this.element;
    if (!element) {
      return;
    }

    element.muted = muted;
    this._muted.set(muted);
  }

  /** Переключает звук. */
  toggleMute(): void {
    this.setMuted(!this._muted());
  }

  /** Устанавливает скорость воспроизведения (должна быть больше нуля). */
  setPlaybackRate(rate: number): void {
    const element = this.element;
    if (!element || !Number.isFinite(rate) || rate <= 0) {
      return;
    }

    element.playbackRate = rate;
    this._playbackRate.set(rate);
  }

  /** Запрашивает полноэкранный режим для `<video>`. */
  async requestFullscreen(): Promise<void> {
    const element = this.element;
    if (!element || !this.isBrowser) {
      return;
    }

    try {
      await element.requestFullscreen();
    } catch {
      // Отказ (например, внутри iframe без allowfullscreen) не является ошибкой медиа.
    }
  }

  /** Выходит из полноэкранного режима. */
  async exitFullscreen(): Promise<void> {
    if (!this.isBrowser || !document.fullscreenElement) {
      return;
    }

    try {
      await document.exitFullscreen();
    } catch {
      // Игнорируем: выходить уже некуда.
    }
  }

  /** Переключает полноэкранный режим. */
  async toggleFullscreen(): Promise<void> {
    if (this._fullscreen()) {
      await this.exitFullscreen();
      return;
    }

    await this.requestFullscreen();
  }

  private bind(element: HTMLVideoElement): void {
    const controller = new AbortController();
    this.listeners = controller;
    const signal = controller.signal;

    const on = <K extends keyof HTMLVideoElementEventMap>(
      type: K,
      handler: (event: HTMLVideoElementEventMap[K]) => void,
    ): void => element.addEventListener(type, handler, { signal });

    on('play', () => this._state.set('playing'));
    on('playing', () => this._state.set('playing'));

    on('pause', () => {
      if (this._state() !== 'ended') {
        this._state.set('paused');
      }
    });

    on('ended', () => this._state.set('ended'));
    on('waiting', () => this._state.set('buffering'));

    on('canplay', () => {
      if (this._state() === 'buffering') {
        this._state.set(element.paused ? 'paused' : 'playing');
      }
    });

    on('seeking', () => this._state.set('seeking'));

    on('seeked', () => {
      if (element.ended) {
        this._state.set('ended');
        return;
      }

      this._state.set(element.paused ? 'paused' : 'playing');
    });

    on('timeupdate', () => this._time.set(element.currentTime));

    on('durationchange', () => {
      this._duration.set(
        Number.isFinite(element.duration) ? element.duration : 0,
      );
    });

    on('loadedmetadata', () => {
      this._duration.set(
        Number.isFinite(element.duration) ? element.duration : 0,
      );
      this._time.set(element.currentTime);
      this._state.set(element.paused ? 'paused' : 'playing');
    });

    on('loadstart', () => {
      this._error.set(null);
      this._state.set('idle');
    });

    on('emptied', () => {
      this._time.set(0);
      this._duration.set(0);
      this._buffered.set(0);
      this._state.set('idle');
    });

    on('progress', () => this._buffered.set(bufferedEnd(element)));

    on('volumechange', () => {
      this._volume.set(element.volume);
      this._muted.set(element.muted);
    });

    on('ratechange', () => this._playbackRate.set(element.playbackRate));

    on('error', () => {
      const mediaError = element.error;
      if (!mediaError) {
        this.fail('unknown');
        return;
      }

      this._error.set(normalizeError(mediaError));
      this._state.set('error');
    });

    if (typeof document !== 'undefined') {
      document.addEventListener(
        'fullscreenchange',
        () => this._fullscreen.set(document.fullscreenElement === element),
        { signal },
      );
    }
  }

  private sync(element: HTMLVideoElement): void {
    this._time.set(element.currentTime);
    this._duration.set(
      Number.isFinite(element.duration) ? element.duration : 0,
    );
    this._volume.set(element.volume);
    this._muted.set(element.muted);
    this._playbackRate.set(element.playbackRate);
    this._buffered.set(bufferedEnd(element));
    this._fullscreen.set(
      typeof document !== 'undefined' && document.fullscreenElement === element,
    );

    if (element.error) {
      this._error.set(normalizeError(element.error));
      this._state.set('error');
      return;
    }

    this._state.set(resolveState(element));
  }

  private fail(code: VideoErrorCode, cause?: unknown): void {
    this._error.set({ code, message: ERROR_MESSAGES[code], cause });
    this._state.set('error');
  }

  private reset(): void {
    this._time.set(0);
    this._duration.set(0);
    this._state.set('idle');
    this._volume.set(1);
    this._muted.set(false);
    this._playbackRate.set(1);
    this._buffered.set(0);
    this._fullscreen.set(false);
    this._error.set(null);
  }
}
