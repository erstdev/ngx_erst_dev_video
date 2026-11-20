import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import type { Signal } from '@angular/core';

import { CAPTURE_MIME_CANDIDATES, GIF_MIME_TYPE } from '../constants';
import type {
  CanvasSurfaceInterface,
  CaptureError,
  CaptureFrameOptions,
  CaptureGifOptions,
  ClipRecording,
  GifFrameInterface,
  RecordClipOptions,
  VideoCaptureStreamInterface,
  VideoSizeInterface,
} from '../interfaces';
import type { CaptureFrameType, ClipRecordingState } from '../types';
import {
  createCaptureError,
  delay,
  encodeGif,
  gifDimensions,
  normalizeFrameOptions,
  normalizeGifOptions,
  normalizeRecordOptions,
  scaleDimensions,
  toIndexedPixels,
} from '../utils';

/**
 * Захват кадра, запись фрагмента и GIF из играющего `<video>`.
 *
 * Сервис не управляет плеером: он получает `HTMLVideoElement`, снимает с него
 * данные через Canvas и `MediaRecorder` и отдаёт `Blob` или объект записи.
 * `play()`, `pause()` и `seek()` не вызываются, элементы не меняются, файлы не
 * скачиваются — это задача потребителя.
 *
 * Состояние не хранится: вернул `Blob` — забыл. Единственное живое состояние —
 * `ClipRecording.state`, и оно принадлежит конкретной записи.
 *
 * В браузере без нужных API и на сервере (`SSR`) методы отклоняются с ошибкой
 * `unsupported`; `window`, `document` и `MediaRecorder` не трогаются на верхнем
 * уровне модуля.
 *
 * @example
 * ```ts
 * private readonly videoRef =
 *   viewChild.required<ElementRef<HTMLVideoElement>>('video');
 *
 * protected async shot(): Promise<void> {
 *   const blob = await this.capture.captureFrame(
 *     this.videoRef().nativeElement,
 *     { type: 'image/jpeg', quality: 0.9, maxWidth: 1280 },
 *   );
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CaptureService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Снимает текущий кадр видео в `Blob`.
   *
   * Кадр рисуется в Canvas с сохранением пропорций и не увеличивается: лимиты
   * `maxWidth`/`maxHeight` — максимум, а не цель. `quality` учитывается только
   * для `image/jpeg` и `image/webp`.
   *
   * @throws `CaptureError` с кодом `unsupported`, `no-video` или
   * `canvas-failed`.
   */
  async captureFrame(
    video: HTMLVideoElement,
    options: CaptureFrameOptions = {},
  ): Promise<Blob> {
    this.assertBrowser();

    const size = this.readVideoSize(video);
    const normalized = normalizeFrameOptions(options);
    const target = scaleDimensions(
      size.width,
      size.height,
      normalized.maxWidth,
      normalized.maxHeight,
    );
    const { canvas, context } = this.createSurface(target.width, target.height);

    try {
      context.drawImage(video, 0, 0, target.width, target.height);
    } catch (cause) {
      throw createCaptureError('canvas-failed', cause);
    }

    const quality =
      normalized.type === 'image/png' ? undefined : normalized.quality;

    return this.canvasToBlob(canvas, normalized.type, quality);
  }

  /**
   * Начинает запись фрагмента из текущего состояния видео.
   *
   * Запись стартует сразу и продолжается, пока не вызван `stop()` или
   * `cancel()`. Сервис не запускает видео: если оно на паузе, кадры в записи
   * могут повторяться — это ответственность родителя.
   *
   * @throws `CaptureError` с кодом `unsupported` (нет `MediaRecorder` или
   * `video.captureStream`) или `recording-failed` (неподдержанный `mimeType`,
   * отказ `captureStream()`).
   */
  recordClip(
    video: HTMLVideoElement,
    options: RecordClipOptions = {},
  ): ClipRecording {
    this.assertBrowser();

    if (
      !video ||
      typeof MediaRecorder === 'undefined' ||
      typeof MediaRecorder.isTypeSupported !== 'function'
    ) {
      throw createCaptureError('unsupported');
    }

    const captureStream = (video as VideoCaptureStreamInterface).captureStream;

    if (typeof captureStream !== 'function') {
      throw createCaptureError('unsupported');
    }

    const normalized = normalizeRecordOptions(options);
    const mimeType = this.resolveMimeType(normalized.mimeType);
    let stream: MediaStream;

    try {
      stream = captureStream.call(video);
    } catch (cause) {
      throw createCaptureError('recording-failed', cause);
    }

    let recorder: MediaRecorder;

    try {
      recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: normalized.videoBitsPerSecond,
        audioBitsPerSecond: normalized.audioBitsPerSecond,
      });
    } catch (cause) {
      this.stopTracks(stream);
      throw createCaptureError('recording-failed', cause);
    }

    try {
      return new ClipRecordingHandle(recorder, stream, normalized.timeslice);
    } catch (cause) {
      this.stopTracks(stream);
      throw createCaptureError('recording-failed', cause);
    }
  }

  /**
   * Записывает GIF из текущего состояния видео.
   *
   * Кадры снимаются с заданной частотой в течение `duration`, масштабируются до
   * ширины `width` с сохранением пропорций и кодируются собственным GIF89a
   * энкодером: глобальная палитра 256 цветов 3-3-2, LZW и Netscape loop.
   * Видео при этом не запускается и не перематывается.
   *
   * @throws `CaptureError` с кодом `unsupported`, `no-video`, `canvas-failed`
   * или `gif-failed`.
   */
  async captureGif(
    video: HTMLVideoElement,
    options: CaptureGifOptions = {},
  ): Promise<Blob> {
    this.assertBrowser();

    const size = this.readVideoSize(video);
    const normalized = normalizeGifOptions(options);
    const target = gifDimensions(size.width, size.height, normalized.width);
    const { context } = this.createSurface(target.width, target.height);
    const frameCount = Math.max(
      2,
      Math.round((normalized.duration / 1000) * normalized.fps),
    );
    const interval = 1000 / normalized.fps;
    const frames: GifFrameInterface[] = [];

    for (let index = 0; index < frameCount; index += 1) {
      if (index > 0) {
        await delay(interval);
      }

      frames.push(this.grabGifFrame(context, video, target));
    }

    let bytes: Uint8Array<ArrayBuffer>;

    try {
      bytes = encodeGif(frames, {
        width: target.width,
        height: target.height,
        loop: normalized.loop,
        delayCentiseconds: normalized.delayCentiseconds,
      });
    } catch (cause) {
      throw createCaptureError('gif-failed', cause);
    }

    return new Blob([bytes], { type: GIF_MIME_TYPE });
  }

  /** Рисует текущий кадр видео и переводит его в индексы палитры. */
  private grabGifFrame(
    context: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    target: VideoSizeInterface,
  ): GifFrameInterface {
    try {
      context.drawImage(video, 0, 0, target.width, target.height);

      const image = context.getImageData(0, 0, target.width, target.height);

      return {
        width: target.width,
        height: target.height,
        pixels: toIndexedPixels(image.data),
      };
    } catch (cause) {
      throw createCaptureError('canvas-failed', cause);
    }
  }

  /** Проверяет, что методы вызваны в браузере, а не на сервере. */
  private assertBrowser(): void {
    if (!this.isBrowser) {
      throw createCaptureError('unsupported');
    }
  }

  /** Читает нативный размер видео; без кадра захватывать нечего. */
  private readVideoSize(video: HTMLVideoElement): VideoSizeInterface {
    if (!video || !video.videoWidth || !video.videoHeight) {
      throw createCaptureError('no-video');
    }

    return { width: video.videoWidth, height: video.videoHeight };
  }

  /** Создаёт Canvas нужного размера и его 2D-контекст. */
  private createSurface(width: number, height: number): CanvasSurfaceInterface {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    let context: CanvasRenderingContext2D | null;

    try {
      context = canvas.getContext('2d');
    } catch (cause) {
      throw createCaptureError('canvas-failed', cause);
    }

    if (!context) {
      throw createCaptureError('canvas-failed');
    }

    return { canvas, context };
  }

  /** Отдаёт содержимое Canvas через `toBlob`. */
  private canvasToBlob(
    canvas: HTMLCanvasElement,
    type: CaptureFrameType,
    quality?: number,
  ): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      try {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
              return;
            }

            reject(createCaptureError('canvas-failed'));
          },
          type,
          quality,
        );
      } catch (cause) {
        reject(createCaptureError('canvas-failed', cause));
      }
    });
  }

  /** Выбирает MIME записи: явный проверяется, иначе — первый поддержанный. */
  private resolveMimeType(mimeType?: string): string {
    if (mimeType !== undefined) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }

      throw createCaptureError('recording-failed');
    }

    for (const candidate of CAPTURE_MIME_CANDIDATES) {
      if (MediaRecorder.isTypeSupported(candidate)) {
        return candidate;
      }
    }

    throw createCaptureError('recording-failed');
  }

  /** Останавливает все треки потока записи. */
  private stopTracks(stream: MediaStream): void {
    for (const track of stream.getTracks()) {
      try {
        track.stop();
      } catch {
        // Трек уже остановлен: повторная остановка ничего не ломает.
      }
    }
  }
}

