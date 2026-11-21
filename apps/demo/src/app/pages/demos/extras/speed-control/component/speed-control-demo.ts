import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { SpeedControlComponent } from '@erst_dev/ngx-video-extras';

import { CodeSnippetComponent } from '../../../shared/code-snippet/code-snippet';
import { DemoShellComponent } from '../../../shared/demo-shell/demo-shell';
import {
  CUSTOM_RATES,
  DEFAULT_RATES,
} from '../constants/speed-control-demo.constants';

/**
 * Демо для SpeedControlComponent.
 *
 * Один живой плеер и три блока «Код примера»: базовая разметка, применение
 * скорости через `VideoService` и стилизация через `customClass` +
 * CSS-переменные. Переключатель `rates` показывает, что текущая скорость
 * добавляется в конец списка, если её нет среди доступных.
 */
@Component({
  selector: 'app-speed-control-demo',
  imports: [
    CodeSnippetComponent,
    DemoShellComponent,
    SpeedControlComponent,
    VideoDirective,
  ],
  providers: [VideoService],
  templateUrl: './speed-control-demo.html',
  styleUrl: './speed-control-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeedControlDemo {
  protected readonly video = inject(VideoService);

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  protected readonly useCustomRates = signal(false);
  protected readonly useCustomClass = signal(false);

  protected readonly rates = computed<readonly number[]>(() =>
    this.useCustomRates() ? CUSTOM_RATES : DEFAULT_RATES,
  );

  protected readonly speedClass = computed(() =>
    this.useCustomClass() ? 'demo-speed' : '',
  );

  protected readonly isPlaying = computed(() => {
    const state = this.video.state();
    return state === 'playing' || state === 'buffering';
  });

  protected readonly responsibilities = [
    'Входы: playbackRate, rates, customClass; выход: rateChange.',
    'Не хранит состояние, не вызывает setPlaybackRate() и не знает о VideoService.',
    'Если текущей скорости нет в rates, она добавляется в конец списка.',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
readonly video = inject(VideoService);
readonly rates = signal<readonly number[]>([0.5, 1, 1.5, 2]);

<!-- player.component.html -->
<ngx-speed-control
  [playbackRate]="video.playbackRate()"
  [rates]="rates()"
  [customClass]="speedClass()"
  (rateChange)="onRateChange($event)"
/>`,

    apply: `// player.component.ts
readonly video = inject(VideoService);

protected onRateChange(rate: number): void {
  this.video.setPlaybackRate(rate);
}

<!-- player.component.html -->
<ngx-speed-control
  [playbackRate]="video.playbackRate()"
  (rateChange)="onRateChange($event)"
/>`,

    custom: `<!-- player.component.html -->
<ngx-speed-control
  customClass="my-speed"
  [playbackRate]="video.playbackRate()"
  [rates]="rates()"
  (rateChange)="onRateChange($event)"
/>

/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-speed {
  --ngx-speed-bg: #064e3b;
  --ngx-speed-color: #d1fae5;
  --ngx-speed-border-color: #059669;
  --ngx-speed-border-radius: 999px;
  --ngx-speed-padding: 0.375rem 0.75rem;
  --ngx-speed-font-size: 0.875rem;
  --ngx-speed-focus-color: #34d399;
}`,
  } as const;

  protected onRateChange(rate: number): void {
    this.video.setPlaybackRate(rate);
  }

  protected togglePlay(): void {
    this.video.toggle();
  }

  protected toggleCustomRates(): void {
    this.useCustomRates.update((value) => !value);
  }

  protected toggleCustomClass(): void {
    this.useCustomClass.update((value) => !value);
  }
}
