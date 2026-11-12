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
| `VolumeSliderComponent`       | `ngx-volume-slider`       | ✅ готов |
| `TimeDisplayComponent`        | `ngx-time-display`        | ✅ готов |
| `FullscreenButtonComponent`   | `ngx-fullscreen-button`   | ✅ готов |
| `BufferingIndicatorComponent` | `ngx-buffering-indicator` | ✅ готов |

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

## VolumeSliderComponent

Ползунок громкости на нативном `input[type="range"]`: показывает переданный
уровень и сообщает наружу о новом значении. Состояние не хранит, методы
`<video>` не вызывает и mute не управляет — для него нужна отдельная кнопка.

```html
<ngx-volume-slider [volume]="video.volume()" (volumeChange)="video.setVolume($event)" />
```

### Входы

| Вход          | Тип              | По умолчанию | Описание                                                                   |
| ------------- | ---------------- | ------------ | -------------------------------------------------------------------------- |
| `volume`      | `number`         | — (required) | Текущая громкость `0…1`; значения вне диапазона зажимаются при отображении |
| `customClass` | `string`         | `''`         | Дополнительный CSS-класс для хост-элемента `<ngx-volume-slider>`           |
| `ariaLabel`   | `string \| null` | `null`       | Переопределение `aria-label`; по умолчанию «Громкость»                     |

### Выходы

| Выход          | Тип      | Описание                                                                        |
| -------------- | -------- | ------------------------------------------------------------------------------- |
| `volumeChange` | `number` | Новое значение `0…1` при перетаскивании, клике по треку или работе с клавиатуры |

### Поведение

- Значение эмитится на нативное событие `input`: во время перетаскивания уровень
  обновляется непрерывно.
- Перед эмитом значение зажимается в `0…1`; некорректные числа игнорируются.
- Компонент не хранит состояние: показанное значение всегда берётся из входа
  `volume`. Применяет его родитель, например через `video.setVolume()`.
- Mute не входит в ответственность компонента. При `video.muted() === true`
  слайдер продолжает показывать `volume`, а не `0`: состояние звука живёт
  в отдельной кнопке.

### CSS-переменные

Все значения заданы в `:host`, поэтому контрол работает из коробки и
переопределяется без правки исходников.

| Переменная                         | По умолчанию               | Описание                                |
| ---------------------------------- | -------------------------- | --------------------------------------- |
| `--ngx-volume-width`               | `120px`                    | Ширина слайдера                         |
| `--ngx-volume-track-height`        | `4px`                      | Толщина трека                           |
| `--ngx-volume-track-color`         | `rgba(255, 255, 255, 0.3)` | Цвет незаполненной части трека          |
| `--ngx-volume-fill-color`          | `#ffffff`                  | Цвет заполненной части и обводки фокуса |
| `--ngx-volume-thumb-color`         | `#ffffff`                  | Цвет ползунка                           |
| `--ngx-volume-thumb-hover-color`   | `#e5e7eb`                  | Цвет ползунка при наведении             |
| `--ngx-volume-thumb-size`          | `14px`                     | Размер ползунка                         |
| `--ngx-volume-border-radius`       | `999px`                    | Скругление трека                        |
| `--ngx-volume-thumb-border-radius` | `50%`                      | Скругление ползунка                     |
| `--ngx-volume-transition`          | `0.15s ease`               | Переход цвета ползунка                  |

### Стилизация

Переопределение на самом компоненте:

```scss
ngx-volume-slider {
  --ngx-volume-width: 180px;
  --ngx-volume-fill-color: #34d399;
  --ngx-volume-thumb-color: #34d399;
  --ngx-volume-thumb-size: 18px;
}
```

Через `customClass` — класс вешается на **хост-элемент** `<ngx-volume-slider>`:

```html
<ngx-volume-slider customClass="my-volume" [volume]="video.volume()" (volumeChange)="video.setVolume($event)" />
```

```scss
/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-volume {
  --ngx-volume-width: 180px;
  --ngx-volume-track-height: 6px;
  --ngx-volume-track-color: rgba(255, 255, 255, 0.2);
  --ngx-volume-fill-color: #34d399;
  --ngx-volume-thumb-color: #34d399;
  --ngx-volume-thumb-hover-color: #6ee7b7;
  --ngx-volume-thumb-size: 18px;
}
```