/**
 * Реализация `ClipRecording`: владеет одним `MediaRecorder` и сигналом
 * состояния. Класс внутренний и в публичный API не входит.
 */
class ClipRecordingHandle implements ClipRecording {
  private readonly stateSignal = signal<ClipRecordingState>('recording');

  /** Текущее состояние записи. */
  readonly state: Signal<ClipRecordingState> = this.stateSignal.asReadonly();

  private readonly chunks: Blob[] = [];
  private stopPromise: Promise<Blob> | null = null;
  private resolveStop: ((blob: Blob) => void) | null = null;
  private rejectStop: ((reason: unknown) => void) | null = null;
  private terminalError: CaptureError | null = null;
  private finalized = false;
  private streamStopped = false;

  private readonly handleData = (event: BlobEvent): void => {
    if (event.data && event.data.size > 0) {
      this.chunks.push(event.data);
    }
  };

  private readonly handleStop = (): void => {
    this.finalize();
  };

  private readonly handleError = (event: Event): void => {
    const detail = (event as Event & { error?: unknown }).error;
    this.fail(detail ?? event);
  };

  constructor(
    private readonly recorder: MediaRecorder,
    private readonly stream: MediaStream,
    timeslice: number,
  ) {
    this.recorder.addEventListener('dataavailable', this.handleData);
    this.recorder.addEventListener('stop', this.handleStop);
    this.recorder.addEventListener('error', this.handleError);

    try {
      if (timeslice > 0) {
        this.recorder.start(timeslice);
      } else {
        this.recorder.start();
      }
    } catch (cause) {
      this.detach();
      throw cause;
    }
  }

