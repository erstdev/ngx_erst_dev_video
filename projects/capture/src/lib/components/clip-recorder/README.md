# ClipRecorderComponent

UI записи клипа для уже играющего `<video>`. По клику вызывает
`CaptureService.recordClip()`, владеет полученным `ClipRecording`, показывает
таймер и лимит `maxDuration`, а готовый `Blob` отдаёт через выход `recordStop`.
Плеером не управляет и файлы не скачивает.

Селектор: `ngx-clip-recorder`.

> **PRO.** Компонент входит в платный пакет `@erst_dev/ngx-video-capture`.

## Назначение и границы ответственности

**Делает:**

- по клику вызывает `CaptureService.recordClip(video, options)` и передаёт
  `mimeType`, `videoBitsPerSecond`, `audioBitsPerSecond`, `timeslice`;
- после успешного старта показывает таймер и индикацию, эмитит `recordStart`;
- останавливает запись по клику или автоматически по `maxDuration`;
- эмитит `recordStop` с готовым `Blob` и фактическим MIME-типом;
- отдаёт ошибки старта и остановки в `recordError`, оборачивая чужое исключение
  в `recording-failed`;
- поддерживает `customClass`, CSS-переменные и `indicatorTemplate`.

**Не делает:**

- не управляет плеером: `play()`, `pause()`, `seek()` и `VideoService` — не его
  зона;
- не работает с Canvas и `MediaRecorder` напрямую — это `CaptureService`;
- не скачивает файл и не хранит историю записей: `Blob` уходит потребителю;
- не отменяет запись по клику: отмена возможна только при уничтожении
  компонента;
- не обращается к `window`, `document` и `MediaRecorder` на верхнем уровне
  модуля — SSR безопасен.

## Импорт

```ts
import { ClipRecorderComponent } from '@erst_dev/ngx-video-capture';
import type { ClipRecorderIndicatorContext } from '@erst_dev/ngx-video-capture';
```

## Использование

```ts
import { Component, ElementRef, computed, viewChild } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { ClipRecorderComponent } from '@erst_dev/ngx-video-capture';
import type { CaptureError } from '@erst_dev/ngx-video-capture';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, ClipRecorderComponent],
  providers: [VideoService],
  template: `
    <video #video ngxVideo [src]="src" crossorigin="anonymous" playsinline></video>

    <ngx-clip-recorder [video]="videoElement()" [maxDuration]="30" (recordStart)="onRecordStart()" (recordStop)="onRecordStop($event)" (recordError)="onError($event)" />
  `,
})
export class PlayerComponent {
  private readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');

  readonly src = 'https://example.com/video.mp4';

  /** Пока элемента нет, сюда приходит null — старт записи отключён. */
  protected readonly videoElement = computed(() => this.videoRef()?.nativeElement ?? null);

  protected onRecordStart(): void {
    // ClipRecording уже создан, запись идёт, таймер запущен.
  }

  protected onRecordStop(blob: Blob): void {
    // blob.type — фактический MIME, например video/webm;codecs=vp9,opus.
    // Скачивание и предпросмотр — задача потребителя.
    const url = URL.createObjectURL(blob);

    console.log(blob.type, blob.size, url);
  }

  protected onError(error: CaptureError): void {
    console.warn(error.code, error.message);
  }
}
```

`crossorigin="anonymous"` нужен, если видео приходит с другого origin: без
CORS-заголовков запись через `video.captureStream()` может быть недоступна, а
сервис вернёт `recording-failed`.

## Входы

| Вход                 | Тип                                                 | По умолчанию | Описание                                                 |
| -------------------- | --------------------------------------------------- | ------------ | -------------------------------------------------------- |
| `video`              | `HTMLVideoElement \| null`                          | `null`       | Видео для записи; без него старт заблокирован            |
| `maxDuration`        | `number`                                            | `30`         | Лимит записи в секундах; `0` — без ограничения           |
| `mimeType`           | `string \| null`                                    | `null`       | Явный MIME; `null` — автоподбор в сервисе                |
| `videoBitsPerSecond` | `number`                                            | `2 500 000`  | Битрейт видео, бит/с                                     |
| `audioBitsPerSecond` | `number`                                            | `128 000`    | Битрейт звука, бит/с                                     |
| `timeslice`          | `number`                                            | `1000`       | Интервал отдачи данных, мс; `0` — без `timeslice`        |
| `disabled`           | `boolean`                                           | `false`      | Дополнительная блокировка старта                         |
| `customClass`        | `string`                                            | `''`         | Дополнительный CSS-класс для хоста `<ngx-clip-recorder>` |
| `ariaLabel`          | `string \| null`                                    | `null`       | Переопределение `aria-label` группы                      |
| `indicatorTemplate`  | `TemplateRef<ClipRecorderIndicatorContext> \| null` | `null`       | Пользовательский индикатор вместо стандартной точки      |

