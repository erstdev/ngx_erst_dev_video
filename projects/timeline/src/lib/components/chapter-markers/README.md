# ChapterMarkersComponent

Метки глав поверх таймлайна: рисует маркеры по массиву «время + название»,
подсвечивает активную главу и сообщает наружу о выборе.

Селектор: `ngx-chapter-markers`.

## Назначение и границы ответственности

**Делает:**

- принимает главы и длительность;
- сортирует и фильтрует некорректные главы;
- рисует кнопки-маркеры в нужных позициях;
- подсвечивает активную главу по `currentTime`;
- эмитит `chapterSelect` с полным объектом главы.

**Не делает:**

- не вызывает `video.seek()` и не знает о `VideoService`;
- не парсит метаданные видео;
- не редактирует и не сохраняет главы;
- не рендерит таймлайн — это отдельный кирпич.

## Импорт

```ts
import { ChapterMarkersComponent, type ChapterInterface } from '@erst_dev/ngx-video-timeline';
```

## Использование

```html
<div class="timeline-track">
  <ngx-timeline [currentTime]="video.time()" [duration]="video.duration()" (seek)="video.seek($event)" />

  <ngx-chapter-markers [chapters]="chapters" [duration]="video.duration()" [currentTime]="video.time()" (chapterSelect)="video.seek($event.time)" />
</div>
```

```scss
.timeline-track {
  position: relative;
}
```

Хост `ngx-chapter-markers` позиционируется абсолютно (`inset: 0`), поэтому
родительский контейнер должен быть `position: relative` и совпадать по высоте
с таймлайном.

## Интерфейс главы

```ts
interface ChapterInterface {
  readonly id?: string;
  readonly time: number;
  readonly title: string;
}
```

- `time` — начало главы в секундах, обязательное;
- `title` — название для подсказки и `aria-label`, обязательное;
- `id` — опциональный стабильный идентификатор для `track` и аналитики.

## Входы

| Вход          | Тип                           | По умолчанию | Описание                                                             |
| ------------- | ----------------------------- | ------------ | -------------------------------------------------------------------- |
| `chapters`    | `readonly ChapterInterface[]` | — (required) | Список глав; можно передать пустой массив                            |
| `duration`    | `number`                      | — (required) | Длительность видео в секундах: нужна для перевода времени в проценты |
| `currentTime` | `number`                      | `0`          | Текущая позиция: по ней подсвечивается активная глава                |
| `customClass` | `string`                      | `''`         | Дополнительный CSS-класс для хост-элемента `<ngx-chapter-markers>`   |
| `ariaLabel`   | `string \| null`              | `null`       | Переопределение `aria-label` группы; по умолчанию «Главы»            |

## Выходы

| Выход           | Тип                | Описание                                      |
| --------------- | ------------------ | --------------------------------------------- |
| `chapterSelect` | `ChapterInterface` | Клик по маркеру; родитель применяет перемотку |

Почему не `seek` с числом: компонент знает главу целиком, и отдавать `time`,
`title` и `id` полезнее, чем заставлять родителя искать главу по времени.
Перемотка остаётся ответственностью родителя:

```ts
onChapterSelect(chapter: ChapterInterface): void {
  this.video.seek(chapter.time);
}
```

## Поведение

- Главы сортируются по `time`; исходный массив не мутируется.
- Некорректные времена (`NaN`, отрицательные, больше `duration`) игнорируются.
- При `duration <= 0` или пустом списке ничего не рендерится.
- Активная глава — последняя, чья `time <= currentTime`.
- Клик по маркеру не проваливается в таймлайн: `stopPropagation()`.
- Маркеры — нативные `<button type="button">`: Enter/Space работают из коробки.
- Подсказка с названием и временем появляется при hover и focus.
- У крайних глав подсказка прижимается к краю, чтобы не вылезать за плеер.

## CSS-переменные

| Переменная                             | По умолчанию               | Описание                             |
| -------------------------------------- | -------------------------- | ------------------------------------ |
| `--ngx-timeline-chapter-color`         | `rgba(255, 255, 255, 0.6)` | Цвет неактивного маркера             |
| `--ngx-timeline-chapter-active-color`  | `#ffffff`                  | Цвет активного маркера и hover/focus |
| `--ngx-timeline-chapter-size`          | `8px`                      | Ширина видимой метки                 |
| `--ngx-timeline-chapter-height`        | `14px`                     | Высота видимой метки                 |
| `--ngx-timeline-chapter-hit-size`      | `24px`                     | Размер области попадания (кнопки)    |
| `--ngx-timeline-chapter-radius`        | `2px`                      | Скругление метки                     |
| `--ngx-timeline-chapter-transition`    | `0.15s ease`               | Переход цвета и масштаба             |
| `--ngx-timeline-chapter-tooltip-bg`    | `rgba(0, 0, 0, 0.85)`      | Фон подсказки                        |
| `--ngx-timeline-chapter-tooltip-color` | `#ffffff`                  | Цвет текста подсказки                |
| `--ngx-timeline-chapter-focus-color`   | `#ffffff`                  | Цвет outline при `:focus-visible`    |

## Стилизация

```scss
ngx-chapter-markers {
  --ngx-timeline-chapter-color: #34d399;
  --ngx-timeline-chapter-active-color: #6ee7b7;
  --ngx-timeline-chapter-size: 10px;
  --ngx-timeline-chapter-height: 18px;
}
```

Через `customClass` — класс вешается на **хост-элемент** `<ngx-chapter-markers>`:

```html
<ngx-chapter-markers customClass="my-chapters" [chapters]="chapters" [duration]="video.duration()" [currentTime]="video.time()" (chapterSelect)="video.seek($event.time)" />
```

```scss
/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-chapters {
  --ngx-timeline-chapter-color: #34d399;
  --ngx-timeline-chapter-active-color: #6ee7b7;
  --ngx-timeline-chapter-size: 10px;
  --ngx-timeline-chapter-height: 18px;
}
```

## Доступность

- Контейнер — `role="group"` с `aria-label="Главы"`.
- Каждый маркер — нативная кнопка с `aria-label` вида
  «Глава: Вступление, 00:00».
- У активной главы `aria-current="true"`.
- Видимый `:focus-visible` outline.
- Область попадания больше видимой метки (`--ngx-timeline-chapter-hit-size`),
  чтобы маркеры были доступны на тач-экранах.
- Подсказка помечена `aria-hidden="true"`: её текст уже есть в `aria-label`.

## SSR

Компонент не обращается к `window`/`document`: только вычисления и привязки,
классы хоста синхронизируются через `ElementRef`. Безопасно рендерится на
сервере вместе с таймлайном.

---

[README пакета](../../../../README.md)