`customClass` не затрагивает классы, заданные на элементе вручную:
`<ngx-volume-slider class="layout-wide" customClass="my-volume">` сохранит оба.

Выключенный звук — состояние кнопки mute, а не слайдера. Если нужно показать его
и визуально, передайте класс динамически:

```html
<ngx-volume-slider [customClass]="video.muted() ? 'is-muted' : ''" [volume]="video.volume()" (volumeChange)="video.setVolume($event)" />
```

```scss
.is-muted {
  --ngx-volume-fill-color: #6b7280;
  --ngx-volume-thumb-color: #6b7280;
}
```

### Вертикальный вид

Ориентация — это раскладка потребителя, а не вход компонента. Поверните слайдер
в контейнере нужного размера:

```html
<div class="player__volume">
  <ngx-volume-slider customClass="my-volume-vertical" [volume]="video.volume()" (volumeChange)="video.setVolume($event)" />
</div>
```

```scss
.player__volume {
  display: grid;
  place-items: center;
  height: 160px;
}

.my-volume-vertical {
  --ngx-volume-width: 140px;
  transform: rotate(-90deg);
}
```

После поворота заливка растёт снизу вверх, а клавиатура продолжает работать
так же, как у горизонтального слайдера.

### Доступность

- Нативный `<input type="range">` с `min="0"`, `max="1"`, `step="0.01"`:
  стрелки, Home/End, PageUp/PageDown, фокус и семантика работают из коробки.
- `aria-label` по умолчанию «Громкость», переопределяется входом `ariaLabel`.
- `aria-valuetext` передаётся в процентах (`42%`), чтобы скринридер не читал
  сырое значение `0.42`.
- Видимый `:focus-visible` outline.
- При `prefers-reduced-motion: reduce` переходы отключаются.

### SSR

Компонент не обращается к `window`/`document`: в шаблоне только нативная
привязка, а классы хоста синхронизируются через `ElementRef` так же, как
в `PlayButtonComponent`.

## TimeDisplayComponent

Показывает текущую позицию и длительность в виде «текущее / общее». Оба значения
форматируются общей утилитой `formatTime` из `@erst_dev/ngx-video-core`.

```html
<ngx-time-display [currentTime]="video.time()" [duration]="video.duration()" />
```

### Входы

| Вход          | Тип      | По умолчанию | Описание                                                         |
| ------------- | -------- | ------------ | ---------------------------------------------------------------- |
| `currentTime` | `number` | — (required) | Текущая позиция в секундах                                       |
| `duration`    | `number` | — (required) | Общая длительность в секундах; `0`, пока метаданные не загружены |
| `customClass` | `string` | `''`         | Дополнительный CSS-класс для хост-элемента `<ngx-time-display>`  |

### Выходы

Выходов нет: компонент только отображает переданные значения.

### Поведение

- До часа формат `мм:сс`, начиная с часа — `ч:мм:сс`.
- Некорректные значения (`NaN`, `Infinity`, отрицательные, `null`/`undefined`)
  превращаются в `00:00` — это поведение `formatTime`.
- Компонент не подписывается на `VideoService` и не следит за `<video>`:
  обновление приходит от родителя через `currentTime` и `duration`.
- Дробная часть секунд отбрасывается: `formatTime` использует `Math.floor`.

### CSS-переменные

| Переменная                   | По умолчанию               | Описание                    |
| ---------------------------- | -------------------------- | --------------------------- |
| `--ngx-time-color`           | `#ffffff`                  | Цвет текста                 |
| `--ngx-time-separator-color` | `rgba(255, 255, 255, 0.6)` | Цвет разделителя            |
| `--ngx-time-font-size`       | `0.875rem`                 | Размер шрифта               |
| `--ngx-time-gap`             | `0.25rem`                  | Отступ между частями вывода |

Цифры выводятся с `font-variant-numeric: tabular-nums`, поэтому ширина текста не
скачет при смене секунд.

### Стилизация

```scss
ngx-time-display {
  --ngx-time-color: #34d399;
  --ngx-time-separator-color: rgba(52, 211, 153, 0.6);
  --ngx-time-font-size: 1rem;
  --ngx-time-gap: 0.4rem;
}
```