`mimeType`, битрейты и `timeslice` передаются в `recordClip()` как есть; `null` у
`mimeType` означает автоподбор, а некорректные числа нормализует сервис.

## Выходы

| Выход         | Тип            | Описание                                                            |
| ------------- | -------------- | ------------------------------------------------------------------- |
| `recordStart` | `void`         | Запись успешно началась: `ClipRecording` уже создан, таймер запущен |
| `recordStop`  | `Blob`         | Запись остановлена: готовый `Blob` с фактическим MIME-типом         |
| `recordError` | `CaptureError` | Ошибка старта или остановки; исключение наружу не пробрасывается    |

Выход называется `recordError`, а не `error`: имя `error` конфликтует с нативным
DOM-событием и правилом `no-output-native`.

## Состояния и таймер

| Состояние   | Кнопка «Начать запись» | Кнопка «Остановить» | Таймер               |
| ----------- | ---------------------- | ------------------- | -------------------- |
| Ожидание    | доступна при видео     | отключена           | `00:00`              |
| Запись      | отключена              | доступна            | растёт               |
| Остановка   | отключена              | отключена           | растёт до готовности |
| После стопа | доступна при видео     | отключена           | фактическая длина    |

- Таймер обновляется каждые `250` мс, но создаётся только в обработчике клика —
  на сервере интервалов нет.
- После остановки таймер фиксируется на фактической длительности; новый старт
  снова начинает с `00:00`.
- Пока идёт запись, повторные клики по старту игнорируются. Повторный клик по
  «Остановить» во время остановки тоже игнорируется.
- Если включён вход `disabled`, старт заблокирован, но «Остановить» остаётся
  доступной, пока запись активна: запись нужно уметь завершить.
- После остановки или ошибки старт снова доступен, если есть `video` и не
  включён `disabled`.

## maxDuration

`maxDuration` — лимит в секундах. Значение фиксируется на момент старта:
изменение входа во время записи не меняет текущий лимит.

| Значение             | Поведение                |
| -------------------- | ------------------------ |
| `0`                  | без ограничения          |
| отрицательное        | приводится к `0`         |
| больше `3600`        | приводится к `3600`      |
| `NaN`/`Infinity`     | заменяется на `30`       |
| `5`, `10`, `30`, ... | авто-стоп через N секунд |

При достижении лимита компонент вызывает ту же остановку, что и кнопка:
`recordStop` эмитится один раз, таймер фиксируется на фактической длительности.

## Ошибки

`recordError` отдаёт обычный объект `CaptureError` из `CaptureService`:

```ts
interface CaptureError {
  readonly code: CaptureErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}
```

- `recordClip()` упал синхронно — ошибка уходит в `recordError` как есть;
- `stop()` отклонился — ошибка уходит в `recordError` как есть;
- чужое исключение оборачивается в `recording-failed` с исходной ошибкой в
  `cause`;
- если `ClipRecording.state()` перешла в `error` во время записи, компонент
  останавливает таймер и эмитит `recordError` без ожидания клика;
- после ошибки кнопки снова доступны, исключение наружу не пробрасывается.

Актуальные коды: `unsupported` (нет API или сервер), `recording-failed`
(неподдержанный MIME, отказ `captureStream()`, пустая запись, ошибка
`MediaRecorder`) и `aborted` (запись отменена при уничтожении компонента).
На уничтожении компонент очищает интервал, вызывает `cancel()` у активной записи
и больше не эмитит выходы.

## CSS-переменные

