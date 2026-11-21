# @erst_dev/ngx-video-controls

Готовые контролы для плеера `ngx-video`. Каждый компонент — самостоятельный
«кирпич»: состояние приходит через входы, действия уходят через выходы, а внешний
вид настраивается CSS-переменными, `customClass` и `ng-template`.

Пакет **не управляет** медиа-элементом и **не знает** о `VideoService`: связывание
делает родительский компонент. Благодаря этому один и тот же контрол работает и с
`core`, и с любым собственным состоянием.

## Кирпичи

Подробная документация каждого кирпича лежит рядом с его компонентом. На сайте
она открывается в разделе `/docs`.

| Компонент                     | Селектор                  | Что решает                                               | Документация                                               |
| ----------------------------- | ------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| `PlayButtonComponent`         | `ngx-play-button`         | Кнопка Play/Pause, иконка по состоянию, выход `toggle`   | [README](src/lib/components/play-button/README.md)         |
| `VolumeSliderComponent`       | `ngx-volume-slider`       | Ползунок громкости `0…1`, выход `volumeChange`           | [README](src/lib/components/volume-slider/README.md)       |
| `TimeDisplayComponent`        | `ngx-time-display`        | Текущее время и длительность через `formatTime`          | [README](src/lib/components/time-display/README.md)        |
| `FullscreenButtonComponent`   | `ngx-fullscreen-button`   | Кнопка входа/выхода из fullscreen, выход `toggle`        | [README](src/lib/components/fullscreen-button/README.md)   |
| `BufferingIndicatorComponent` | `ngx-buffering-indicator` | Спиннер по состоянию `buffering`, задержка и свой шаблон | [README](src/lib/components/buffering-indicator/README.md) |

## Требования

- Angular 22+
- `@erst_dev/ngx-video-core` (peer-зависимость)

Пакет пока не опубликован в npm (рабочая версия `0.0.1`). Внутри монорепо
подключается через `paths` в `tsconfig.base.json`.

## Установка

```sh
npm install @erst_dev/ngx-video-controls
```

## Быстрый старт

```typescript
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { PlayButtonComponent } from '@erst_dev/ngx-video-controls';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, PlayButtonComponent],
  template: `
    <video ngxVideo [src]="src"></video>
    <ngx-play-button [state]="video.state()" (toggle)="video.toggle()" />
  `,
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';
}
```

Кнопка только показывает состояние и сообщает о клике. Что именно делать — решает
родитель: в примере выше он вызывает `video.toggle()`.

## Стилизация: как это работает

У компонентов две точки кастомизации, и они дополняют друг друга:

- **CSS-переменные на элементе** — общая тема для всех экземпляров:
  `ngx-play-button { --ngx-play-size: 64px; }`.
- **`customClass`** — точечная стилизация конкретного экземпляра и его
  хост-элемента: раскладка, рамка, отступы, повышение специфичности.

Если одна и та же переменная задана в обоих местах, сработает более специфичный
селектор: `.my-button` переопределит `ngx-play-button`, а остальные переменные с
элемента продолжат действовать. Это обычный каскад CSS, конфликта нет.
`border`/`padding` из `customClass` применяются к хосту, а не к внутренней
разметке компонента.

Подробные таблицы переменных и примеры — в README каждого кирпича.

## Полный плеер

Собрать плеер можно из готовых контролов. Живой пример — страница
`/controls/player` в демо-приложении.

Каждому плееру нужен собственный экземпляр `VideoService` — добавьте
`providers: [VideoService]` в компонент плеера.

