# @erst_dev/ngx-video-controls

Готовые контролы для плеера `ngx-video`. Каждый компонент — самостоятельный
«кирпич»: состояние приходит через входы, действия уходят через выходы, а внешний
вид настраивается CSS-переменными, `customClass` и `ng-template`.

Пакет **не управляет** медиа-элементом и **не знает** о `VideoService`: связывание
делает родительский компонент. Благодаря этому один и тот же контрол работает и с
`core`, и с любым собственным состоянием.

## Что уже есть

| Компонент                     | Селектор                  | Статус   |
| ----------------------------- | ------------------------- | -------- |
| `PlayButtonComponent`         | `ngx-play-button`         | ✅ готов |
| `VolumeSliderComponent`       | `ngx-volume-slider`       | ⏳ план  |
| `TimeDisplayComponent`        | `ngx-time-display`        | ⏳ план  |
| `FullscreenButtonComponent`   | `ngx-fullscreen-button`   | ⏳ план  |
| `BufferingIndicatorComponent` | `ngx-buffering-indicator` | ⏳ план  |

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

## PlayButtonComponent

Кнопка Play/Pause. Показывает иконку по переданному состоянию и сообщает наружу о
клике.

```html
<ngx-play-button [state]="video.state()" (toggle)="video.toggle()" />
```

### Входы

| Вход           | Тип                                          | По умолчанию | Описание                                                             |
| -------------- | -------------------------------------------- | ------------ | -------------------------------------------------------------------- |
| `state`        | `VideoState`                                 | — (required) | Текущее состояние плеера; по нему выбирается иконка и подпись        |
| `customClass`  | `string`                                     | `''`         | Дополнительный CSS-класс для хост-элемента `<ngx-play-button>`       |
| `ariaLabel`    | `string \| null`                             | `null`       | Переопределение `aria-label`; по умолчанию «Воспроизвести» / «Пауза» |
| `iconTemplate` | `TemplateRef<PlayButtonIconContext> \| null` | `null`       | Пользовательская иконка вместо стандартной                           |

### Выходы

| Выход    | Тип    | Описание                                                                                                           |
| -------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| `toggle` | `void` | Клик по кнопке. Может совпадать с именем нативного DOM-события `toggle` — это безопасно, так как элемент кастомный |

### Поведение по состояниям

`playing = state === 'playing' || state === 'buffering'` — во время буферизации
кнопка показывает паузу, потому что воспроизведение уже запущено.

| `state`     | Иконка   | `aria-pressed` | `aria-label` по умолчанию |
| ----------- | -------- | -------------- | ------------------------- |
| `idle`      | ▶ play  | `false`        | Воспроизвести             |
| `playing`   | ⏸ pause | `true`         | Пауза                     |
| `buffering` | ⏸ pause | `true`         | Пауза                     |
| `paused`    | ▶ play  | `false`        | Воспроизвести             |
| `seeking`   | ▶ play  | `false`        | Воспроизвести             |
| `ended`     | ▶ play  | `false`        | Воспроизвести             |
| `error`     | ▶ play  | `false`        | Воспроизвести             |

Своя логика не требуется: компонент полностью управляется входом `state`.

### CSS-переменные

Все значения заданы в `:host`, поэтому контрол работает из коробки и
переопределяется без правки исходников.

| Переменная                 | По умолчанию         | Описание                                          |
| -------------------------- | -------------------- | ------------------------------------------------- |
| `--ngx-play-size`          | `48px`               | Размер кнопки (квадрат)                           |
| `--ngx-play-icon-size`     | `55%`                | Размер стандартной SVG-иконки относительно кнопки |
| `--ngx-play-color`         | `#ffffff`            | Цвет иконки                                       |
| `--ngx-play-bg`            | `rgba(0, 0, 0, 0.7)` | Фон кнопки                                        |
| `--ngx-play-hover-bg`      | `rgba(0, 0, 0, 0.9)` | Фон при наведении                                 |
| `--ngx-play-border-radius` | `50%`                | Скругление                                        |
| `--ngx-play-transition`    | `0.15s ease`         | Переход фона и цвета                              |

`--ngx-play-icon-size` действует только на стандартную SVG-иконку. Содержимое
`iconTemplate` компонент не масштабирует — его размер задаётся вашими стилями.

### Стилизация

Переопределение на самом компоненте:

```scss
ngx-play-button {
  --ngx-play-size: 64px;
  --ngx-play-bg: #059669;
  --ngx-play-hover-bg: #047857;
  --ngx-play-border-radius: 12px;
}
```

Через `customClass` — класс вешается на **хост-элемент** `<ngx-play-button>`:

```html
<ngx-play-button customClass="my-play" [state]="video.state()" (toggle)="video.toggle()" />
```

```scss
/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-play {
  --ngx-play-size: 72px;
  --ngx-play-bg: #ffffff;
  --ngx-play-color: #111827;
  --ngx-play-hover-bg: #e5e7eb;
}
```

