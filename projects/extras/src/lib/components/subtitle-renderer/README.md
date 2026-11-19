# SubtitleRendererComponent

Слой субтитров WebVTT поверх видео: принимает уже загруженное содержимое
дорожки и текущее время, выбирает активные cues и рисует их простым текстом.
Компонент не скачивает VTT, не управляет дорожками и не знает о `VideoService` —
всё это остаётся на стороне родителя.

Селектор: `ngx-subtitle-renderer`.

## Назначение и границы ответственности

**Делает:**

- разбирает содержимое WebVTT в cues при изменении `vtt`;
- выбирает активные cues по правилу `start <= currentTime < end`;
- рендерит все активные cues в порядке файла, друг под другом;
- показывает многострочный текст через `white-space: pre-line`, без
  `innerHTML`;
- поддерживает `enabled`, `customClass` и CSS-переменные `--ngx-subtitle-*`.

**Не делает:**

- не загружает VTT по URL: `vtt` — это содержимое, а не ссылка;
- не использует `fetch`, `HttpClient`, `src` и не решает вопросы CORS и кэша;
- не управляет выбором, включением и выключением дорожек;
- не вызывает медиа-методы и не знает о `VideoService`;
- не разбирает inline-теги WebVTT как разметку: теги вырезаются, текст
  остаётся plain text;
- не управляет фокусом, не добавляет `tabindex`, `role` и `aria-live`.

## Импорт

```ts
import { SubtitleRendererComponent } from '@erst_dev/ngx-video-extras';
```

## Использование

```html
<div class="player">
  <video ngxVideo [src]="src" playsinline></video>

  <ngx-subtitle-renderer [vtt]="vtt()" [currentTime]="video.time()" [enabled]="subtitlesEnabled()" [customClass]="subtitleClass()" />
</div>
```

```scss
.player {
  position: relative;
  overflow: hidden;
}
```

```ts
import { Component, inject, signal } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { SubtitleRendererComponent } from '@erst_dev/ngx-video-extras';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, SubtitleRendererComponent],
  templateUrl: './player.component.html',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly vtt = signal('');

  protected async loadVtt(): Promise<void> {
    const response = await fetch('/subtitles/sintel.vtt');
    this.vtt.set(await response.text());
  }
}
```

Компонент рисуется абсолютно поверх ближайшего позиционированного предка,
поэтому контейнер плеера должен иметь `position: relative`. Загрузка строки
VTT — ответственность родителя: компонент получает уже готовый текст.

## Входы

| Вход          | Тип       | По умолчанию | Описание                                                 |
| ------------- | --------- | ------------ | -------------------------------------------------------- |
| `vtt`         | `string`  | `''`         | Содержимое WebVTT, не URL. Пустая строка — субтитров нет |
| `currentTime` | `number`  | — (required) | Текущая позиция в секундах                               |
| `enabled`     | `boolean` | `true`       | Показывать ли субтитры; `false` убирает cues из DOM      |
| `customClass` | `string`  | `''`         | Дополнительный CSS-класс для хост-элемента               |

Выходов нет. `ng-template` тоже нет: текст субтитров простой, кастомизация —
только CSS-переменные и `customClass`.

## CSS-переменные

Все значения заданы в `:host`, поэтому компонент работает из коробки и
переопределяется без правки исходников.

| Переменная                     | По умолчанию                   | Описание                             |
| ------------------------------ | ------------------------------ | ------------------------------------ |
| `--ngx-subtitle-color`         | `#ffffff`                      | Цвет текста                          |
| `--ngx-subtitle-bg`            | `rgba(0, 0, 0, 0.65)`          | Фон плашки cue                       |
| `--ngx-subtitle-font-family`   | `inherit`                      | Шрифт                                |
| `--ngx-subtitle-font-size`     | `1rem`                         | Размер шрифта                        |
| `--ngx-subtitle-font-weight`   | `500`                          | Насыщенность шрифта                  |
| `--ngx-subtitle-line-height`   | `1.35`                         | Межстрочный интервал                 |
| `--ngx-subtitle-padding`       | `0.25rem 0.5rem`               | Внутренние отступы плашки            |
| `--ngx-subtitle-border-radius` | `0.25rem`                      | Скругление плашки                    |
| `--ngx-subtitle-gap`           | `0.25rem`                      | Расстояние между одновременными cues |
| `--ngx-subtitle-bottom`        | `1rem`                         | Отступ слоя от нижнего края видео    |
| `--ngx-subtitle-max-width`     | `90%`                          | Максимальная ширина плашки           |
| `--ngx-subtitle-text-shadow`   | `0 1px 2px rgba(0, 0, 0, 0.9)` | Тень текста                          |
| `--ngx-subtitle-z-index`       | `2`                            | Слой поверх видео                    |

