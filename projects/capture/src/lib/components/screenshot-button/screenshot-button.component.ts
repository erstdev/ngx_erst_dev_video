import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import {
  CAPTURE_DEFAULT_FRAME_TYPE,
  CAPTURE_DEFAULT_QUALITY,
} from '../../constants';
import type { CaptureError } from '../../interfaces';
import { CaptureService } from '../../services';
import type { CaptureFrameType } from '../../types';
import { createCaptureError } from '../../utils';
import {
  SCREENSHOT_BUTTON_DEFAULT_FILE_NAME,
  SCREENSHOT_BUTTON_LABELS,
} from './constants';
import type { ScreenshotButtonIconContext } from './interfaces';
import { buildFileName, isCaptureError } from './utils';

/**
 * Кнопка скриншота для уже играющего `<video>`.
 *
 * Захват выполняет `CaptureService`: компонент передаёт ему нативный
 * `HTMLVideoElement` и настройки кадра, получает готовый `Blob`, эмитит
 * `capture` и по умолчанию скачивает файл. Плеером кнопка не управляет:
 * `play()`, `pause()` и `seek()` остаются за `VideoService`.
 *
 * Пока кадр снимается, кнопка заблокирована и помечена `aria-busy="true"`;
 * ошибка приходит в `captureError` как `CaptureError` и не пробрасывается.
 *
 * @example
 * ```html
 * <video #video ngxVideo [src]="src" crossorigin="anonymous" playsinline></video>
 *
 * <ngx-screenshot-button
 *   [video]="videoElement()"
 *   type="image/jpeg"
 *   fileName="frame"
 *   (capture)="onCapture($event)"
 *   (captureError)="onError($event)"
 * />
 * ```
 */
@Component({
  selector: 'ngx-screenshot-button',
  imports: [NgTemplateOutlet],
  templateUrl: './screenshot-button.component.html',
  styleUrl: './screenshot-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenshotButtonComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly captureService = inject(CaptureService);
  private appliedClasses: readonly string[] = [];

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));
  }

  /** Видео, с которого снимается кадр; `null` — кнопка отключена. */
  readonly video = input<HTMLVideoElement | null>(null);

  /** MIME-тип кадра: PNG, JPEG или WebP. */
  readonly type = input<CaptureFrameType>(CAPTURE_DEFAULT_FRAME_TYPE);

  /** Качество для JPEG и WebP, от 0 до 1. */
  readonly quality = input(CAPTURE_DEFAULT_QUALITY);

  /** Максимальная ширина кадра; `null` — нативная. */
  readonly maxWidth = input<number | null>(null);

  /** Максимальная высота кадра; `null` — нативная. */
  readonly maxHeight = input<number | null>(null);

  /** Базовое имя файла без расширения; расширение добавляет компонент. */
  readonly fileName = input(SCREENSHOT_BUTTON_DEFAULT_FILE_NAME);

  /** Инициировать скачивание после успешного кадра. */
  readonly download = input(true);

  /** Дополнительная блокировка кнопки независимо от состояния захвата. */
  readonly disabled = input(false);

  /**
   * Дополнительный CSS-класс для хост-элемента `<ngx-screenshot-button>`.
   *
   * Класс вешается на хост, поэтому потребитель может стилизовать компонент
   * обычными scoped-стилями своего компонента — без `::ng-deep` и без
   * глобальных стилей. CSS-переменные с хоста наследуются внутрь.
   */
  readonly customClass = input('');

  /**
   * Переопределение `aria-label`; по умолчанию «Сделать скриншот» или
   * «Сохранение кадра…».
   */
  readonly ariaLabel = input<string | null>(null);

  /** Пользовательская иконка вместо стандартной SVG-камеры. */
  readonly iconTemplate =
    input<TemplateRef<ScreenshotButtonIconContext> | null>(null);

  /** Успешный кадр: `Blob` уже готов, скачивание (если включено) запущено. */
  readonly capture = output<Blob>();

  /**
   * Ошибка захвата: `CaptureError` из сервиса.
   *
   * Чужое исключение оборачивается в `canvas-failed` с `cause`; наружу
   * исключение не пробрасывается. Имя `captureError`, а не `error`:
   * `error` конфликтует с нативным событием и правилом `no-output-native`.
   */
  readonly captureError = output<CaptureError>();

  /** Кадр снимается прямо сейчас: повторные клики игнорируются. */
  protected readonly capturing = signal(false);

  protected readonly label = computed(
    () =>
      this.ariaLabel() ??
      (this.capturing()
        ? SCREENSHOT_BUTTON_LABELS.capturing
        : SCREENSHOT_BUTTON_LABELS.capture),
  );

  protected readonly iconContext = computed<ScreenshotButtonIconContext>(
    () => ({
      capturing: this.capturing(),
    }),
  );

  /** Кнопка отключена без видео, по входу `disabled` и во время захвата. */
  protected readonly isDisabled = computed(
    () => this.disabled() || !this.video() || this.capturing(),
  );

  protected async onClick(): Promise<void> {
    if (this.isDisabled()) {
      return;
    }

    const video = this.video();

    if (!video) {
      return;
    }

    const type = this.type();

    this.capturing.set(true);

    try {
      const blob = await this.captureService.captureFrame(video, {
        type,
        quality: this.quality(),
        maxWidth: this.maxWidth() ?? undefined,
        maxHeight: this.maxHeight() ?? undefined,
      });

      this.capture.emit(blob);

      if (this.download()) {
        this.downloadBlob(blob, type);
      }
    } catch (error) {
      this.captureError.emit(
        isCaptureError(error)
          ? error
          : createCaptureError('canvas-failed', error),
      );
    } finally {
      this.capturing.set(false);
    }
  }

  /**
   * Скачивает `Blob` временной ссылкой `<a download>`.
   *
   * `document` и `URL` используются только здесь, в обработчике клика,
   * поэтому на верхнем уровне модуля DOM-API нет и SSR безопасен.
   */
  private downloadBlob(blob: Blob, type: CaptureFrameType): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = buildFileName(this.fileName(), type);
    link.rel = 'noopener';
    link.style.display = 'none';

    document.body.append(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 0);
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
