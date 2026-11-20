# QualitySwitcherComponent

Селект качества видео на нативном `<select>`: показывает пункт «Auto» и
доступные уровни, а на выбор пользователя эмитит `id` уровня или `null` для Auto.
Качество к видео не применяет — это делает родитель через вход `level` директивы
`HlsSourceDirective`/`DashSourceDirective`.

Селектор: `ngx-quality-switcher`.

## Назначение и границы ответственности

**Делает:**

- показывает «Auto» и `levels` в заданном порядке в нативном `<select>`;
- отмечает выбранный уровень по входу `level`;
- сообщает о выборе через `levelChange`: `null` для Auto, иначе `id` уровня;
- поддерживает `customClass`, `ariaLabel` и CSS-переменные `--ngx-quality-*`.

**Не делает:**

- не парсит HLS/DASH-манифесты и не грузит их через `fetch`/`HttpClient`;
- не хранит состояние и не запоминает выбранное значение;
- не знает о `VideoService`, `HlsSourceDirective` и `DashSourceDirective`;
- не применяет качество и не вызывает медиа-API;
- не сортирует, не дедуплицирует и не фильтрует `levels`;
- не добавляет в список уровень, которого нет во входе `levels`;
- не меняет переданные `levels` и `level`;
- не переводит подписи и не управляет i18n.

Компонент только отдаёт выбор. Применение качества — ответственность родителя:
он передаёт полученный `id` во вход `level` директивы источника.

## Импорт

```ts
import { QualitySwitcherComponent } from '@erst_dev/ngx-video-sources';
```

## Использование с HLS

```html
<video ngxVideo [ngxHlsSource]="src" [level]="level()" (levelsChange)="onLevelsChange($event)" (levelChange)="onLevelChange($event)" playsinline></video>

<ngx-quality-switcher [levels]="levels()" [level]="level()" (levelChange)="level.set($event)" />
```

```ts
import { Component, signal } from '@angular/core';
import type { QualityInterface } from '@erst_dev/ngx-video-core';
import { VideoDirective } from '@erst_dev/ngx-video-core';
import { HlsSourceDirective, QualitySwitcherComponent } from '@erst_dev/ngx-video-sources';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, HlsSourceDirective, QualitySwitcherComponent],
  templateUrl: './player.component.html',
})
export class PlayerComponent {
  readonly src = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  /** Уровни из `levelsChange` директивы. */
  readonly levels = signal<readonly QualityInterface[]>([]);

  /** `id` для компонента и входа `level` директивы; `null` — Auto. */
  readonly level = signal<string | null>(null);

  /** Фактический уровень из `levelChange` директивы — для подписи. */
  readonly currentLevel = signal<QualityInterface | null>(null);

  protected onLevelsChange(levels: readonly QualityInterface[]): void {
    this.levels.set(levels);

    // Выбранный уровень исчез из нового списка — возвращаемся к Auto.
    if (this.level() !== null && !levels.some((item) => item.id === this.level())) {
      this.level.set(null);
    }
  }

  protected onLevelChange(level: QualityInterface | null): void {
    this.currentLevel.set(level);
  }
}
```

Обратите внимание на два разных контракта:

- `QualitySwitcherComponent.levelChange` — `string | null`, это `id` выбора;
- `HlsSourceDirective.levelChange` (и DASH) — `QualityInterface | null`, это уже
  фактически выбранный уровень.

Поэтому в родителе удобно держать два сигнала: `level` (`string | null`) для
компонента и входа директивы и `currentLevel` (`QualityInterface | null`) для
подписи.

## Использование с DASH

Контракт компонента одинаков для обоих источников — меняется только директива:

```html
<video ngxVideo [ngxDashSource]="dashSrc" [level]="level()" (levelsChange)="onLevelsChange($event)" (levelChange)="onLevelChange($event)" playsinline></video>

<ngx-quality-switcher [levels]="levels()" [level]="level()" (levelChange)="level.set($event)" />
```

## Входы

| Вход          | Тип                           | По умолчанию       | Описание                                     |
| ------------- | ----------------------------- | ------------------ | -------------------------------------------- |
| `levels`      | `readonly QualityInterface[]` | `[]`               | Доступные уровни без «auto» в порядке показа |
| `level`       | `string \| null`              | `null`             | `id` выбранного уровня; `null` — Auto        |
| `customClass` | `string`                      | `''`               | Дополнительный CSS-класс для хост-элемента   |
| `ariaLabel`   | `string`                      | `'Качество видео'` | Доступное имя нативного `<select>`           |

## Выходы

| Выход         | Тип              | Описание                              |
| ------------- | ---------------- | ------------------------------------- |
| `levelChange` | `string \| null` | `id` выбранного уровня; `null` — Auto |