## Правила парсинга

Парсинг запускается только при изменении `vtt` — `currentTime` не пересобирает
дорожку, а только выбирает из уже разобранных cues.

Поддерживается:

- заголовок `WEBVTT` (в том числе с пояснением после него);
- блоки `NOTE`, `STYLE` и `REGION` пропускаются;
- cue с необязательным идентификатором на отдельной строке;
- таймстемпы `mm:ss.mmm` и `hh:mm:ss.mmm`;
- настройки после таймстемпа (`align:start`, `position:10%` и т.п.)
  игнорируются;
- строки текста соединяются через `\n`;
- HTML-теги вырезаются, базовые сущности `&amp;`, `&lt;`, `&gt;`, `&nbsp;`,
  `&quot;`, `&#39;` декодируются; остальные сущности остаются как есть.

Некорректные блоки молча пропускаются: блок без `-->`, с плохими таймстемпами,
с `start >= end` или с пустым текстом. Парсер не бросает исключений.

## Поведение

- Активен cue, у которого `start <= currentTime < end`. Если `currentTime` не
  конечное число, активных cues нет.
- Несколько cues могут быть активны одновременно: рендерятся все, в порядке
  файла, друг под другом с отступом `--ngx-subtitle-gap`.
- При `enabled = false` слой не содержит cue: элементы удаляются из DOM. Хост
  остаётся пустым и не перехватывает события.
- На хосте всегда стоит `pointer-events: none`: субтитры не перехватывают
  клики, жесты и управление плеером.
- `customClass` вешается на хост через `classList` в `effect()`. Классы,
  заданные потребителем вручную через `class="..."`, не затрагиваются.
- Компонент не хранит состояние, не вызывает медиа-методы и не управляет
  дорожками.
- При изменении `vtt` разбор выполняется заново; при изменении `currentTime`
  используется уже разобранный массив.

## Стилизация

Переопределение на самом компоненте:

```scss
ngx-subtitle-renderer {
  --ngx-subtitle-bottom: 2rem;
  --ngx-subtitle-font-size: 1.125rem;
}
```

Через `customClass` — класс вешается на **хост-элемент**
`<ngx-subtitle-renderer>`:

```html
<ngx-subtitle-renderer customClass="my-subtitles" [vtt]="vtt()" [currentTime]="video.time()" />
```

```scss
/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-subtitles {
  --ngx-subtitle-color: #fef3c7;
  --ngx-subtitle-bg: rgba(17, 24, 39, 0.85);
  --ngx-subtitle-font-size: 1.5rem;
  --ngx-subtitle-border-radius: 0.5rem;
  --ngx-subtitle-bottom: 1.5rem;
}
```

`customClass` не затрагивает классы, заданные на элементе вручную:
`<ngx-subtitle-renderer class="layout-wide" customClass="my-subtitles">`
сохранит оба класса.

## Доступность

- Компонент не управляет фокусом, не добавляет `tabindex`, `role` и
  `aria-live`: смена cue не должна автоматически озвучиваться скринридером.
- Субтитры декоративны для управления: `pointer-events: none` на хосте
  гарантирует, что клики и жесты доходят до видео и элементов управления.
- Вся стилизация текста наследуется от CSS-переменных, поэтому контраст и
  размер можно подстроить под интерфейс потребителя.
- `white-space: pre-line` сохраняет переносы строк WebVTT, не превращая текст
  в HTML.

## SSR

Компонент не использует `window`, `document`, `fetch` и медиа-API. Парсер —
чистый TypeScript, геометрия и DOM для разбора не нужны. Единственное
обращение к DOM — синхронизация классов хоста через `ElementRef` в `effect()`;
на сервере Angular предоставляет элемент так же, как в браузере. Разметка
безопасно рендерится на сервере, а `currentTime` меняется только в браузере.

---

[README пакета](../../../../README.md)
