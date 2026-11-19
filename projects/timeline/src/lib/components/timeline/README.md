# TimelineComponent

Базовая полоса перемотки: показывает прогресс, буфер и ползунок, обрабатывает
клик, перетаскивание и клавиатуру.

Селектор: `ngx-timeline`.

## Назначение и границы ответственности

**Делает:**

- рисует `currentTime`, `duration` и `buffered`;
- считает время по координате указателя;
- обрабатывает клик, drag и клавиатуру;
- отдаёт `seek`, `scrubStart`, `scrubEnd`;
- принимает необязательный `previewTemplate` для превью над полосой.

**Не делает:**

- не вызывает методы `<video>` и не знает о `VideoService`;
- не хранит текущее время как источник правды;
- не рендерит превью кадров и не управляет главами — для этого есть
  `TimelinePreviewComponent` и `ChapterMarkersComponent`;
- не перематывает видео continuously во время drag: базовая версия эмитит
  `seek` один раз при отпускании.

## Импорт

```ts
import { TimelineComponent } from '@erst_dev/ngx-video-timeline';
```

## Использование

```html
<video ngxVideo [src]="src" (click)="video.toggle()"></video>

<ngx-timeline [currentTime]="video.time()" [duration]="video.duration()" [buffered]="video.buffered()" (seek)="video.seek($event)" />
```

## Входы

| Вход              | Тип                                           | По умолчанию | Описание                                                                 |
| ----------------- | --------------------------------------------- | ------------ | ------------------------------------------------------------------------ |
| `currentTime`     | `number`                                      | — (required) | Текущая позиция в секундах                                               |
| `duration`        | `number`                                      | — (required) | Общая длительность; `0`, пока метаданные не загружены                    |
| `buffered`        | `number`                                      | `0`          | Конец буферизованного диапазона в секундах                               |
| `keyboardStep`    | `number`                                      | `5`          | Шаг стрелок клавиатуры в секундах                                        |
| `customClass`     | `string`                                      | `''`         | Дополнительный CSS-класс для хост-элемента `<ngx-timeline>`              |
| `ariaLabel`       | `string \| null`                              | `null`       | Переопределение `aria-label`; по умолчанию «Перемотка»                   |
| `previewTemplate` | `TemplateRef<TimelinePreviewContext> \| null` | `null`       | Шаблон превью, рендерится над полосой при наведении; контекст `{ time }` |

## Выходы

| Выход        | Тип      | Когда срабатывает                                  |
| ------------ | -------- | -------------------------------------------------- |
| `seek`       | `number` | Отпускание ползунка, клик по полосе или клавиатура |
| `scrubStart` | `void`   | Начало pointer-жеста по полосе                     |
| `scrubEnd`   | `void`   | Конец жеста: pointerup или pointercancel           |

## Поведение

- Во время перетаскивания двигается только локальное `dragTime`; `seek`
  эмитится один раз при отпускании. Это вариант A: видео не перематывается
  десятки раз за один жест.
- На отпускании порядок событий: `seek(target)`, затем `scrubEnd`. Родитель
  успевает применить перемотку до возможного resume.
- `pointercancel` эмитит `scrubEnd` без `seek`.
- Клик — это короткий жест: `scrubStart` → `seek` → `scrubEnd`.
- Клавиатура эмитит только `seek`:
  - `ArrowLeft` / `ArrowDown` — назад на `keyboardStep`;
  - `ArrowRight` / `ArrowUp` — вперёд на `keyboardStep`;
  - `Home` — в начало;
  - `End` — в конец.
- При `duration <= 0` компонент неинтерактивен: `tabindex="-1"`,
  `aria-disabled="true"`, `seek` не эмитится.
- После `seek` компонент не меняет `currentTime` сам: если родитель не обновил
  вход, ползунок вернётся на прежнее место. Это controlled-компонент.

Live-scrub (непрерывный `seek` во время drag) в базовой версии не включён. Его
можно добавить позже отдельным входом, не ломая текущий контракт.

## CSS-переменные

Все значения заданы в `:host`, поэтому контрол работает из коробки.

| Переменная                      | По умолчанию                | Описание                          |
| ------------------------------- | --------------------------- | --------------------------------- |
| `--ngx-timeline-height`         | `4px`                       | Толщина полосы                    |
| `--ngx-timeline-hit-height`     | `28px`                      | Высота области попадания          |
| `--ngx-timeline-track-color`    | `rgba(255, 255, 255, 0.25)` | Цвет незаполненной полосы         |
| `--ngx-timeline-buffered-color` | `rgba(255, 255, 255, 0.45)` | Цвет буферизованной части         |
| `--ngx-timeline-progress-color` | `#ffffff`                   | Цвет прогресса                    |
| `--ngx-timeline-thumb-color`    | `#ffffff`                   | Цвет ползунка                     |
| `--ngx-timeline-thumb-size`     | `14px`                      | Размер ползунка                   |
| `--ngx-timeline-border-radius`  | `999px`                     | Скругление полосы и ползунка      |
| `--ngx-timeline-transition`     | `0.15s ease`                | Переход размера ползунка          |
| `--ngx-timeline-focus-color`    | `#ffffff`                   | Цвет outline при `:focus-visible` |
| `--ngx-timeline-preview-gap`    | `0.5rem`                    | Отступ превью от полосы           |

## Стилизация

```scss
ngx-timeline {
  --ngx-timeline-height: 6px;
  --ngx-timeline-progress-color: #34d399;
  --ngx-timeline-buffered-color: rgba(52, 211, 153, 0.4);
  --ngx-timeline-thumb-color: #34d399;
  --ngx-timeline-thumb-size: 18px;
}
```

Через `customClass` — класс вешается на **хост-элемент** `<ngx-timeline>`:

```html
<ngx-timeline customClass="my-timeline" [currentTime]="video.time()" [duration]="video.duration()" (seek)="video.seek($event)" />
```

```scss
/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-timeline {
  --ngx-timeline-height: 6px;
  --ngx-timeline-progress-color: #34d399;
  --ngx-timeline-thumb-color: #34d399;
}
```

## Превью через `previewTemplate`

Таймлайн только позиционирует шаблон и передаёт время под курсором. Что
показывать — решает потребитель:

```html
<ngx-timeline [currentTime]="video.time()" [duration]="video.duration()" [previewTemplate]="preview" (seek)="video.seek($event)" />

<ng-template #preview let-time="time">
  <ngx-timeline-preview [time]="time" [src]="src" />
</ng-template>
```

Контекст:

```ts
interface TimelinePreviewContext {
  readonly time: number;
}
```

Если `previewTemplate` не передан, превью не рендерится.

## Доступность

- `role="slider"`, `aria-orientation="horizontal"`.
- `aria-valuemin="0"`, `aria-valuemax="duration"`, `aria-valuenow="currentTime"`.
- `aria-valuetext` — «00:45 из 02:10» через `formatTime`.
- `aria-disabled="true"` и `tabindex="-1"` при `duration <= 0`.
- Видимый `:focus-visible` outline.
- Клавиатура: стрелки, Home, End.
- Полоса имеет увеличенную область попадания (`--ngx-timeline-hit-height`),
  чтобы по ней было удобно попадать на тач-экране.
- При `prefers-reduced-motion: reduce` переходы отключаются.

## SSR

Компонент не обращается к `window`/`document`: координаты считаются по
`getBoundingClientRect()` только в обработчиках pointer-событий, а на сервере
эти обработчики не вызываются. Классы хоста синхронизируются через
`ElementRef`, как в остальных кирпичах.

---

[README пакета](../../../../README.md)
