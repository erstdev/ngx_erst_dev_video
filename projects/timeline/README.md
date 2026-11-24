# @erst_dev/ngx-video-timeline

Таймлайн для плеера `ngx-video`: полоса перемотки, превью кадра и метки глав.
Каждый компонент — самостоятельный «кирпич», который не управляет медиа и не
знает о `VideoService`: состояние приходит через входы, действия уходят через
выходы.

## Кирпичи

Подробная документация каждого кирпича лежит рядом с компонентом. На сайте она
открывается в разделе `/docs`.

| Компонент                  | Селектор               | Что решает                                     | Документация                                            |
| -------------------------- | ---------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| `TimelineComponent`        | `ngx-timeline`         | Прогресс, буфер, клик/drag/клавиатура, `seek`  | [README](src/lib/components/timeline/README.md)         |
| `TimelinePreviewComponent` | `ngx-timeline-preview` | Кадр под курсором через скрытое видео и canvas | [README](src/lib/components/timeline-preview/README.md) |
| `ChapterMarkersComponent`  | `ngx-chapter-markers`  | Метки глав, активная глава, `chapterSelect`    | [README](src/lib/components/chapter-markers/README.md)  |

## Требования

- Angular 22+
- `@erst_dev/ngx-video-core` (peer-зависимость)

Пакет пока не опубликован в npm (готовится версия `1.0.0`). Внутри монорепо
подключается через `paths` в `tsconfig.base.json`.

## Установка

```sh
npm install @erst_dev/ngx-video-timeline
```

## Быстрый старт

```typescript
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { TimelineComponent } from '@erst_dev/ngx-video-timeline';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, TimelineComponent],
  template: `
    <video ngxVideo [src]="src" (click)="video.toggle()"></video>

    <ngx-timeline [currentTime]="video.time()" [duration]="video.duration()" [buffered]="video.buffered()" (seek)="video.seek($event)" />
  `,
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';
}
```

Таймлайн только рисует состояние и сообщает о жестах. Перемотку применяет
родитель.

## Полный пример: таймлайн, превью и главы

```html
<div class="player">
  <video ngxVideo [src]="src" playsinline (click)="video.toggle()"></video>

  <div class="player__timeline">
    <div class="player__timeline-track">
      <ngx-timeline [currentTime]="video.time()" [duration]="video.duration()" [buffered]="video.buffered()" [previewTemplate]="preview" (seek)="video.seek($event)" />

      <ngx-chapter-markers [chapters]="chapters" [duration]="video.duration()" [currentTime]="video.time()" (chapterSelect)="video.seek($event.time)" />
    </div>
  </div>
</div>

<ng-template #preview let-time="time">
  <ngx-timeline-preview [time]="time" [src]="src" />
</ng-template>
```

```scss
.player {
  position: relative;
  background: #000;
}

.player__timeline {
  padding: 0 0.75rem 0.5rem;
}

.player__timeline-track {
  position: relative;
}
```

```typescript
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { ChapterMarkersComponent, TimelineComponent, TimelinePreviewComponent, type ChapterInterface } from '@erst_dev/ngx-video-timeline';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, TimelineComponent, TimelinePreviewComponent, ChapterMarkersComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';

  readonly chapters: readonly ChapterInterface[] = [
    { id: 'intro', time: 0, title: 'Вступление' },
    { id: 'main', time: 120, title: 'Основная часть' },
    { id: 'finale', time: 300, title: 'Финал' },
  ];
}
```

Живой пример — страницы `/timeline/timeline`, `/timeline/timeline-preview` и
`/timeline/chapter-markers` в демо-приложении.

## Поведение таймлайна

Базовая версия использует вариант A:

- во время перетаскивания двигается только локальный `dragTime`;
- `seek` эмитится один раз — при отпускании;
- `scrubStart` и `scrubEnd` отмечают границы жеста и позволяют родителю
  поставить паузу и возобновить воспроизведение.

Live-scrub (непрерывный `seek` во время drag) появится позже отдельным шагом.

## Превью кадров

`TimelinePreviewComponent` создаёт отдельное скрытое `<video>`, перематывает
только его и рисует кадр в canvas. Основной плеер не затрагивается.

- `enabled = false` полностью отключает превью: скрытое видео не создаётся;
- `previewSrc` позволяет передать лёгкий источник для превью;
- canvas используется только для показа, поэтому CORS нужен лишь для чтения
  пикселей и кэша data URL;
- при ошибке остаётся заглушка со временем.

Ограничения Спринта 3: прогрессивное MP4/WebM; HLS/DASH требуют пакета
`sources`.

## Главы

Маркеры — отдельный абсолютный слой над таймлайном. Родительский контейнер
должен быть `position: relative` и совпадать по высоте с таймлайном.

`chapterSelect` отдаёт полный `ChapterInterface`, поэтому родитель сразу
получает `time`, `title` и `id`:

```html
<ngx-chapter-markers [chapters]="chapters" [duration]="video.duration()" [currentTime]="video.time()" (chapterSelect)="video.seek($event.time)" />
```

## Стилизация

У всех компонентов есть CSS-переменные с дефолтами в `:host` и вход
`customClass`, который вешается на хост-элемент. Подробные таблицы — в README
кирпичей.

```scss
ngx-timeline {
  --ngx-timeline-height: 6px;
  --ngx-timeline-progress-color: #34d399;
  --ngx-timeline-thumb-color: #34d399;
}

ngx-chapter-markers {
  --ngx-timeline-chapter-color: #34d399;
  --ngx-timeline-chapter-active-color: #6ee7b7;
}

ngx-timeline-preview {
  --ngx-timeline-preview-width: 200px;
}
```

## Совместимость

Селекторы, входы, выходы и CSS-переменные — публичный контракт. Пока версия
`0.x`, API может меняться в минорных релизах; ломающие изменения — только в
мажорной версии.

## Лицензия

MIT

---

Документация ядра: [@erst_dev/ngx-video-core](../core/README.md).