Все значения заданы в `:host`, поэтому компонент работает из коробки и
переопределяется без правки исходников.

| Переменная                        | По умолчанию | Описание                                  |
| --------------------------------- | ------------ | ----------------------------------------- |
| `--ngx-recorder-gap`              | `0.5rem`     | Расстояние между элементами группы        |
| `--ngx-recorder-radius`           | `999px`      | Скругление кнопок                         |
| `--ngx-recorder-font-size`        | `0.8125rem`  | Размер шрифта кнопок и таймера            |
| `--ngx-recorder-color`            | `#e5e7eb`    | Цвет текста кнопок                        |
| `--ngx-recorder-bg`               | `#111827`    | Фон кнопок                                |
| `--ngx-recorder-hover-bg`         | `#1f2937`    | Фон кнопок при наведении                  |
| `--ngx-recorder-border-color`     | `#374151`    | Цвет рамки кнопок                         |
| `--ngx-recorder-record-color`     | `#ef4444`    | Цвет точки старта и индикатора записи     |
| `--ngx-recorder-stop-color`       | `#f59e0b`    | Цвет индикатора остановки                 |
| `--ngx-recorder-timer-color`      | `#9ca3af`    | Цвет таймера                              |
| `--ngx-recorder-focus-color`      | `#34d399`    | Цвет `:focus-visible` outline             |
| `--ngx-recorder-disabled-opacity` | `0.5`        | Прозрачность отключённой кнопки           |
| `--ngx-recorder-transition`       | `0.15s ease` | Переход фона, рамки, цвета и прозрачности |

## Стилизация

Переопределение на самом компоненте:

```scss
ngx-clip-recorder {
  --ngx-recorder-radius: 12px;
  --ngx-recorder-bg: #0f172a;
  --ngx-recorder-record-color: #f97316;
}
```

Через `customClass` — класс вешается на **хост-элемент**
`<ngx-clip-recorder>`:

```html
<ngx-clip-recorder customClass="my-recorder" [video]="videoElement()" />
```

```scss
/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-recorder {
  --ngx-recorder-radius: 8px;
  --ngx-recorder-font-size: 0.75rem;
  --ngx-recorder-focus-color: #fbbf24;
}
```

`customClass` не затрагивает классы, заданные на элементе вручную:
`<ngx-clip-recorder class="layout-wide" customClass="my-recorder">` сохранит оба.

## Свой индикатор

```html
<ngx-clip-recorder [video]="videoElement()" [indicatorTemplate]="myIndicator" (recordStart)="onRecordStart()" (recordStop)="onRecordStop($event)" />

<ng-template #myIndicator let-recording="recording" let-stopping="stopping">
  <span class="my-indicator" aria-hidden="true"> {{ stopping ? '…' : recording ? 'REC' : 'IDLE' }} </span>
</ng-template>
```

В шаблон передаётся контекст:

```ts
interface ClipRecorderIndicatorContext {
  readonly recording: boolean;
  readonly stopping: boolean;
}
```

Стандартный индикатор — пульсирующая точка, декоративная (`aria-hidden`).
Пользовательский шаблон рендерится на её месте; размеры и цвета задаются вашими
стилями.

## Доступность

- Внутренняя группа имеет `role="group"` и `aria-label` «Запись клипа»;
  `ariaLabel` переопределяет имя.
- Кнопки — нативные `<button type="button">` с именами «Начать запись» и
  «Остановить запись»; Enter/Space, фокус и семантика работают без
  дополнительного кода.
- Таймер — `role="timer"` с `aria-live="off"`: значение не зачитывается
  скринридером на каждом тике.
- Стандартная точка помечена `aria-hidden="true"` и не попадает в дерево
  доступности.
- Видимый `:focus-visible` outline; при `prefers-reduced-motion: reduce`
  анимация и переходы отключаются.

## SSR

На верхнем уровне модуля нет `window`, `document` и `MediaRecorder`.
`setInterval` создаётся только в обработчике клика, поэтому создание компонента
на сервере не падает. Сама запись на сервере недоступна: `recordClip()` в этом
случае вернёт `CaptureError` с кодом `unsupported` — компонент отдаст его в
`recordError` и не пробросит исключение.

---

[README пакета](../../../../README.md)
