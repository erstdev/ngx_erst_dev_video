import { Directive, computed, input, output } from '@angular/core';

import { ARIA_KEYSHORTCUTS } from './constants';
import { isInteractiveTarget } from '../utils';

/**
 * Горячие клавиши плеера.
 *
 * Директива слушает `keydown` на хост-элементе и переводит клавиши в выходы:
 * Space — `togglePlay`, стрелки — `seekBy`/`volumeChange`, F — `toggleFullscreen`,
 * M — `toggleMute`. preventDefault вызывается только для распознанных клавиш,
 * чтобы Space и стрелки не прокручивали страницу.
 *
 * Состояния директива не хранит, `VideoService` и медиа-API не вызывает:
 * применять команды должен родитель. Хост должен быть фокусируемым —
 * `tabindex="0"` ставит потребитель; директива фокусом не управляет.
 *
 * События игнорируются, если директива выключена (`enabled`), нажат Ctrl, Meta
 * или Alt, событие уже отменено, цель — интерактивный контрол или (для
 * переключающих команд) клавиша удерживается (`event.repeat`).
 *
 * @example
 * ```html
 * <div
 *   class="player"
 *   ngxKeyboardShortcuts
 *   tabindex="0"
 *   (togglePlay)="video.toggle()"
 *   (seekBy)="video.seekBy($event)"
 *   (volumeChange)="onVolumeChange($event)"
 *   (toggleMute)="video.toggleMute()"
 *   (toggleFullscreen)="video.toggleFullscreen()"
 * >
 *   <video ngxVideo [src]="src" playsinline></video>
 * </div>
 * ```
 */
@Directive({
  selector: '[ngxKeyboardShortcuts]',
  host: {
    '(keydown)': 'onKeydown($event)',
    '[attr.aria-keyshortcuts]': 'ariaKeyshortcuts()',
  },
})
export class KeyboardShortcutsDirective {
  /** Шаг перемотки стрелками в секундах. */
  readonly seekStep = input(5);

  /** Шаг громкости стрелками вверх/вниз. */
  readonly volumeStep = input(0.1);

  /** Выключает обработку клавиш и снимает `aria-keyshortcuts`. */
  readonly enabled = input(true);

  /** Space: переключить воспроизведение. */
  readonly togglePlay = output<void>();

  /** Стрелки влево/вправо: смещение в секундах. */
  readonly seekBy = output<number>();

  /** Стрелки вверх/вниз: смещение громкости. */
  readonly volumeChange = output<number>();

  /** M: переключить беззвучный режим. */
  readonly toggleMute = output<void>();

  /** F: переключить полноэкранный режим. */
  readonly toggleFullscreen = output<void>();

  /** `aria-keyshortcuts` только пока директива включена. */
  protected readonly ariaKeyshortcuts = computed(() =>
    this.enabled() ? ARIA_KEYSHORTCUTS : null,
  );

  /** Обработчик `keydown` хост-элемента; вызывается хост-биндингом. */
  protected onKeydown(event: KeyboardEvent): void {
    if (
      !this.enabled() ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.defaultPrevented ||
      isInteractiveTarget(event.target)
    ) {
      return;
    }

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        if (!event.repeat) {
          this.togglePlay.emit();
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        this.seekBy.emit(this.seekStep());
        break;

      case 'ArrowLeft':
        event.preventDefault();
        this.seekBy.emit(-this.seekStep());
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.volumeChange.emit(this.volumeStep());
        break;

      case 'ArrowDown':
        event.preventDefault();
        this.volumeChange.emit(-this.volumeStep());
        break;

      case 'KeyF':
        event.preventDefault();
        if (!event.repeat) {
          this.toggleFullscreen.emit();
        }
        break;

      case 'KeyM':
        event.preventDefault();
        if (!event.repeat) {
          this.toggleMute.emit();
        }
        break;
    }
  }
}
