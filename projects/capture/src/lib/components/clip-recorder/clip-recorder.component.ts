import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import type { CaptureError, ClipRecording } from '../../interfaces';
import { CaptureService } from '../../services';
import { createCaptureError } from '../../utils';
import {
  CLIP_RECORDER_DEFAULT_MAX_DURATION,
  CLIP_RECORDER_GROUP_ARIA_LABEL,
  CLIP_RECORDER_LABELS,
  CLIP_RECORDER_MAX_MAX_DURATION,
  CLIP_RECORDER_MIN_MAX_DURATION,
  CLIP_RECORDER_TIMER_INTERVAL_MS,
} from './constants';
import type { ClipRecorderIndicatorContext } from './interfaces';
import { formatClipDuration, isCaptureError } from './utils';

/**
 * UI записи клипа для уже играющего `<video>`.
 *
 * Запись выполняет `CaptureService.recordClip()`: компонент передаёт ему
 * нативный `HTMLVideoElement` и настройки записи, владеет полученным
 * `ClipRecording` и отдаёт готовый `Blob` через выход `recordStop`. Компонент
 * управляет только UI-состоянием — кнопками, таймером и индикацией; плеером он
 * не управляет и файлы не скачивает.
 *
 * Пока идёт запись, старт заблокирован, а «Остановить» доступна даже при
 * `disabled = true`: запись нужно уметь завершить. По достижении `maxDuration`
 * компонент останавливает запись сам.
 *
 * @example
 * ```html
 * <video #video ngxVideo [src]="src" crossorigin="anonymous" playsinline></video>
 *
 * <ngx-clip-recorder
 *   [video]="videoElement()"
 *   [maxDuration]="30"
 *   (recordStart)="onRecordStart()"
 *   (recordStop)="onRecordStop($event)"
 *   (recordError)="onError($event)"
 * />
 * ```
 */
