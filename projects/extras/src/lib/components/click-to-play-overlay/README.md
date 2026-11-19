# ClickToPlayOverlayComponent

Прозрачный слой поверх видео с большой кнопкой Play. Закрывает типовой сценарий
«нажми, чтобы включить»: браузер разрешает воспроизведение после жеста
пользователя, а компонент сообщает о клике наружу.

Селектор: `ngx-click-to-play-overlay`.

## Назначение и границы ответственности

**Делает:**

- показывает оверлей только в состояниях `idle` и `paused`;
- перекрывает всю площадь родительского контейнера и принимает клик;
- рисует круглую кнопку с иконкой Play;
- поддерживает `customClass` и собственную иконку через `iconTemplate`;
- сообщает о клике выходом `play`.

**Не делает:**

- не вызывает `play()`, `pause()` и другие методы медиа-элемента;
- не знает о `VideoService` и не хранит состояние плеера;
- не решает, запускать воспроизведение или ставить паузу;
- не управляет разметкой контейнера — родитель должен задать ему
  `position: relative`.

## Импорт

```ts
import { ClickToPlayOverlayComponent } from '@erst_dev/ngx-video-extras';
```

## Использование

```html
<div class="player">
  <video ngxVideo [src]="src" playsinline (click)="video.pause()"></video>

  <ngx-click-to-play-overlay [state]="video.state()" (play)="video.play()" />
</div>
```

```scss
.player {
  position: relative;
  background: #000;
}
```

```ts
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { ClickToPlayOverlayComponent } from '@erst_dev/ngx-video-extras';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, ClickToPlayOverlayComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';
}
```

Родитель сам решает, что делать по клику. В типовом сценарии это
`video.play()`; после смены состояния на `playing` оверлей исчезает из DOM.

## Входы

| Вход           | Тип                                                  | По умолчанию | Описание                                                         |
| -------------- | ---------------------------------------------------- | ------------ | ---------------------------------------------------------------- |
| `state`        | `VideoState`                                         | — (required) | Текущее состояние плеера; по нему вычисляется видимость          |
| `customClass`  | `string`                                             | `''`         | Дополнительный CSS-класс для хост-элемента                       |
| `ariaLabel`    | `string \| null`                                     | `null`       | Переопределение `aria-label`; по умолчанию «Воспроизвести видео» |
| `iconTemplate` | `TemplateRef<ClickToPlayOverlayIconContext> \| null` | `null`       | Пользовательская иконка вместо стандартной SVG                   |

## Выходы

| Выход  | Тип    | Описание                                             |
| ------ | ------ | ---------------------------------------------------- |
| `play` | `void` | Клик по оверлею. Воспроизведением управляет родитель |

## Поведение по состояниям

| `state`     | Оверлей в DOM |
| ----------- | ------------- |
| `idle`      | да            |
| `playing`   | нет           |
| `paused`    | да            |
| `buffering` | нет           |
| `seeking`   | нет           |
| `ended`     | нет           |
| `error`     | нет           |

Оверлей рендерится через `@if`, поэтому в скрытых состояниях кнопки нет не
только визуально, но и в DOM: она не перехватывает клики и не попадает в дерево
доступности. Хост-элемент `<ngx-click-to-play-overlay>` остаётся в разметке —
его создаёт родитель, — но пустой хост не мешает кликам по видео: на `:host`
стоит `pointer-events: none`, а на кнопке — `auto`.

Клик принимает кнопка, растянутая на весь хост. Внутри неё расположен
визуальный круг; `:focus-visible` рисует outline именно на круге.

## CSS-переменные

Все значения заданы в `:host`, поэтому компонент работает из коробки и
переопределяется без правки исходников.

| Переменная                    | По умолчанию          | Описание                             |
| ----------------------------- | --------------------- | ------------------------------------ |
| `--ngx-overlay-size`          | `72px`                | Диаметр круга                        |
| `--ngx-overlay-icon-size`     | `40%`                 | Размер иконки относительно круга     |
| `--ngx-overlay-color`         | `#ffffff`             | Цвет иконки                          |
| `--ngx-overlay-bg`            | `rgba(0, 0, 0, 0.55)` | Фон круга                            |
| `--ngx-overlay-hover-bg`      | `rgba(0, 0, 0, 0.75)` | Фон круга при наведении              |
| `--ngx-overlay-border-radius` | `50%`                 | Скругление круга                     |
| `--ngx-overlay-transition`    | `0.15s ease`          | Переход фона и цвета                 |
| `--ngx-overlay-focus-color`   | `#ffffff`             | Цвет outline при фокусе с клавиатуры |

`--ngx-overlay-icon-size` задаёт размер стандартной SVG-иконки и контейнера
пользовательской иконки. Внутренний размер содержимого `iconTemplate`
компонент не навязывает — его задаёт потребитель.

## Стилизация

Переопределение на самом компоненте:

```scss
ngx-click-to-play-overlay {
  --ngx-overlay-size: 96px;
  --ngx-overlay-bg: #059669;
  --ngx-overlay-hover-bg: #047857;
}
```

Через `customClass` — класс вешается на **хост-элемент**
`<ngx-click-to-play-overlay>`:

```html
<ngx-click-to-play-overlay customClass="my-overlay" [state]="video.state()" (play)="video.play()" />
```

```scss
/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-overlay {
  --ngx-overlay-size: 96px;
  --ngx-overlay-bg: #059669;
  --ngx-overlay-hover-bg: #047857;
  --ngx-overlay-border-radius: 16px;
}
```

`customClass` не затрагивает классы, заданные на элементе вручную:
`<ngx-click-to-play-overlay class="layout-wide" customClass="my-overlay">`
сохранит оба класса.

## Своя иконка

```html
<ngx-click-to-play-overlay [state]="video.state()" [iconTemplate]="myIcon" (play)="video.play()" />

<ng-template #myIcon let-state="state">
  <span class="my-icon" [class.my-icon--paused]="state === 'paused'">★</span>
</ng-template>
```

В шаблон передаётся контекст:

```ts
interface ClickToPlayOverlayIconContext {
  readonly state: VideoState;
}
```

Пользовательский шаблон рендерится внутри круга вместо стандартной SVG-иконки.
Контейнер иконки помечен `aria-hidden="true"`: иконка декоративная, а подпись
кнопки берётся из `aria-label`. Не добавляйте в шаблон текст, который должен
озвучиваться скринридером.

## Доступность

- Рендерится нативный `<button type="button">` — Enter/Space, фокус и семантика
  кнопки работают без дополнительного кода.
- `aria-label` по умолчанию «Воспроизвести видео» и переопределяется входом
  `ariaLabel`.
- Иконки помечены `aria-hidden="true"`, у стандартной SVG также
  `focusable="false"`.
- Видимый `:focus-visible` outline на круге.
- При `prefers-reduced-motion: reduce` переходы отключаются.
- В скрытых состояниях кнопки оверлея нет в DOM, а пустой хост не мешает
  фокусу и кликам по видео.

## SSR

Компонент не использует `window`, `document` и медиа-API. Единственное
обращение к DOM — синхронизация классов хоста через `ElementRef` в `effect()`;
на сервере Angular предоставляет элемент так же, как в браузере. Шаблон
безопасно рендерится на сервере.

---

[README пакета](../../../../README.md)
