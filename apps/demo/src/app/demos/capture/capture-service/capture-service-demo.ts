import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import type { WritableSignal } from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { CaptureService } from '@erst_dev/ngx-video-capture';
import type {
  CaptureError,
  CaptureFrameOptions,
  ClipRecording,
  ClipRecordingState,
} from '@erst_dev/ngx-video-capture';

import { CodeSnippetComponent } from '../../shared/code-snippet/code-snippet';
import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';
import { formatBytes } from '../../shared/utils/format-bytes.util';
import { isCaptureError } from './utils/is-capture-error.util';

/**
 * Демо для CaptureService.
 *
 * Живое видео с публичного CDN, три способа захвата и предпросмотры
 * результатов. Воспроизведением управляет `VideoService` — сервис захвата
 * только получает нативный элемент и возвращает `Blob` или объект записи.
 * Скачивание инициирует демо ссылками `download`.
 */
@Component({
  selector: 'app-capture-service-demo',
  imports: [CodeSnippetComponent, DemoShellComponent, VideoDirective],
  providers: [VideoService],
  templateUrl: './capture-service-demo.html',
  styleUrl: './capture-service-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaptureServiceDemo {
  private readonly capture = inject(CaptureService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly videoElement =
    viewChild.required<ElementRef<HTMLVideoElement>>('videoEl');
  private readonly objectUrls = new Set<string>();

  protected readonly video = inject(VideoService);

  /** Публичное видео с CORS-заголовками: иначе canvas станет «грязным». */
  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  protected readonly frameUrl = signal<string | null>(null);
  protected readonly frameName = signal('frame.png');
  protected readonly frameInfo = signal<string | null>(null);
  protected readonly gifUrl = signal<string | null>(null);
  protected readonly gifInfo = signal<string | null>(null);
  protected readonly clipUrl = signal<string | null>(null);
  protected readonly clipName = signal('clip.webm');
  protected readonly clipInfo = signal<string | null>(null);
  protected readonly recording = signal<ClipRecording | null>(null);
  protected readonly error = signal<CaptureError | null>(null);

  /** Идёт запись GIF: кнопка блокируется на время снятия кадров. */
  protected readonly busy = signal(false);

  protected readonly recordingState = computed<ClipRecordingState | null>(
    () => this.recording()?.state() ?? null,
  );

  protected readonly playLabel = computed(() =>
    this.video.state() === 'playing' || this.video.state() === 'buffering'
      ? 'Пауза'
      : 'Play',
  );

  protected readonly responsibilities = [
    'Сервис без селектора: получает HTMLVideoElement и возвращает Blob или запись.',
    'Кадр и GIF — через Canvas, клип — через MediaRecorder и video.captureStream().',
    'Не управляет плеером, не скачивает файлы и не хранит глобальное состояние.',
    'Пакет PRO — распространяется платно.',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    frame: `// capture-demo.component.ts
import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { CaptureService } from '@erst_dev/ngx-video-capture';

@Component({
  selector: 'app-capture-demo',
  template: \`
    <video #video [src]="src" crossorigin="anonymous" playsinline></video>
    <button type="button" (click)="captureFrame()">Кадр JPEG</button>
  \`,
})
export class CaptureDemoComponent {
  private readonly capture = inject(CaptureService);
  private readonly videoRef =
    viewChild.required<ElementRef<HTMLVideoElement>>('video');

  protected async captureFrame(): Promise<void> {
    // Сервис не вызывает play(), pause() и seek(): кадр — с текущего состояния.
    const blob = await this.capture.captureFrame(
      this.videoRef().nativeElement,
      { type: 'image/jpeg', quality: 0.9, maxWidth: 1280 },
    );

    // Скачивание — задача потребителя, сервис его не запускает.
    const url = URL.createObjectURL(blob);
    console.log(blob.type, blob.size, url);
  }
}`,

    record: `// capture-demo.component.ts
import { signal } from '@angular/core';
import type { ClipRecording } from '@erst_dev/ngx-video-capture';

protected readonly recording = signal<ClipRecording | null>(null);

protected startRecording(): void {
  // API проверяется синхронно: без MediaRecorder или captureStream()
  // прилетит CaptureError с кодом unsupported.
  this.recording.set(
    this.capture.recordClip(this.videoRef().nativeElement, {
      videoBitsPerSecond: 2_500_000,
      timeslice: 1000,
    }),
  );
}

protected async stopRecording(): Promise<void> {
  const recording = this.recording();
  if (!recording) {
    return;
  }

  // recording.state(): recording | stopped | cancelled | error
  const blob = await recording.stop();

  // blob.type — фактический MIME, например video/webm;codecs=vp9,opus.
  const url = URL.createObjectURL(blob);
}

// Отмена выбрасывает данные и останавливает треки:
// ожидающий stop() отклонится с кодом aborted.
// this.recording()?.cancel();`,

    gif: `// capture-demo.component.ts
protected async captureGif(): Promise<void> {
  // Кадры снимаются 2 секунды с частотой 10 к/с и кодируются
  // собственным GIF89a-энкодером — без внешних зависимостей.
  const blob = await this.capture.captureGif(
    this.videoRef().nativeElement,
    { fps: 10, duration: 2000, width: 320, loop: true },
  );

  // Настоящий image/gif: глобальная палитра 3-3-2, без прозрачности.
  const url = URL.createObjectURL(blob);
  console.log(blob.type, blob.size, url);
}`,
  } as const;

  constructor() {
    this.destroyRef.onDestroy(() => {
      for (const url of this.objectUrls) {
        URL.revokeObjectURL(url);
      }

      this.objectUrls.clear();
    });
  }

  protected togglePlay(): void {
    this.video.toggle();
  }

  protected capturePng(): void {
    void this.captureFrame({ type: 'image/png' }, 'PNG', 'frame.png');
  }

  protected captureJpeg(): void {
    void this.captureFrame(
      { type: 'image/jpeg', quality: 0.9 },
      'JPEG',
      'frame.jpg',
    );
  }

  protected startRecording(): void {
    this.error.set(null);

    try {
      const recording = this.capture.recordClip(
        this.videoElement().nativeElement,
        { videoBitsPerSecond: 2_500_000 },
      );

      this.recording.set(recording);
    } catch (error) {
      this.setError(error);
    }
  }

  protected async stopRecording(): Promise<void> {
    const recording = this.recording();

    if (!recording) {
      return;
    }

    try {
      const blob = await recording.stop();

      this.replaceUrl(this.clipUrl, blob);
      this.clipName.set(blob.type.includes('mp4') ? 'clip.mp4' : 'clip.webm');
      this.clipInfo.set(`${blob.type || 'video'} · ${formatBytes(blob.size)}`);
    } catch (error) {
      this.setError(error);
    }
  }

  protected async captureGif(): Promise<void> {
    this.error.set(null);
    this.busy.set(true);

    try {
      const blob = await this.capture.captureGif(
        this.videoElement().nativeElement,
        { fps: 10, duration: 2000, width: 320 },
      );

      this.replaceUrl(this.gifUrl, blob);
      this.gifInfo.set(`GIF · ${blob.type} · ${formatBytes(blob.size)}`);
    } catch (error) {
      this.setError(error);
    } finally {
      this.busy.set(false);
    }
  }

  private async captureFrame(
    options: CaptureFrameOptions,
    label: string,
    fileName: string,
  ): Promise<void> {
    this.error.set(null);

    try {
      const blob = await this.capture.captureFrame(
        this.videoElement().nativeElement,
        options,
      );

      this.frameName.set(fileName);
      this.replaceUrl(this.frameUrl, blob);
      this.frameInfo.set(`${label} · ${blob.type} · ${formatBytes(blob.size)}`);
    } catch (error) {
      this.setError(error);
    }
  }

  /** Показывает ошибку сервиса; посторонние значения оборачивает сам. */
  private setError(error: unknown): void {
    this.error.set(
      isCaptureError(error)
        ? error
        : {
            code: 'unsupported',
            message: 'Не удалось выполнить захват.',
            cause: error,
          },
    );
  }

  /** Заменяет object URL предпросмотра и освобождает прежний. */
  private replaceUrl(target: WritableSignal<string | null>, blob: Blob): void {
    const previous = target();
    const url = URL.createObjectURL(blob);

    this.objectUrls.add(url);
    target.set(url);

    if (previous) {
      URL.revokeObjectURL(previous);
      this.objectUrls.delete(previous);
    }
  }
}