Выход эмитит **строку**, а не `QualityInterface`. Полный объект уровня приходит
из `levelChange` директивы источника.

## Поведение

- В селекте всегда есть первый пункт `Auto` со значением `''`, затем `levels` в
  том же порядке. Подписи опций — `label` уровня.
- `selected` вычисляется из `level`: если `id` есть среди `levels`, отмечен он,
  иначе — Auto. Входы не мутируются.
- Если `level` — неизвестный `id`, компонент показывает Auto и ничего не эмитит
  до действия пользователя: качество нельзя «выдумать».
- Пустой `levels` не убирает селект из DOM: остаётся один пункт `Auto`.
- Никакой сортировки, дедупликации, фильтрации и добавления отсутствующего
  уровня: список показывается ровно таким, каким пришёл.
- Событие эмитится только на нативное `change` пользователя. Изменение входов
  (`levels`, `level`) выходов не вызывает.
- На `change` значение `''` превращается в `null`, любое другое — в `id` строкой.
- `level` и `levels` — входы, поэтому отображаемое значение всегда определяется
  родителем. Если родитель не применил эмитированный `id`, селект останется под
  управлением входного сигнала.

## CSS-переменные

Все значения заданы в `:host`, поэтому компонент работает из коробки и
переопределяется без правки исходников.

| Переменная                    | По умолчанию               | Описание                             |
| ----------------------------- | -------------------------- | ------------------------------------ |
| `--ngx-quality-bg`            | `rgba(0, 0, 0, 0.6)`       | Фон селекта                          |
| `--ngx-quality-color`         | `#ffffff`                  | Цвет текста и рамки при наведении    |
| `--ngx-quality-border-color`  | `rgba(255, 255, 255, 0.3)` | Цвет рамки в покое                   |
| `--ngx-quality-border-radius` | `0.375rem`                 | Скругление селекта                   |
| `--ngx-quality-padding`       | `0.25rem 0.5rem`           | Внутренние отступы селекта           |
| `--ngx-quality-font-size`     | `0.8125rem`                | Размер шрифта                        |
| `--ngx-quality-focus-color`   | `#60a5fa`                  | Цвет outline при фокусе с клавиатуры |
| `--ngx-quality-transition`    | `0.15s ease`               | Переход рамки и фона                 |

## Стилизация

Переопределение на самом компоненте:

```scss
ngx-quality-switcher {
  --ngx-quality-bg: #111827;
  --ngx-quality-border-radius: 999px;
  --ngx-quality-focus-color: #34d399;
}
```

Через `customClass` — класс вешается на **хост-элемент**
`<ngx-quality-switcher>`:

```html
<ngx-quality-switcher customClass="my-quality" [levels]="levels()" [level]="level()" (levelChange)="level.set($event)" />
```

```scss
/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-quality {
  --ngx-quality-bg: #064e3b;
  --ngx-quality-color: #d1fae5;
  --ngx-quality-border-color: #059669;
  --ngx-quality-border-radius: 999px;
  --ngx-quality-padding: 0.375rem 0.75rem;
  --ngx-quality-font-size: 0.875rem;
  --ngx-quality-focus-color: #34d399;
}
```

`customClass` не затрагивает классы, заданные на элементе вручную:
`<ngx-quality-switcher class="layout-wide" customClass="my-quality">` сохранит
оба класса. Внутренность компонента — только нативный `<select>`; `ng-template`
не предусмотрен, кастомизация идёт через CSS-переменные и `customClass`.

## Доступность

- Используется нативный `<select>`: клавиатура, поиск по первой букве, фокус и
  семантика работают без дополнительного кода и без `FormsModule`.
- У селекта постоянный `aria-label` из входа `ariaLabel` (по умолчанию «Качество
  видео») — подпись не теряется, если рядом нет визуального `<label>`.
- Своей видимой подписи, `role` и `aria-live` компонент не добавляет.
- Видимый `:focus-visible` outline с настраиваемым цветом
  `--ngx-quality-focus-color`.
- При `prefers-reduced-motion: reduce` переход рамки и фона отключается.
- В селекте всегда есть выбранная опция: если `level` неизвестен или `levels`
  пуст, отмечен Auto.

## SSR

Компонент не использует `window`, `document` и медиа-API. Единственное
обращение к DOM — синхронизация классов хоста через `ElementRef` в `effect()`;
на сервере Angular предоставляет элемент так же, как в браузере. Разметка
`<select>` безопасно рендерится на сервере; событие `change` возникает только в
браузере. Манифесты не загружаются и не парсятся ни на сервере, ни в браузере.

---

[README пакета](../../../../README.md)