@Component({
  selector: 'ngx-clip-recorder',
  imports: [NgTemplateOutlet],
  templateUrl: './clip-recorder.component.html',
  styleUrl: './clip-recorder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClipRecorderComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly captureService = inject(CaptureService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly activeRecording = signal<ClipRecording | null>(null);
  private readonly isRecording = signal(false);
  private readonly isStopping = signal(false);
  private readonly elapsedMs = signal(0);

  private appliedClasses: readonly string[] = [];
  private timerId: ReturnType<typeof setInterval> | null = null;
  private startedAt = 0;
  private durationLimitMs = 0;
  private destroyed = false;

  constructor() {
    effect(() => this.syncCustomClass(this.customClass()));
    effect(() => this.watchRecordingState());
    this.destroyRef.onDestroy(() => this.cleanup());
  }

  /** Видео, с которого пишется клип; `null` — старт заблокирован. */
  readonly video = input<HTMLVideoElement | null>(null);

  /** Лимит записи в секундах; `0` — без ограничения. */
  readonly maxDuration = input(CLIP_RECORDER_DEFAULT_MAX_DURATION);

  /** Явный MIME-тип записи; `null` — автоподбор в сервисе. */
  readonly mimeType = input<string | null>(null);

  /** Битрейт видео в бит/с. */
  readonly videoBitsPerSecond = input(2_500_000);

  /** Битрейт звука в бит/с. */
  readonly audioBitsPerSecond = input(128_000);

  /** Интервал отдачи данных в мс; `0` — без `timeslice`. */
  readonly timeslice = input(1000);

  /** Дополнительная блокировка старта независимо от состояния записи. */
  readonly disabled = input(false);

  /**
   * Дополнительный CSS-класс для хост-элемента `<ngx-clip-recorder>`.
   *
   * Класс вешается на хост, поэтому потребитель может стилизовать компонент
   * обычными scoped-стилями своего компонента — без `::ng-deep` и без
   * глобальных стилей. CSS-переменные с хоста наследуются внутрь.
   */
  readonly customClass = input('');

  /** Переопределение `aria-label` группы; по умолчанию «Запись клипа». */
  readonly ariaLabel = input<string | null>(null);

  /** Пользовательский индикатор вместо стандартной пульсирующей точки. */
  readonly indicatorTemplate =
    input<TemplateRef<ClipRecorderIndicatorContext> | null>(null);

  /** Запись успешно началась: `ClipRecording` уже создан. */
  readonly recordStart = output<void>();

  /** Запись остановлена: готовый `Blob` с фактическим MIME-типом. */
  readonly recordStop = output<Blob>();

  /**
   * Ошибка старта или остановки: `CaptureError` из сервиса.
   *
   * Чужое исключение оборачивается в `recording-failed` с `cause`; наружу
   * исключение не пробрасывается. Имя `recordError`, а не `error`: `error`
   * конфликтует с нативным событием и правилом `no-output-native`.
   */
  readonly recordError = output<CaptureError>();

  protected readonly labels = CLIP_RECORDER_LABELS;

  protected readonly groupLabel = computed(
    () => this.ariaLabel() ?? CLIP_RECORDER_GROUP_ARIA_LABEL,
  );

  protected readonly indicatorContext = computed<ClipRecorderIndicatorContext>(
    () => ({
      recording: this.isRecording(),
      stopping: this.isStopping(),
    }),
  );

  protected readonly timerLabel = computed(() =>
    formatClipDuration(this.elapsedMs()),
  );

  /** Старт недоступен без видео, по входу `disabled` и во время записи. */
  protected readonly isStartDisabled = computed(
    () =>
      this.disabled() ||
      !this.video() ||
      this.isRecording() ||
      this.isStopping(),
  );

  /** Остановить можно только активную запись, даже если включён `disabled`. */
  protected readonly isStopDisabled = computed(
    () => !this.isRecording() || this.isStopping(),
  );

  protected onStart(): void {
    if (this.isStartDisabled()) {
      return;
    }

    const video = this.video();

    if (!video) {
      return;
    }

    try {
      const recording = this.captureService.recordClip(video, {
        mimeType: this.mimeType() ?? undefined,
        videoBitsPerSecond: this.videoBitsPerSecond(),
        audioBitsPerSecond: this.audioBitsPerSecond(),
        timeslice: this.timeslice(),
      });

      this.activeRecording.set(recording);
      this.isRecording.set(true);
      this.isStopping.set(false);
      this.elapsedMs.set(0);
      this.startedAt = Date.now();
      this.durationLimitMs = this.resolveDurationLimitMs();
      this.startTimer();
      this.recordStart.emit();
    } catch (error) {
      this.reportError(error);
    }
  }

  protected onStop(): void {
    void this.stopRecording();
  }

  /**
   * Останавливает активную запись и отдаёт `Blob` наружу.
   *
   * Повторный вызов во время остановки игнорируется: `isStopping` выставляется
   * синхронно, до первого `await`. Таймер фиксируется на фактической
   * длительности, интервал очищается.
   */
  private async stopRecording(): Promise<void> {
    const recording = this.activeRecording();

    if (!recording || !this.isRecording() || this.isStopping()) {
      return;
    }

    this.isStopping.set(true);

    try {
      const blob = await recording.stop();

      if (this.destroyed) {
        return;
      }

      this.finishRecording();
      this.recordStop.emit(blob);
    } catch (error) {
      if (this.destroyed) {
        return;
      }

      this.finishRecording();
      this.reportError(error);
    }
  }

  /** Тик таймера: обновляет elapsed и запускает авто-стоп по лимиту. */
  private tick(): void {
    if (!this.isRecording()) {
      return;
    }

    const elapsed = Math.max(0, Date.now() - this.startedAt);
    this.elapsedMs.set(elapsed);

    if (
      !this.isStopping() &&
      this.durationLimitMs > 0 &&
      elapsed >= this.durationLimitMs
    ) {
      void this.stopRecording();
    }
  }

  /**
   * Реагирует на `error` в сигнале состояния записи без ожидания клика.
   *
   * Когда ошибка приходит во время остановки, её обрабатывает `catch`
   * в `stopRecording()`, а этот эффект молчит, чтобы не эмитить дважды.
   */
  private watchRecordingState(): void {
    const recording = this.activeRecording();
    const state = recording?.state();

    if (
      !recording ||
      state !== 'error' ||
      !this.isRecording() ||
      this.isStopping()
    ) {
      return;
    }

    this.finishRecording();
    this.reportError(createCaptureError('recording-failed'));
  }

  /** Фиксирует таймер и сбрасывает UI-состояние записи. */
  private finishRecording(): void {
    this.finishElapsed();
    this.clearTimer();
    this.isRecording.set(false);
    this.isStopping.set(false);
    this.activeRecording.set(null);
  }

  /** Фиксирует elapsed на фактической длительности. */
  private finishElapsed(): void {
    this.elapsedMs.set(Math.max(0, Date.now() - this.startedAt));
  }

  /**
   * Лимит на момент старта: изменение `maxDuration` во время записи не влияет
   * на текущую запись. Некорректное значение — 30, отрицательное — 0,
   * больше 3600 — 3600.
   */
  private resolveDurationLimitMs(): number {
    const value = this.maxDuration();

    if (!Number.isFinite(value)) {
      return CLIP_RECORDER_DEFAULT_MAX_DURATION * 1000;
    }

    const seconds = Math.min(
      Math.max(value, CLIP_RECORDER_MIN_MAX_DURATION),
      CLIP_RECORDER_MAX_MAX_DURATION,
    );

    return seconds * 1000;
  }

  /** Создаёт интервал только в обработчике клика — SSR безопасен. */
  private startTimer(): void {
    this.clearTimer();
    this.timerId = setInterval(
      () => this.tick(),
      CLIP_RECORDER_TIMER_INTERVAL_MS,
    );
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /** Эмитит ошибку как `CaptureError`, оборачивая чужое исключение. */
  private reportError(error: unknown): void {
    if (this.destroyed) {
      return;
    }

    this.recordError.emit(
      isCaptureError(error)
        ? error
        : createCaptureError('recording-failed', error),
    );
  }

  /** На уничтожении: очистка интервала и отмена активной записи. */
  private cleanup(): void {
    this.destroyed = true;
    this.clearTimer();

    const recording = this.activeRecording();

    if (recording?.state() === 'recording') {
      recording.cancel();
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
