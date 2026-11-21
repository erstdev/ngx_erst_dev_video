import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  VideoDirective,
  VideoService,
  formatTime,
  type VideoError,
  type VideoState,
} from '@erst_dev/ngx-video-core';

import { LocaleService } from '../../../i18n/locale.service';
import { CodeSnippetComponent } from '../../shared/code-snippet/code-snippet';

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
 * Демо для VideoService: сырой `<video>`, управляемый через сервис.
 *
 * Здесь нет ни одного компонента-«кирпича» — только сервис, директива
 * и нативные контролы браузера. Под примерами — блоки с готовым кодом.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-video-service-demo',
  imports: [AsyncPipe, CodeSnippetComponent, RouterLink, VideoDirective],
  templateUrl: './video-service-demo.html',
  styleUrl: './video-service-demo.scss',
})
export class VideoServiceDemo {
  protected readonly video = inject(VideoService);
  protected readonly i18n = inject(LocaleService);

  protected readonly formatTime = formatTime;

  protected readonly rates = [0.5, 1, 1.5, 2];

  protected apiLink(): string {
    return `/${this.i18n.locale()}/docs/core`;
  }

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    setup: `// player.component.ts
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';

@Component({
  selector: 'app-player',
  imports: [VideoDirective],
  templateUrl: './player.component.html',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';
}

<!-- player.component.html -->
<video ngxVideo [src]="src" playsinline></video>`,

    commands: `<!-- player.component.html -->
<button type="button" (click)="video.toggle()">
  {{ video.isPlaying() ? 'Пауза' : 'Играть' }}
</button>

<input
  type="range"
  min="0"
  [max]="video.duration()"
  [value]="video.time()"
  (input)="onSeek($event)"
/>

<button type="button" (click)="video.toggleMute()">Звук</button>
<button type="button" (click)="video.toggleFullscreen()">Фуллскрин</button>

// player.component.ts
protected onSeek(event: Event): void {
  this.video.seek(Number((event.target as HTMLInputElement).value));
}`,

    reactivity: `<!-- сигналы: шаблон обновляется сам -->
<span>{{ video.time() }} / {{ video.duration() }}</span>
<span>state: {{ video.state() }}</span>

// Observable-зеркало — когда нужны операторы RxJS
import { toSignal } from '@angular/core/rxjs-interop';

readonly buffered = toSignal(inject(VideoService).buffered$, {
  initialValue: 0,
});

<!-- либо напрямую в шаблоне -->
<span>{{ video.time$ | async }}</span>`,

    multiple: `@Component({
  selector: 'app-player',
  imports: [VideoDirective],
  // свой экземпляр сервиса на каждый плеер
  providers: [VideoService],
  templateUrl: './player.component.html',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
}

<!-- без providers все <video ngxVideo> делили бы один root-сервис,
     и состояние перескакивало бы между элементами -->`,

    errors: `<!-- ошибка нормализована: код + сообщение -->
@if (video.error(); as error) {
  <p role="alert">{{ error.message }} ({{ error.code }})</p>
}

// повторный запуск после ошибки
protected retry(): void {
  this.video.seek(0);
  void this.video.play();
}`,
  } as const;

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