Это работает без `::ng-deep` и без глобальных стилей: хост-элемент создаётся в
шаблоне потребителя и получает его атрибут инкапсуляции, а CSS-переменные
наследуются внутрь компонента. Глобальные стили тоже подходят, но не обязательны.

`customClass` не затрагивает классы, заданные на элементе вручную:
`<ngx-play-button class="layout-wide" customClass="my-play">` сохранит оба.

Пример «светлой» темы:

```scss
ngx-play-button {
  --ngx-play-color: #111827;
  --ngx-play-bg: rgba(255, 255, 255, 0.9);
  --ngx-play-hover-bg: #ffffff;
}
```

Пример квадратной кнопки:

```scss
ngx-play-button {
  --ngx-play-border-radius: 12px;
}
```

### Своя иконка

```html
<ngx-play-button [state]="video.state()" [iconTemplate]="myIcon" (toggle)="video.toggle()" />

<ng-template #myIcon let-playing="playing" let-state="state">
  <span class="my-icon">{{ playing ? '⏸' : '▶' }}</span>
</ng-template>
```

В шаблон передаётся контекст:

```typescript
interface PlayButtonIconContext {
  readonly state: VideoState;
  readonly playing: boolean;
}
```

Пользовательский шаблон рендерится внутри кнопки вместо стандартной SVG-иконки;
размер контейнера и цвета по-прежнему задаются CSS-переменными.

### Доступность

- Рендерится нативный `<button type="button">` — Enter/Space, фокус и семантика
  кнопки работают без дополнительного кода.
- `aria-label` вычисляется из состояния (`Воспроизвести`/`Пауза`) и
  переопределяется входом `ariaLabel`.
- `aria-pressed` отражает, идёт ли воспроизведение.
- SVG-иконки помечены `aria-hidden="true"` и `focusable="false"`, чтобы не
  попадать в дерево доступности.
- Видимый `:focus-visible` outline.
- При `prefers-reduced-motion: reduce` переходы отключаются.

### SSR

Компонент не обращается к DOM API: в шаблоне только привязки и SVG, поэтому
безопасно рендерится на сервере вместе с остальным плеером.

## Размещение на плеере

Кнопка не знает, где находится: layout — задача контейнера плеера. Компонент
рендерит обычный элемент в потоке, поэтому позиционируется стандартным CSS —
без специальных входов и без `::ng-deep`.

### По центру видео

```html
<div class="player">
  <video ngxVideo [src]="src" playsinline></video>

  <ngx-play-button customClass="player__play" [state]="video.state()" (toggle)="video.toggle()" />
</div>
```

```scss
.player {
  position: relative;
  background: #000;
}

.player__play {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  transform: translate(-50%, -50%);

  --ngx-play-size: 72px;
  --ngx-play-bg: rgba(0, 0, 0, 0.5);
  --ngx-play-hover-bg: rgba(0, 0, 0, 0.75);
}
```

### В нижней панели, как в YouTube и VK

```html
<div class="player">
  <video ngxVideo [src]="src" playsinline></video>

  <div class="player__controls">
    <ngx-play-button [state]="video.state()" (toggle)="video.toggle()" />
    <!-- здесь появятся volume-slider, time-display, fullscreen-button -->
  </div>
</div>
```

```scss
.player {
  position: relative;
}

.player__controls {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.player:hover .player__controls,
.player:focus-within .player__controls {
  opacity: 1;
}
```

Живые примеры обеих раскладок есть в демо на странице
`/controls/play-button`.

### Несколько плееров на странице

Каждому плееру нужен собственный экземпляр `VideoService` — добавьте
`providers: [VideoService]` в компонент плеера. Иначе все `<video ngxVideo>`
подключатся к одному root-сервису, и кнопки будут управлять последним из них.

> Большой центральный оверлей «клик, чтобы играть» появится отдельным кирпичом
> `ClickToPlayOverlayComponent` в пакете `extras`: он будет закрывать всю площадь
> видео, а не только кнопку.

## Как строить плеер из контролов

Контролы не знают друг о друге — их связывает родитель через `VideoService`:

```html
<video ngxVideo [src]="src"></video>

<div class="controls">
  <ngx-play-button [state]="video.state()" (toggle)="video.toggle()" />
  <!-- здесь появятся volume-slider, time-display, fullscreen-button и т.д. -->
</div>
```

Такая композиция позволяет:

- ставить контролы в любом порядке и в любом месте разметки;
- использовать один контрол в нескольких плеерах;
- подменять `VideoService` на собственное состояние в тестах или Storybook —
  компонент зависит только от `VideoState`.

## Совместимость

Имена входов, выходов, селекторы и CSS-переменные — часть публичного контракта,
ломающие изменения только в мажорной версии. Пока версия `0.x`, API может меняться
в минорных релизах.

## Лицензия

MIT
