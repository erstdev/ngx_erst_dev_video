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
import { ScreenshotButtonComponent } from '@erst_dev/ngx-video-capture';
import type {
  CaptureError,
  CaptureFrameType,
} from '@erst_dev/ngx-video-capture';

import { CodeSnippetComponent } from '../../../../../code-snippet/code-snippet';
import { DemoShellComponent } from '../../../../../demo-shell/demo-shell';
import { formatBytes } from '../../../../../utils/format-bytes.util';
import type { CapturedFrameInfo } from '../interfaces/captured-frame-info.interface';
import type { ShotTheme } from '../interfaces/shot-theme.interface';
import type { ShotThemeId } from '../types/shot-theme-id.type';
import { buildDemoFileName } from '../utils/build-demo-file-name.util';

/**
 * Демо для ScreenshotButtonComponent.
 *
 * Живое видео с публичного CDN: воспроизведением управляет `VideoService`,
 * захват выполняет `CaptureService`, а кнопка только передаёт нативный элемент
 * и настройки, получает готовый `Blob` и скачивает файл. Предпросмотр и ручная
 * ссылка `download` показывают тот же `Blob`.
 */
@Component({
  selector: 'app-screenshot-button-demo',
  imports: [
    CodeSnippetComponent,
    DemoShellComponent,
    ScreenshotButtonComponent,
    VideoDirective,
  ],
  providers: [VideoService],
  templateUrl: './screenshot-button-demo.html',
  styleUrl: './screenshot-button-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenshotButtonDemo {
  private readonly destroyRef = inject(DestroyRef);
  private readonly videoRef =
    viewChild<ElementRef<HTMLVideoElement>>('videoEl');
  private readonly objectUrls = new Set<string>();

  protected readonly video = inject(VideoService);

  /** Публичное видео с CORS-заголовками: иначе canvas станет «грязным». */
  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  /** Нативный элемент: пока `viewChild` не готов, кнопке уходит `null`. */
  protected readonly videoElement = computed(
    () => this.videoRef()?.nativeElement ?? null,
  );

  protected readonly frameType = signal<CaptureFrameType>('image/png');
  protected readonly autoDownload = signal(true);
  protected readonly fileName = signal('screenshot');
  protected readonly shotTheme = signal<ShotThemeId>('default');

  /** Пресеты оформления: класс вешается на хост через `customClass`. */
  protected readonly shotThemes: readonly ShotTheme[] = [
    { id: 'default', label: 'По умолчанию', className: '' },
    { id: 'emerald', label: 'Изумрудная', className: 'player__shot--emerald' },
    { id: 'compact', label: 'Компактная', className: 'player__shot--compact' },
  ];

  /** Базовый класс позиции и класс выбранного пресета — оба на хосте. */
  protected readonly shotCustomClass = computed(() => {
    const theme = this.shotThemes.find((item) => item.id === this.shotTheme());

    return ['player__shot', theme?.className].filter(Boolean).join(' ');
  });

  protected readonly previewUrl = signal<string | null>(null);
  protected readonly frameInfo = signal<CapturedFrameInfo | null>(null);
  protected readonly error = signal<CaptureError | null>(null);

  protected readonly playLabel = computed(() =>
    this.video.state() === 'playing' || this.video.state() === 'buffering'
      ? 'Пауза'
      : 'Play',
  );

  protected readonly stateLabel = computed(() => {
    if (this.error()) {
      return 'ошибка';
    }

    return this.frameInfo() ? 'кадр получен' : 'ожидание';
  });

  protected readonly mimeLabel = computed(
    () => this.frameInfo()?.mimeType ?? '—',
  );

  protected readonly sizeLabel = computed(() => {
    const info = this.frameInfo();

    return info ? formatBytes(info.size) : '—';
  });

  protected readonly fileNameLabel = computed(
    () => this.frameInfo()?.fileName ?? '—',
  );

  protected readonly responsibilities = [
    'Вызывает CaptureService.captureFrame() для переданного HTMLVideoElement и отдаёт готовый Blob через capture.',
    'При download = true скачивает файл временной ссылкой <a download>; имя собирается с расширением по MIME.',
    'Ошибки отдаёт в captureError как CaptureError; чужое исключение оборачивает в canvas-failed с cause.',
    'Плеером не управляет: play(), pause() и seek() остаются за VideoService; SSR без DOM на верхнем уровне.',
    'Пакет PRO — распространяется платно.',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
import { Component, ElementRef, computed, viewChild } from '@angular/core';
import { VideoDirective } from '@erst_dev/ngx-video-core';
import { ScreenshotButtonComponent } from '@erst_dev/ngx-video-capture';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, ScreenshotButtonComponent],
  template: \`
    <video #video ngxVideo [src]="src" crossorigin="anonymous" playsinline></video>
    <ngx-screenshot-button [video]="videoElement()" (capture)="onCapture($event)" />
  \`,
})
export class PlayerComponent {
  private readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');

  // Пока нативного элемента нет, компонент получает null и отключён.
  protected readonly videoElement = computed(
    () => this.videoRef()?.nativeElement ?? null,
  );

  protected onCapture(blob: Blob): void {
    // Blob уже готов, скачивание по умолчанию уже запущено.
    console.log(blob.type, blob.size);
  }
}`,

    options: `<!-- player.component.html -->
<ngx-screenshot-button
  [video]="videoElement()"
  type="image/jpeg"
  [quality]="0.9"
  [maxWidth]="1280"
  [maxHeight]="720"
  fileName="frame"
  [download]="false"
  (capture)="openPreview($event)"
  (captureError)="onError($event)"
/>

// player.component.ts
protected openPreview(blob: Blob): void {
  // download = false: компонент ничего не скачивает.
  // Ссылку <a download> и object URL готовит потребитель.
  this.previewUrl.set(URL.createObjectURL(blob));
}

// fileName="frame" + type="image/jpeg" → frame.jpg
// Существующее расширение (.png/.jpg/.jpeg/.webp) срезается и заменяется.`,

    errors: `// player.component.ts
import type { CaptureError } from '@erst_dev/ngx-video-capture';

protected onError(error: CaptureError): void {
  // code — контракт: unsupported | no-video | canvas-failed.
  // Чужое исключение компонент сам оборачивает в canvas-failed с cause.
  console.warn(error.code, error.message, error.cause);
}

// SSR: на верхнем уровне модуля нет window, document и MediaRecorder.
// document используется только в обработчике клика — при создании
// временной ссылки <a download>, поэтому серверный рендер безопасен.`,

    styling: `<!-- player.component.html -->
<ngx-screenshot-button
  customClass="shot shot--emerald"
  [video]="videoElement()"
/>

/* player.component.scss — scoped-стили без ::ng-deep */
.shot {
  --ngx-screenshot-size: 48px;
  --ngx-screenshot-focus-color: #fbbf24;
  /* Хост повторяет скругление кнопки — иначе box-shadow рисует квадрат. */
  border-radius: var(--ngx-screenshot-border-radius);
}

.shot--emerald {
  --ngx-screenshot-bg: #065f46;
  --ngx-screenshot-hover-bg: #047857;
  --ngx-screenshot-color: #ecfdf5;
  --ngx-screenshot-border-radius: 12px;
  box-shadow: 0 6px 16px rgba(4, 120, 87, 0.4);
}

// customClass вешает классы на хост <ngx-screenshot-button>,
// CSS-переменные наследуются внутренней кнопке.
// Классы из class="..." customClass не затирает.`,
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

  protected setFrameType(type: CaptureFrameType): void {
    this.frameType.set(type);
  }

  protected setShotTheme(id: ShotThemeId): void {
    this.shotTheme.set(id);
  }

  protected onAutoDownloadChange(event: Event): void {
    this.autoDownload.set((event.target as HTMLInputElement).checked);
  }

  protected onFileNameInput(event: Event): void {
    this.fileName.set((event.target as HTMLInputElement).value);
  }

  /** Кнопка отдала готовый `Blob`: показываем его и освобождаем прошлый URL. */
  protected onCapture(blob: Blob): void {
    const previous = this.previewUrl();
    const url = URL.createObjectURL(blob);

    this.objectUrls.add(url);
    this.previewUrl.set(url);

    if (previous) {
      URL.revokeObjectURL(previous);
      this.objectUrls.delete(previous);
    }

    this.error.set(null);
    this.frameInfo.set({
      mimeType: blob.type || this.frameType(),
      size: blob.size,
      fileName: buildDemoFileName(this.fileName(), this.frameType()),
    });
  }

  protected onError(error: CaptureError): void {
    this.error.set(error);
  }
}
