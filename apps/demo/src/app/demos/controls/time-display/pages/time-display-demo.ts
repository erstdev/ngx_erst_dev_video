import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { TimeDisplayComponent } from '@erst_dev/ngx-video-controls';

import { CodeSnippetComponent } from '../../../../components/code-snippet/code-snippet';
import { DemoShellComponent } from '../../../../components/demo-shell/demo-shell';

/**
 * Демо для TimeDisplayComponent.
 *
 * Три сценария: живой вывод времени из `VideoService`, стилизация через
 * `customClass` и статичный пример с часами, чтобы показать формат `ч:мм:сс`.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-time-display-demo',
  imports: [
    CodeSnippetComponent,
    DemoShellComponent,
    TimeDisplayComponent,
    VideoDirective,
  ],
  templateUrl: './time-display-demo.html',
  styleUrl: './time-display-demo.scss',
})
export class TimeDisplayDemo {
  protected readonly video = inject(VideoService);

  protected readonly src =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  /** Статичные значения длиннее часа: `formatTime` покажет `ч:мм:сс`. */
  protected readonly longCurrent = 3725;
  protected readonly longDuration = 7325;

  protected readonly responsibilities = [
    'Входы: currentTime, duration, customClass; выходов нет.',
    'Формат: мм:сс, а для значений больше часа — ч:мм:сс; некорректные числа — 00:00.',
    'Форматирование — общая утилита formatTime из core.',
    'Не следит за видео и не запрашивает данные у VideoService: значения приходят через входы.',
  ];

  /** Рецепты для блоков «Код примера». */
  protected readonly code = {
    basic: `// player.component.ts
readonly video = inject(VideoService);

<!-- player.component.html -->
<video ngxVideo [src]="src" playsinline></video>

<ngx-time-display
  [currentTime]="video.time()"
  [duration]="video.duration()"
/>`,

    custom: `<!-- player.component.html -->
<ngx-time-display
  customClass="my-time"
  [currentTime]="video.time()"
  [duration]="video.duration()"
/>

/* player.component.scss — scoped-стили, без ::ng-deep */
.my-time {
  --ngx-time-color: #34d399;
  --ngx-time-separator-color: rgba(52, 211, 153, 0.6);
  --ngx-time-font-size: 1rem;
  --ngx-time-gap: 0.4rem;
}`,

    long: `<!-- статичные значения: formatTime сам добавит часы -->
<ngx-time-display [currentTime]="3725" [duration]="7325" />

<!-- на экране: 1:02:05 / 2:02:05 -->`,
  } as const;
}