```html
<div #player class="player" [class.player--show-controls]="!video.isPlaying()">
  <video class="player__video" ngxVideo [src]="src" preload="metadata" playsinline (click)="video.toggle()"></video>

  @if (showCenterPlay()) {
  <ngx-play-button customClass="player__center-play" [state]="video.state()" (toggle)="video.toggle()" />
  }

  <div class="player__buffering">
    <ngx-buffering-indicator [state]="video.state()" [delay]="200" />
  </div>

  <div class="player__bar">
    <ngx-play-button customClass="player__control" [state]="video.state()" (toggle)="video.toggle()" />

    <button type="button" class="player__mute" [attr.aria-label]="muteLabel()" [attr.aria-pressed]="video.muted()" (click)="video.toggleMute()">
      <!-- иконка mute / звука -->
    </button>

    <ngx-volume-slider customClass="player__volume" [volume]="video.volume()" (volumeChange)="video.setVolume($event)" />

    <ngx-time-display customClass="player__time" [currentTime]="video.time()" [duration]="video.duration()" />

    <span class="player__spacer"></span>

    <ngx-fullscreen-button customClass="player__control" [fullscreen]="isFullscreen()" (toggle)="toggleFullscreen()" />
  </div>
</div>
```

```typescript
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { BufferingIndicatorComponent, FullscreenButtonComponent, PlayButtonComponent, TimeDisplayComponent, VolumeSliderComponent } from '@erst_dev/ngx-video-controls';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, PlayButtonComponent, VolumeSliderComponent, TimeDisplayComponent, FullscreenButtonComponent, BufferingIndicatorComponent],
  providers: [VideoService],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  readonly video = inject(VideoService);

  private readonly player = viewChild.required<ElementRef<HTMLElement>>('player');

  readonly isFullscreen = signal(false);

  readonly showCenterPlay = computed(() => {
    const state = this.video.state();
    return state === 'idle' || state === 'paused' || state === 'ended' || state === 'error';
  });

  readonly muteLabel = computed(() => (this.video.muted() ? 'Включить звук' : 'Выключить звук'));

  constructor() {
    fromEvent(document, 'fullscreenchange')
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.syncFullscreen());
  }

  async toggleFullscreen(): Promise<void> {
    const element = this.player().nativeElement;

    try {
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
      } else {
        await element.requestFullscreen();
      }
    } catch {
      // Браузер может отказать — состояние останется прежним.
    }
  }

  private syncFullscreen(): void {
    this.isFullscreen.set(document.fullscreenElement === this.player().nativeElement);
  }
}
```

```scss
.player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 0.75rem;
  background: #000;
}

.player__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.player__center-play {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  transform: translate(-50%, -50%);
}

.player__buffering {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.player__bar {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 0.75rem 0.75rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.player:hover .player__bar,
.player:focus-within .player__bar,
.player--show-controls .player__bar {
  opacity: 1;
}

.player:fullscreen {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  aspect-ratio: auto;
}
```

Полные стили, включая адаптивную панель и размеры контролов, — в исходниках
демо-плеера.

### Fullscreen на контейнер, а не на видео

`VideoService.toggleFullscreen()` запрашивает fullscreen у самого `<video>`.
В этом режиме панель управления, лежащая рядом с видео, в полноэкранный элемент
не попадает. Чтобы контролы оставались доступны, запрашивайте fullscreen у
контейнера `.player`:

- состояние храните в локальном сигнале демо-плеера;
- синхронизируйте его по `fullscreenchange`, сравнивая
  `document.fullscreenElement` с контейнером;
- кнопке передавайте локальный сигнал, а не `video.fullscreen()`.

Публичный API `core` при этом не меняется.

## Несколько плееров на странице

`VideoService` по умолчанию `providedIn: 'root'` — этого достаточно для одного
плеера. Если плееров несколько, добавьте `providers: [VideoService]` в компонент
каждого плеера: директива внутри его шаблона получит локальный экземпляр, и
состояния не будут смешиваться.

## Утилиты

Пакет экспортирует чистые функции, которые используются компонентами и доступны
потребителям.

### `clamp`

```typescript
clamp(value: number, min: number, max: number): number;
```

Зажимает число в диапазон `min…max`. Некорректные значения (`NaN`, `Infinity`)
превращаются в `min`, чтобы в стилях, атрибутах и вычислениях не появлялся `NaN`.

## Совместимость

Имена входов, выходов, селекторы и CSS-переменные — часть публичного контракта,
ломающие изменения только в мажорной версии. Пока версия `0.x`, API может меняться
в минорных релизах.

## Лицензия

MIT

---

Документация ядра: [@erst_dev/ngx-video-core](../core/README.md).