Через `customClass` — класс вешается на **хост-элемент** `<ngx-time-display>`:

```html
<ngx-time-display customClass="my-time" [currentTime]="video.time()" [duration]="video.duration()" />
```

```scss
/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-time {
  --ngx-time-color: #34d399;
  --ngx-time-font-size: 1rem;
}
```

`customClass` не затрагивает классы, заданные на элементе вручную:
`<ngx-time-display class="layout-wide" customClass="my-time">` сохранит оба.

### Доступность

- Текст читается как «00:07 из 01:30»: видимый `/` скрыт через
  `aria-hidden="true"`, вместо него добавлено визуально скрытое «из».
- `aria-live` не используется: время меняется каждую секунду, и озвучивание
  каждого обновления мешало бы. Скринридер прочитает значение при переходе
  к элементу.
- Компонент неинтерактивен, поэтому не попадает в порядок табуляции.

### SSR

Компонент не обращается к `window`/`document`: только форматирование и привязки,
а классы хоста синхронизируются через `ElementRef` так же, как в
`PlayButtonComponent`.

## FullscreenButtonComponent

Кнопка входа и выхода из полноэкранного режима. Показывает иконку и подпись по
входу `fullscreen` и сообщает наружу о клике. Fullscreen API не вызывает: запрос
выполняет родитель, например `video.toggleFullscreen()`.

```html
<ngx-fullscreen-button [fullscreen]="video.fullscreen()" (toggle)="video.toggleFullscreen()" />
```

### Входы

| Вход           | Тип                                                | По умолчанию | Описание                                                                                            |
| -------------- | -------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| `fullscreen`   | `boolean`                                          | — (required) | Включён ли полноэкранный режим: определяет иконку и подпись                                         |
| `customClass`  | `string`                                           | `''`         | Дополнительный CSS-класс для хост-элемента `<ngx-fullscreen-button>`                                |
| `ariaLabel`    | `string \| null`                                   | `null`       | Переопределение `aria-label`; по умолчанию «Полноэкранный режим» / «Выйти из полноэкранного режима» |
| `iconTemplate` | `TemplateRef<FullscreenButtonIconContext> \| null` | `null`       | Пользовательская иконка вместо стандартной                                                          |

### Выходы

| Выход    | Тип    | Описание                                                                                                           |
| -------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| `toggle` | `void` | Клик по кнопке. Может совпадать с именем нативного DOM-события `toggle` — это безопасно, так как элемент кастомный |

### Поведение по состояниям

| `fullscreen` | Иконка     | `aria-pressed` | `aria-label` по умолчанию      |
| ------------ | ---------- | -------------- | ------------------------------ |
| `false`      | развернуть | `false`        | Полноэкранный режим            |
| `true`       | свернуть   | `true`         | Выйти из полноэкранного режима |

### CSS-переменные

Все значения заданы в `:host`, поэтому контрол работает из коробки и
переопределяется без правки исходников.

| Переменная                       | По умолчанию         | Описание                                          |
| -------------------------------- | -------------------- | ------------------------------------------------- |
| `--ngx-fullscreen-size`          | `48px`               | Размер кнопки (квадрат)                           |
| `--ngx-fullscreen-icon-size`     | `55%`                | Размер стандартной SVG-иконки относительно кнопки |
| `--ngx-fullscreen-color`         | `#ffffff`            | Цвет иконки                                       |
| `--ngx-fullscreen-bg`            | `rgba(0, 0, 0, 0.7)` | Фон кнопки                                        |
| `--ngx-fullscreen-hover-bg`      | `rgba(0, 0, 0, 0.9)` | Фон при наведении                                 |
| `--ngx-fullscreen-border-radius` | `50%`                | Скругление                                        |
| `--ngx-fullscreen-transition`    | `0.15s ease`         | Переход фона и цвета                              |

`--ngx-fullscreen-icon-size` действует только на стандартную SVG-иконку.
Содержимое `iconTemplate` компонент не масштабирует — его размер задаётся вашими
стилями.

### Стилизация

Переопределение на самом компоненте:

```scss
ngx-fullscreen-button {
  --ngx-fullscreen-size: 40px;
  --ngx-fullscreen-bg: transparent;
  --ngx-fullscreen-hover-bg: rgba(255, 255, 255, 0.15);
  --ngx-fullscreen-border-radius: 8px;
}
```

Через `customClass` — класс вешается на **хост-элемент** `<ngx-fullscreen-button>`:

```html
<ngx-fullscreen-button customClass="my-fullscreen" [fullscreen]="video.fullscreen()" (toggle)="video.toggleFullscreen()" />
```

```scss
/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-fullscreen {
  --ngx-fullscreen-size: 40px;
  --ngx-fullscreen-color: #34d399;
  --ngx-fullscreen-bg: #1f2937;
  --ngx-fullscreen-hover-bg: #374151;
  --ngx-fullscreen-border-radius: 8px;
}
```

`customClass` не затрагивает классы, заданные на элементе вручную:
`<ngx-fullscreen-button class="layout-wide" customClass="my-fullscreen">`
сохранит оба.

### Своя иконка

```html
<ngx-fullscreen-button [fullscreen]="video.fullscreen()" [iconTemplate]="myIcon" (toggle)="video.toggleFullscreen()" />

<ng-template #myIcon let-fullscreen="fullscreen">
  <span class="my-icon">{{ fullscreen ? '⤡' : '⤢' }}</span>
</ng-template>
```

В шаблон передаётся контекст:

```typescript
interface FullscreenButtonIconContext {
  readonly fullscreen: boolean;
}
```

Пользовательский шаблон рендерится внутри кнопки вместо стандартной SVG-иконки;
размер контейнера и цвета по-прежнему задаются CSS-переменными.

### Доступность

- Рендерится нативный `<button type="button">` — Enter/Space, фокус и семантика
  кнопки работают без дополнительного кода.
- `aria-label` меняется по состоянию и переопределяется входом `ariaLabel`.
- `aria-pressed` отражает, включён ли полноэкранный режим.
- SVG-иконки помечены `aria-hidden="true"` и `focusable="false"`, чтобы не
  попадать в дерево доступности.
- Видимый `:focus-visible` outline.
- При `prefers-reduced-motion: reduce` переходы отключаются.

### SSR

Компонент не обращается к DOM API и Fullscreen API: в шаблоне только привязки
и SVG, поэтому безопасно рендерится на сервере вместе с остальным плеером.

## BufferingIndicatorComponent

Индикатор загрузки (спиннер). Показывается, когда переданное состояние равно
`buffering`. Момент включения буферизации определяет `VideoService`, а не
компонент: он только отражает состояние.

```html
<ngx-buffering-indicator [state]="video.state()" />
```

### Входы

| Вход          | Тип          | По умолчанию | Описание                                                                         |
| ------------- | ------------ | ------------ | -------------------------------------------------------------------------------- |
| `state`       | `VideoState` | — (required) | Текущее состояние плеера; индикатор виден только при `buffering`                 |
| `delay`       | `number`     | `0`          | Задержка появления в миллисекундах; защищает от мигания при короткой буферизации |
| `customClass` | `string`     | `''`         | Дополнительный CSS-класс для хост-элемента `<ngx-buffering-indicator>`           |

### Выходы

Выходов нет: компонент только отображает переданное состояние.

### Поведение

- Индикатор рендерится только при `state === 'buffering'`; в остальных состояниях
  в DOM ничего нет.
- `delay` задерживает появление: если буферизация закончилась раньше, спиннер не
  мелькнёт. Отрицательные и некорректные значения считаются нулём.
- Компонент не решает, когда включать буферизацию, и не хранит состояние плеера:
  вход `state` обновляет родитель.

### CSS-переменные

