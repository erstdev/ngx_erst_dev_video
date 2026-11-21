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

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { ClipRecorderComponent } from '@erst_dev/ngx-video-capture';
import type { CaptureError } from '@erst_dev/ngx-video-capture';

import { CodeSnippetComponent } from '../../../../../code-snippet/code-snippet';
import { DemoShellComponent } from '../../../../../demo-shell/demo-shell';
import { formatBytes } from '../../../../../utils/format-bytes.util';
import { MAX_DURATIONS } from '../constants/clip-recorder-demo.constants';
import type { RecordedClipInfo } from '../interfaces/recorded-clip-info.interface';
import { formatDuration } from '../utils/format-duration.util';

/**
 * Демо для ClipRecorderComponent.
 *
 * Живое видео с публичного CDN: запись выполняет `CaptureService.recordClip()`,
 * компонент владеет `ClipRecording` и отдаёт готовый `Blob`, а воспроизведением
 * управляет `VideoService`. Предпросмотр и скачивание — задача демо, не
 * компонента. Object URL освобождаются в `DestroyRef`.
 */
@Component({
  selector: 'app-clip-recorder-demo',
  imports: [
    ClipRecorderComponent,
    CodeSnippetComponent,
    DemoShellComponent,
    VideoDirective,
  ],
  providers: [VideoService],
  templateUrl: './clip-recorder-demo.html',
  styleUrl: './clip-recorder-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClipRecorderDemo {
  private readonly destroyRef = inject(DestroyRef);
  private readonly videoRef =
    viewChild<ElementRef<HTMLVideoElement>>('videoEl');
  private readonly objectUrls = new Set<string>();

  protected readonly video = inject(VideoService);

  /** Публичное видео с CORS-заголовками: иначе запись может быть недоступна. */
  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  /** Нативный элемент: пока `viewChild` не готов, компоненту уходит `null`. */
  protected readonly videoElement = computed(
    () => this.videoRef()?.nativeElement ?? null,
  );

  protected readonly maxDurations = MAX_DURATIONS;
  protected readonly maxDuration = signal<number>(10);

  protected readonly recording = signal(false);
  protected readonly clipUrl = signal<string | null>(null);
  protected readonly clip = signal<RecordedClipInfo | null>(null);
  protected readonly error = signal<CaptureError | null>(null);

  private startedAt = 0;

  protected readonly playLabel = computed(() =>
    this.video.state() === 'playing' || this.video.state() === 'buffering'
      ? 'Пауза'
      : 'Play',
  );

  protected readonly stateLabel = computed(() => {
    if (this.error()) {
      return 'ошибка';
    }

    if (this.recording()) {
      return 'запись';
    }

    return this.clip() ? 'клип готов' : 'ожидание';
  });

  protected readonly mimeLabel = computed(() => this.clip()?.mimeType ?? '—');

  protected readonly sizeLabel = computed(() => {
    const info = this.clip();

    return info ? formatBytes(info.size) : '—';
  });

  protected readonly durationLabel = computed(() => {
    const info = this.clip();

    return info ? formatDuration(info.durationMs) : '—';
  });

  protected readonly fileNameLabel = computed(
    () => this.clip()?.fileName ?? '—',
  );

  protected readonly responsibilities = [
    'Вызывает CaptureService.recordClip() и владеет полученным ClipRecording; кодирование остаётся в сервисе.',
    'Пока идёт запись, старт заблокирован, а «Остановить» доступна даже при disabled = true: запись нужно завершить.',
    'Таймер с нуля, обновление каждые 250 мс, авто-стоп по maxDuration; лимит фиксируется на момент старта.',
    'Ошибки старта, stop() и состояние error отдаёт в recordError как CaptureError; чужое исключение — recording-failed с cause.',
    'Плеером не управляет и файлы не скачивает: Blob уходит в recordStop, ссылку и скачивание готовит демо.',
    'SSR без DOM на верхнем уровне; пакет PRO — распространяется платно.',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
import { Component, ElementRef, computed, viewChild } from '@angular/core';
import { VideoDirective } from '@erst_dev/ngx-video-core';
import { ClipRecorderComponent } from '@erst_dev/ngx-video-capture';
import type { CaptureError } from '@erst_dev/ngx-video-capture';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, ClipRecorderComponent],
  template: \`
    <video #video ngxVideo [src]="src" crossorigin="anonymous" playsinline></video>
    <ngx-clip-recorder
      [video]="videoElement()"
      (recordStart)="onRecordStart()"
      (recordStop)="onRecordStop($event)"
      (recordError)="onError($event)"
    />
  \`,
})
export class PlayerComponent {
  private readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');

  // Пока нативного элемента нет, компонент получает null и старт заблокирован.
  protected readonly videoElement = computed(
    () => this.videoRef()?.nativeElement ?? null,
  );

  protected onRecordStart(): void {
    // ClipRecording уже создан, запись идёт, таймер запущен.
  }

  protected onRecordStop(blob: Blob): void {
    // blob.type — фактический MIME; скачивание и предпросмотр — задача потребителя.
    console.log(blob.type, blob.size);
  }

  protected onError(error: CaptureError): void {
    console.warn(error.code, error.message);
  }
}`,

    maxDuration: `<!-- 5 секунд; 0 — без ограничения, максимум — 3600 -->
<ngx-clip-recorder [video]="videoElement()" [maxDuration]="5" />

// Таймер обновляется каждые 250 мс и начинает с 00:00.
// По достижении лимита компонент сам вызывает stop():
// recordStop придёт один раз, таймер зафиксируется.
//
// Лимит фиксируется на момент старта: изменение входа
// во время записи не меняет текущий лимит.
//
// Некорректное значение заменяется на 30,
// отрицательное — на 0, больше 3600 — на 3600.`,

    errors: `// player.component.ts
import type { CaptureError } from '@erst_dev/ngx-video-capture';

protected onError(error: CaptureError): void {
  // code: unsupported | recording-failed | aborted.
  // Чужое исключение компонент оборачивает в recording-failed с cause.
  console.warn(error.code, error.message, error.cause);
}

// Если ClipRecording.state() перешла в error во время записи,
// компонент останавливает таймер и эмитит recordError без клика.
//
// SSR: на верхнем уровне модуля нет window, document и MediaRecorder;
// setInterval создаётся только в обработчике клика, поэтому
// создание компонента на сервере не падает.`,
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

  protected setMaxDuration(duration: number): void {
    this.maxDuration.set(duration);
  }

  protected onRecordStart(): void {
    this.error.set(null);
    this.recording.set(true);
    this.startedAt = Date.now();
  }

  /** Компонент отдал готовый `Blob`: показываем его и освобождаем прошлый URL. */
  protected onRecordStop(blob: Blob): void {
    const previous = this.clipUrl();
    const url = URL.createObjectURL(blob);

    this.objectUrls.add(url);
    this.recording.set(false);
    this.clipUrl.set(url);
    this.clip.set({
      mimeType: blob.type || 'video/webm',
      size: blob.size,
      durationMs: Math.max(0, Date.now() - this.startedAt),
      fileName: blob.type.includes('mp4') ? 'clip.mp4' : 'clip.webm',
    });
    this.error.set(null);

    if (previous) {
      URL.revokeObjectURL(previous);
      this.objectUrls.delete(previous);
    }
  }

  protected onError(error: CaptureError): void {
    this.recording.set(false);
    this.error.set(error);
  }
}
