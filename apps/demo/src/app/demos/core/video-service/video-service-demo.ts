import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import {
  VideoDirective,
  VideoService,
  formatTime,
  type VideoError,
  type VideoState,
} from '@erst_dev/ngx-video-core';

/** Человекочитаемые подписи для значений `VideoState`. */
const STATE_LABELS: Readonly<Record<VideoState, string>> = {
  idle: 'idle — нет данных',
  playing: 'playing — воспроизведение',
  paused: 'paused — пауза',
  buffering: 'buffering — буферизация',
  seeking: 'seeking — перемотка',
  ended: 'ended — завершено',
  error: 'error — ошибка',
};

/**
 * Демо Спринта 1: сырой `<video>`, управляемый через `VideoService`.
 *
 * Здесь нет ни одного компонента-«кирпича» — только сервис, директива
 * и нативные контролы браузера.
 */
@Component({
  selector: 'app-video-service-demo',
  imports: [AsyncPipe, VideoDirective],
  templateUrl: './video-service-demo.html',
  styleUrl: './video-service-demo.scss',
})
export class VideoServiceDemo {
  protected readonly video = inject(VideoService);

  protected readonly formatTime = formatTime;

  protected readonly rates = [0.5, 1, 1.5, 2];

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  /** Время: `мм:сс` плюс точное значение в секундах. */
  protected timeValue(seconds: number | null | undefined): string {
    if (seconds === null || seconds === undefined) {
      return '—';
    }

    return `${formatTime(seconds)} (${seconds.toFixed(2)} с)`;
  }

  /** Состояние плеера с расшифровкой. */
  protected stateValue(state: VideoState | null): string {
    return state === null ? '—' : STATE_LABELS[state];
  }

  /** Громкость: доля и проценты. */
  protected volumeValue(volume: number | null): string {
    return volume === null
      ? '—'
      : `${volume.toFixed(2)} (${Math.round(volume * 100)} %)`;
  }

  /** Прогресс просмотра в процентах. */
  protected progressValue(progress: number | null): string {
    return progress === null ? '—' : `${(progress * 100).toFixed(1)} %`;
  }

  /** Скорость воспроизведения. */
  protected rateValue(rate: number | null): string {
    return rate === null ? '—' : `${rate}x`;
  }

  /** Булевы флаги. */
  protected yesNo(value: boolean | null): string {
    return value === null ? '—' : value ? 'да' : 'нет';
  }

  /** Ошибка: код и сообщение. */
  protected errorValue(error: VideoError | null | undefined): string {
    return error ? `${error.code} — ${error.message}` : '—';
  }

  protected onSeek(event: Event): void {
    this.video.seek(Number((event.target as HTMLInputElement).value));
  }

  protected onVolume(event: Event): void {
    this.video.setVolume(Number((event.target as HTMLInputElement).value));
  }

  protected onRate(event: Event): void {
    this.video.setPlaybackRate(
      Number((event.target as HTMLSelectElement).value),
    );
  }
}