| Переменная                        | По умолчанию                | Описание                                           |
| --------------------------------- | --------------------------- | -------------------------------------------------- |
| `--ngx-buffering-size`            | `32px`                      | Размер спиннера                                    |
| `--ngx-buffering-thickness`       | `3px`                       | Толщина кольца                                     |
| `--ngx-buffering-color`           | `#ffffff`                   | Цвет активной части кольца                         |
| `--ngx-buffering-track-color`     | `rgba(255, 255, 255, 0.25)` | Цвет трека кольца                                  |
| `--ngx-buffering-speed`           | `0.8s`                      | Длительность одного оборота (`animation-duration`) |
| `--ngx-buffering-easing`          | `linear`                    | Функция сглаживания (`animation-timing-function`)  |
| `--ngx-buffering-delay`           | `0s`                        | Задержка старта (`animation-delay`)                |
| `--ngx-buffering-iteration-count` | `infinite`                  | Количество повторов (`animation-iteration-count`)  |
| `--ngx-buffering-direction`       | `normal`                    | Направление (`animation-direction`)                |
| `--ngx-buffering-fill-mode`       | `none`                      | Режим заполнения (`animation-fill-mode`)           |
| `--ngx-buffering-play-state`      | `running`                   | `running` / `paused` (`animation-play-state`)      |

Набор повторяет свойства CSS-анимации: скорость, сглаживание, направление,
количество повторов, задержку и паузу можно менять независимо. Например,
`--ngx-buffering-direction: alternate` заставит спиннер крутиться сначала в одну
сторону, затем в другую.

`--ngx-buffering-easing` принимает любое значение CSS-свойства
`animation-timing-function`: `linear`, `ease-in`, `ease-in-out`,
`cubic-bezier(...)` и т.д.

Имя keyframes фиксировано (`ngx-buffering-spin`): Angular скоупит `@keyframes`
компонента, поэтому подменить его CSS-переменной нельзя — переменная осталась бы
нескоупленной и не совпала бы с именем анимации.

### Стилизация

Переопределение на самом компоненте:

```scss
ngx-buffering-indicator {
  --ngx-buffering-size: 48px;
  --ngx-buffering-thickness: 4px;
  --ngx-buffering-color: #34d399;
  --ngx-buffering-track-color: rgba(52, 211, 153, 0.25);
  --ngx-buffering-speed: 0.6s;
  --ngx-buffering-easing: ease-in;
  --ngx-buffering-direction: alternate;
}
```

Через `customClass` — класс вешается на **хост-элемент** `<ngx-buffering-indicator>`:

```html
<ngx-buffering-indicator customClass="my-buffering" [state]="video.state()" />
```

```scss
/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-buffering {
  --ngx-buffering-size: 48px;
  --ngx-buffering-color: #34d399;
  --ngx-buffering-track-color: rgba(52, 211, 153, 0.25);
}
```

`customClass` не затрагивает классы, заданные на элементе вручную:
`<ngx-buffering-indicator class="layout-wide" customClass="my-buffering">`
сохранит оба.

### Доступность

- Обёртка рендерится с `role="status"`: появление индикатора объявляется
  скринридером.
- Видимый спиннер помечен `aria-hidden="true"`, рядом лежит визуально скрытый
  текст «Загрузка…».
- При `prefers-reduced-motion: reduce` вращение отключается — остаётся статичное
  кольцо.

### SSR

Таймер задержки создаётся только в браузере (`isPlatformBrowser`); на сервере
индикатор отдаётся сразу по состоянию. Анимация — чистый CSS, DOM API компонент
не использует.

## Размещение на плеере

Контролы не знают, где находятся: layout — задача контейнера плеера.
Компонент рендерит обычный элемент в потоке, поэтому позиционируется стандартным
CSS — без специальных входов и без `::ng-deep`.

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
    <ngx-volume-slider [volume]="video.volume()" (volumeChange)="video.setVolume($event)" />
    <ngx-time-display [currentTime]="video.time()" [duration]="video.duration()" />
    <ngx-fullscreen-button [fullscreen]="video.fullscreen()" (toggle)="video.toggleFullscreen()" />
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
  <ngx-volume-slider [volume]="video.volume()" (volumeChange)="video.setVolume($event)" />
  <ngx-time-display [currentTime]="video.time()" [duration]="video.duration()" />
  <ngx-fullscreen-button [fullscreen]="video.fullscreen()" (toggle)="video.toggleFullscreen()" />
</div>
```

Такая композиция позволяет:

- ставить контролы в любом порядке и в любом месте разметки;
- использовать один контрол в нескольких плеерах;
- подменять `VideoService` на собственное состояние в тестах или Storybook —
  компонент зависит только от `VideoState`.

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
