# PlayButtonComponent

Кнопка Play/Pause для плеера. Показывает иконку по переданному состоянию и
сообщает наружу о клике.

Селектор: `ngx-play-button`.

## Назначение и границы ответственности

**Делает:**

- выбирает иконку, подпись и `aria-pressed` по входу `state`;
- обрабатывает клик и эмитит выход `toggle`;
- поддерживает `customClass` и собственную иконку через `iconTemplate`.

**Не делает:**

- не вызывает методы `<video>` и не знает о `VideoService`;
- не хранит состояние плеера;
- не решает, запускать воспроизведение или ставить паузу, — это задача
  родителя, который подписывается на `toggle`.

## Импорт

```ts
import { PlayButtonComponent } from '@erst_dev/ngx-video-controls';
```

## Использование

```html
<video ngxVideo [src]="src" (click)="video.toggle()"></video>

<ngx-play-button [state]="video.state()" (toggle)="video.toggle()" />
```

```ts
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { PlayButtonComponent } from '@erst_dev/ngx-video-controls';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, PlayButtonComponent],
  template: `
    <video ngxVideo [src]="src" (click)="video.toggle()"></video>
    <ngx-play-button [state]="video.state()" (toggle)="video.toggle()" />
  `,
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';
}
```

## Входы

| Вход           | Тип                                          | По умолчанию | Описание                                                             |
| -------------- | -------------------------------------------- | ------------ | -------------------------------------------------------------------- |
| `state`        | `VideoState`                                 | — (required) | Текущее состояние плеера; по нему выбирается иконка и подпись        |
| `customClass`  | `string`                                     | `''`         | Дополнительный CSS-класс для хост-элемента `<ngx-play-button>`       |
| `ariaLabel`    | `string \| null`                             | `null`       | Переопределение `aria-label`; по умолчанию «Воспроизвести» / «Пауза» |
| `iconTemplate` | `TemplateRef<PlayButtonIconContext> \| null` | `null`       | Пользовательская иконка вместо стандартной                           |

## Выходы

| Выход    | Тип    | Описание                                                                                                           |
| -------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| `toggle` | `void` | Клик по кнопке. Может совпадать с именем нативного DOM-события `toggle` — это безопасно, так как элемент кастомный |

## Поведение по состояниям

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

## CSS-переменные

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

## Стилизация

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

`customClass` не затрагивает классы, заданные на элементе вручную:
`<ngx-play-button class="layout-wide" customClass="my-play">` сохранит оба.

## Своя иконка

```html
<ngx-play-button [state]="video.state()" [iconTemplate]="myIcon" (toggle)="video.toggle()" />

<ng-template #myIcon let-playing="playing" let-state="state">
  <span class="my-icon">{{ playing ? '⏸' : '▶' }}</span>
</ng-template>
```

В шаблон передаётся контекст:

```ts
interface PlayButtonIconContext {
  readonly state: VideoState;
  readonly playing: boolean;
}
```

Пользовательский шаблон рендерится внутри кнопки вместо стандартной SVG-иконки;
размер контейнера и цвета по-прежнему задаются CSS-переменными.

## Доступность

- Рендерится нативный `<button type="button">` — Enter/Space, фокус и семантика
  кнопки работают без дополнительного кода.
- `aria-label` вычисляется из состояния (`Воспроизвести`/`Пауза`) и
  переопределяется входом `ariaLabel`.
- `aria-pressed` отражает, идёт ли воспроизведение.
- SVG-иконки помечены `aria-hidden="true"` и `focusable="false"`, чтобы не
  попадать в дерево доступности.
- Видимый `:focus-visible` outline.
- При `prefers-reduced-motion: reduce` переходы отключаются.

## SSR

Компонент не обращается к DOM API: в шаблоне только привязки и SVG, поэтому
безопасно рендерится на сервере вместе с остальным плеером.

---

[README пакета](../../../../README.md)
