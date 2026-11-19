import {
  Directive,
  ElementRef,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import {
  DEFAULT_BRIGHTNESS_STEP,
  DEFAULT_SEEK_STEP,
  DEFAULT_THRESHOLD,
  DEFAULT_VOLUME_STEP,
} from './constants';
import {
  calculateGestureDelta,
  clampGestureDelta,
  resolveGestureAxis,
  roundGestureDelta,
  sanitizeGestureStep,
  sanitizeGestureThreshold,
  type GestureAxis,
} from './utils';
import { isInteractiveTarget } from '../utils';

/** Состояние одного отслеживаемого указателя. */
interface GestureSession {
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly width: number;
  readonly height: number;
  readonly startsOnLeft: boolean;
  axis: GestureAxis | null;
  dx: number;
  dy: number;
}

/**
 * Свайпы для плеера.
 *
 * Директива слушает Pointer Events на хост-элементе: горизонтальный свайп
 * эмитит `seek`, вертикальный — `volumeChange` (старт в правой половине) или
 * `brightnessChange` (старт в левой). Жест считается один раз, на `pointerup`;
 * во время движения выходы не эмитятся.
 *
 * Состояние плеера не хранится, `VideoService` и медиа-API не вызываются:
 * смещения применяет родитель. Директива не рендерит DOM, не владеет стилями,
 * фокусом и ARIA. Для touch потребитель ставит `touch-action: none` на хост,
 * иначе браузер заберёт жест под скролл.
 *
 * @example
 * ```html
 * <div
 *   class="player"
 *   ngxGesture
 *   (seek)="video.seekBy($event)"
 *   (volumeChange)="onVolumeChange($event)"
 *   (brightnessChange)="onBrightnessChange($event)"
 * >
 *   <video ngxVideo [src]="src" playsinline></video>
 * </div>
 * ```
 */
@Directive({
  selector: '[ngxGesture]',
  host: {
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerCancel($event)',
    '(lostpointercapture)': 'onLostPointerCapture($event)',
  },
})
export class GestureDirective {
  /** Выключает обработку жестов. */
  readonly enabled = input(true);

  /** Сколько секунд даёт горизонтальный свайп на полную ширину хоста. */
  readonly seekStep = input(DEFAULT_SEEK_STEP);

  /** Шаг громкости на полную высоту правой половины хоста. */
  readonly volumeStep = input(DEFAULT_VOLUME_STEP);

  /** Шаг яркости на полную высоту левой половины хоста. */
  readonly brightnessStep = input(DEFAULT_BRIGHTNESS_STEP);

  /** Минимальная длина свайпа в пикселях. */
  readonly threshold = input(DEFAULT_THRESHOLD);

  /** Горизонтальный свайп: смещение в секундах, со знаком. */
  readonly seek = output<number>();

  /** Вертикальный свайп в правой половине: смещение громкости, со знаком. */
  readonly volumeChange = output<number>();

  /** Вертикальный свайп в левой половине: смещение яркости, со знаком. */
  readonly brightnessChange = output<number>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly safeSeekStep = computed(() =>
    sanitizeGestureStep(this.seekStep(), DEFAULT_SEEK_STEP),
  );

  private readonly safeVolumeStep = computed(() =>
    sanitizeGestureStep(this.volumeStep(), DEFAULT_VOLUME_STEP),
  );

  private readonly safeBrightnessStep = computed(() =>
    sanitizeGestureStep(this.brightnessStep(), DEFAULT_BRIGHTNESS_STEP),
  );

  private readonly safeThreshold = computed(() =>
    sanitizeGestureThreshold(this.threshold()),
  );

  private session: GestureSession | null = null;

  /** Запоминает старт жеста и захватывает указатель. */
  protected onPointerDown(event: PointerEvent): void {
    if (
      !this.enabled() ||
      !event.isPrimary ||
      event.button !== 0 ||
      isInteractiveTarget(event.target) ||
      this.session !== null
    ) {
      return;
    }

    const rect = this.host.nativeElement.getBoundingClientRect();

    this.session = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      width: rect.width,
      height: rect.height,
      startsOnLeft: event.clientX - rect.left < rect.width / 2,
      axis: null,
      dx: 0,
      dy: 0,
    };

    this.capturePointer(event.pointerId);
  }

  /** Фиксирует ось после порога и запоминает смещение. */
  protected onPointerMove(event: PointerEvent): void {
    const session = this.session;
    if (!session || event.pointerId !== session.pointerId) {
      return;
    }

    if (!this.enabled()) {
      this.resetGesture();
      return;
    }

    const dx = event.clientX - session.startX;
    const dy = event.clientY - session.startY;

    if (session.axis === null) {
      const axis = resolveGestureAxis(dx, dy, this.safeThreshold());
      if (axis === null) {
        return;
      }

      session.axis = axis;
      event.preventDefault();
    }

    session.dx = dx;
    session.dy = dy;
  }

  /** Считает один итоговый delta и эмитит соответствующий выход. */
  protected onPointerUp(event: PointerEvent): void {
    const session = this.session;
    if (!session || event.pointerId !== session.pointerId) {
      return;
    }

    if (!this.enabled()) {
      this.resetGesture();
      return;
    }

    const { axis, dx, dy, width, height, startsOnLeft } = session;
    this.resetGesture();

    if (axis === null) {
      return;
    }

    if (axis === 'horizontal') {
      const delta = this.toDelta(dx, width, this.safeSeekStep());
      if (delta !== 0) {
        this.seek.emit(delta);
      }
      return;
    }

    const delta = this.toDelta(
      -dy,
      height,
      startsOnLeft ? this.safeBrightnessStep() : this.safeVolumeStep(),
    );

    if (delta === 0) {
      return;
    }

    if (startsOnLeft) {
      this.brightnessChange.emit(delta);
    } else {
      this.volumeChange.emit(delta);
    }
  }

  /** Отмена указателя: состояние сбрасывается без выхода. */
  protected onPointerCancel(event: PointerEvent): void {
    if (this.session?.pointerId !== event.pointerId) {
      return;
    }

    this.resetGesture();
  }

  /** Потеря pointer capture: состояние сбрасывается без выхода. */
  protected onLostPointerCapture(event: PointerEvent): void {
    if (this.session?.pointerId === event.pointerId) {
      this.session = null;
    }
  }

  /** Переводит смещение и размер хоста в округлённый clamp-делта. */
  private toDelta(offset: number, size: number, step: number): number {
    return roundGestureDelta(
      clampGestureDelta(calculateGestureDelta(offset, size, step), step),
    );
  }

  /** Захватывает указатель; без поддержки capture жест продолжается тихо. */
  private capturePointer(pointerId: number): void {
    try {
      this.host.nativeElement.setPointerCapture(pointerId);
    } catch {
      // Браузер не поддерживает capture или указатель уже завершился.
    }
  }

  /** Освобождает pointer capture, если он был установлен. */
  private releasePointerCapture(pointerId: number): void {
    try {
      if (this.host.nativeElement.hasPointerCapture(pointerId)) {
        this.host.nativeElement.releasePointerCapture(pointerId);
      }
    } catch {
      // Capture не устанавливался — освобождать нечего.
    }
  }

  /** Сбрасывает жест и освобождает захват без эмита. */
  private resetGesture(): void {
    const session = this.session;
    if (!session) {
      return;
    }

    this.session = null;
    this.releasePointerCapture(session.pointerId);
  }
}