  /** Останавливает запись; повторный вызов возвращает тот же промис. */
  stop(): Promise<Blob> {
    if (this.stopPromise) {
      return this.stopPromise;
    }

    if (this.terminalError) {
      this.stopPromise = Promise.reject(this.terminalError);
      return this.stopPromise;
    }

    this.stopPromise = new Promise<Blob>((resolve, reject) => {
      this.resolveStop = resolve;
      this.rejectStop = reject;
    });

    if (this.recorder.state === 'inactive') {
      this.finalize();
    } else {
      try {
        this.recorder.stop();
      } catch (cause) {
        this.fail(cause);
      }
    }

    return this.stopPromise;
  }

  /** Отменяет запись: данные выбрасываются, треки останавливаются. */
  cancel(): void {
    if (this.stateSignal() !== 'recording') {
      return;
    }

    this.chunks.length = 0;
    this.finalized = true;
    this.detach();

    try {
      if (this.recorder.state !== 'inactive') {
        this.recorder.stop();
      }
    } catch {
      // MediaRecorder уже остановлен — отмена всё равно завершает запись.
    }

    this.stopStream();
    this.stateSignal.set('cancelled');

    const error = createCaptureError('aborted');
    this.terminalError = error;
    this.rejectPending(error);
  }

  /** Завершает запись: собирает `Blob` или сообщает пустые данные. */
  private finalize(): void {
    if (this.finalized) {
      return;
    }

    this.finalized = true;
    this.detach();
    this.stopStream();

    if (this.stateSignal() === 'cancelled') {
      return;
    }

    if (this.terminalError) {
      this.stateSignal.set('error');
      this.rejectPending(this.terminalError);
      return;
    }

    const mimeType = this.recorder.mimeType || this.chunks[0]?.type || '';
    const blob = new Blob(this.chunks, { type: mimeType });
    const size = blob.size;
    this.chunks.length = 0;

    if (size === 0) {
      const error = createCaptureError('recording-failed');
      this.terminalError = error;
      this.stateSignal.set('error');
      this.rejectPending(error);
      return;
    }

    this.stateSignal.set('stopped');
    const resolve = this.resolveStop;
    this.resolveStop = null;
    this.rejectStop = null;
    resolve?.(blob);
  }

  /** Переводит запись в состояние ошибки и отклоняет ожидающий `stop()`. */
  private fail(cause: unknown): void {
    if (this.finalized) {
      return;
    }

    this.finalized = true;
    this.detach();
    this.stopStream();
    this.chunks.length = 0;

    const error = createCaptureError('recording-failed', cause);
    this.terminalError = error;
    this.stateSignal.set('error');
    this.rejectPending(error);
  }

  /** Снимает слушатели `MediaRecorder`. */
  private detach(): void {
    this.recorder.removeEventListener('dataavailable', this.handleData);
    this.recorder.removeEventListener('stop', this.handleStop);
    this.recorder.removeEventListener('error', this.handleError);
  }

  /** Останавливает треки `MediaStream`, если они ещё живые. */
  private stopStream(): void {
    if (this.streamStopped) {
      return;
    }

    this.streamStopped = true;

    for (const track of this.stream.getTracks()) {
      try {
        track.stop();
      } catch {
        // Трек уже остановлен: повторная остановка ничего не ломает.
      }
    }
  }

  /** Отклоняет ожидающий `stop()` переданной ошибкой. */
  private rejectPending(error: CaptureError): void {
    const reject = this.rejectStop;
    this.resolveStop = null;
    this.rejectStop = null;
    reject?.(error);
  }
}
