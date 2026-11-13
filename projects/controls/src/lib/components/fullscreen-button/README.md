# FullscreenButtonComponent

Кнопка входа и выхода из полноэкранного режима. Показывает иконку и подпись по
входу `fullscreen` и сообщает наружу о клике.

Селектор: `ngx-fullscreen-button`.

## Назначение и границы ответственности

**Делает:**

- выбирает иконку, подпись и `aria-pressed` по входу `fullscreen`;
- обрабатывает клик и эмитит выход `toggle`;
- поддерживает `customClass` и собственную иконку через `iconTemplate`.

**Не делает:**

- не вызывает Fullscreen API: запрос выполняет родитель, например
  `video.toggleFullscreen()` или `container.requestFullscreen()`;
- не хранит состояние полноэкранного режима;
- не решает, на какой элемент запрашивать fullscreen.

## Импорт

```ts
import { FullscreenButtonComponent } from '@erst_dev/ngx-video-controls';
```

## Использование

```html
<video ngxVideo [src]="src"></video>

<ngx-fullscreen-button [fullscreen]="video.fullscreen()" (toggle)="video.toggleFullscreen()" />
```

Если панель управления должна оставаться видимой в полноэкранном режиме,
запрашивайте fullscreen на контейнере плеера, а не на `<video>`. Пример с
локальным сигналом и `fullscreenchange` — в
[README пакета](../../../../README.md#полный-плеер).

## Входы

| Вход           | Тип                                                | По умолчанию | Описание                                                                                            |
| -------------- | -------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| `fullscreen`   | `boolean`                                          | — (required) | Включён ли полноэкранный режим: определяет иконку и подпись                                         |
| `customClass`  | `string`                                           | `''`         | Дополнительный CSS-класс для хост-элемента `<ngx-fullscreen-button>`                                |
| `ariaLabel`    | `string \| null`                                   | `null`       | Переопределение `aria-label`; по умолчанию «Полноэкранный режим» / «Выйти из полноэкранного режима» |
| `iconTemplate` | `TemplateRef<FullscreenButtonIconContext> \| null` | `null`       | Пользовательская иконка вместо стандартной                                                          |

## Выходы

| Выход    | Тип    | Описание                                                                                                           |
| -------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| `toggle` | `void` | Клик по кнопке. Может совпадать с именем нативного DOM-события `toggle` — это безопасно, так как элемент кастомный |

## Поведение по состояниям

| `fullscreen` | Иконка     | `aria-pressed` | `aria-label` по умолчанию      |
| ------------ | ---------- | -------------- | ------------------------------ |
| `false`      | развернуть | `false`        | Полноэкранный режим            |
| `true`       | свернуть   | `true`         | Выйти из полноэкранного режима |

## CSS-переменные

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

## Стилизация

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

## Своя иконка

```html
<ngx-fullscreen-button [fullscreen]="video.fullscreen()" [iconTemplate]="myIcon" (toggle)="video.toggleFullscreen()" />

<ng-template #myIcon let-fullscreen="fullscreen">
  <span class="my-icon">{{ fullscreen ? '⤡' : '⤢' }}</span>
</ng-template>
```

В шаблон передаётся контекст:

```ts
interface FullscreenButtonIconContext {
  readonly fullscreen: boolean;
}
```

Пользовательский шаблон рендерится внутри кнопки вместо стандартной SVG-иконки;
размер контейнера и цвета по-прежнему задаются CSS-переменными.

## Доступность

- Рендерится нативный `<button type="button">` — Enter/Space, фокус и семантика
  кнопки работают без дополнительного кода.
- `aria-label` меняется по состоянию и переопределяется входом `ariaLabel`.
- `aria-pressed` отражает, включён ли полноэкранный режим.
- SVG-иконки помечены `aria-hidden="true"` и `focusable="false"`, чтобы не
  попадать в дерево доступности.
- Видимый `:focus-visible` outline.
- При `prefers-reduced-motion: reduce` переходы отключаются.

## SSR

Компонент не обращается к DOM API и Fullscreen API: в шаблоне только привязки
и SVG, поэтому безопасно рендерится на сервере вместе с остальным плеером.

---

[README пакета](../../../../README.md)
