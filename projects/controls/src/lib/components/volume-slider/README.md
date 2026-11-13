# VolumeSliderComponent

Ползунок громкости на нативном `input[type="range"]`: показывает переданный
уровень и сообщает наружу о новом значении.

Селектор: `ngx-volume-slider`.

## Назначение и границы ответственности

**Делает:**

- отображает громкость `0…1` и заливку трека;
- обрабатывает перетаскивание, клик по треку и клавиатуру;
- эмитит `volumeChange` с новым значением, зажатым в `0…1`.

**Не делает:**

- не хранит состояние: показанное значение всегда берётся из входа `volume`;
- не вызывает методы `<video>` и не знает о `VideoService`;
- не управляет mute — для этого нужна отдельная кнопка.

## Импорт

```ts
import { VolumeSliderComponent } from '@erst_dev/ngx-video-controls';
```

## Использование

```html
<ngx-volume-slider [volume]="video.volume()" (volumeChange)="video.setVolume($event)" />

<!-- mute — отдельная кнопка, слайдер его не заменяет -->
<button type="button" (click)="video.toggleMute()">{{ video.muted() ? 'Включить звук' : 'Без звука' }}</button>
```

## Входы

| Вход          | Тип              | По умолчанию | Описание                                                                   |
| ------------- | ---------------- | ------------ | -------------------------------------------------------------------------- |
| `volume`      | `number`         | — (required) | Текущая громкость `0…1`; значения вне диапазона зажимаются при отображении |
| `customClass` | `string`         | `''`         | Дополнительный CSS-класс для хост-элемента `<ngx-volume-slider>`           |
| `ariaLabel`   | `string \| null` | `null`       | Переопределение `aria-label`; по умолчанию «Громкость»                     |

## Выходы

| Выход          | Тип      | Описание                                                                        |
| -------------- | -------- | ------------------------------------------------------------------------------- |
| `volumeChange` | `number` | Новое значение `0…1` при перетаскивании, клике по треку или работе с клавиатуры |

## Поведение

- Значение эмитится на нативное событие `input`: во время перетаскивания уровень
  обновляется непрерывно.
- Перед эмитом значение зажимается в `0…1`; некорректные числа игнорируются.
- Компонент не хранит состояние: показанное значение всегда берётся из входа
  `volume`. Применяет его родитель, например через `video.setVolume()`.
- Mute не входит в ответственность компонента. При `video.muted() === true`
  слайдер продолжает показывать `volume`, а не `0`: состояние звука живёт
  в отдельной кнопке.
- Внутри используется утилита `clamp`, экспортируемая пакетом. Её поведение:
  некорректные значения (`NaN`, `Infinity`) превращаются в минимум диапазона.

`ng-template` не предусмотрен: внутри только нативный `input[type="range"]`.
Для нестандартной разметки нужен собственный контрол.

## CSS-переменные

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

## Стилизация

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

## Вертикальный вид

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

## Доступность

- Нативный `<input type="range">` с `min="0"`, `max="1"`, `step="0.01"`:
  стрелки, Home/End, PageUp/PageDown, фокус и семантика работают из коробки.
- `aria-label` по умолчанию «Громкость», переопределяется входом `ariaLabel`.
- `aria-valuetext` передаётся в процентах (`42%`), чтобы скринридер не читал
  сырое значение `0.42`.
- Видимый `:focus-visible` outline.
- При `prefers-reduced-motion: reduce` переходы отключаются.

## SSR

Компонент не обращается к `window`/`document`: в шаблоне только нативная
привязка, а классы хоста синхронизируются через `ElementRef` так же, как
в `PlayButtonComponent`.

---

[README пакета](../../../../README.md)
