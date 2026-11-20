# ScreenshotButtonComponent

Кнопка скриншота для уже играющего `<video>`. Захват кадра делегирует
`CaptureService`, отдаёт готовый `Blob` через выход `capture` и по умолчанию
скачивает файл. Плеером не управляет.

Селектор: `ngx-screenshot-button`.

> **PRO.** Компонент входит в платный пакет `@erst_dev/ngx-video-capture`.

## Назначение и границы ответственности

**Делает:**

- по клику вызывает `CaptureService.captureFrame(video, options)` и передаёт
  `type`, `quality`, `maxWidth`, `maxHeight`;
- блокирует кнопку, пока кадр снимается, и выставляет `aria-busy="true"`;
- эмитит `capture` с готовым `Blob`;
- при `download = true` скачивает файл временной ссылкой `<a download>`;
- собирает имя файла с расширением по MIME-типу кадра;
- отдаёт ошибки в `captureError`, оборачивая чужое исключение в `canvas-failed`;
- поддерживает `customClass`, CSS-переменные и `iconTemplate`.

**Не делает:**

- не снимает кадр сам и не работает с Canvas — это `CaptureService`;
- не вызывает `play()`, `pause()`, `seek()` и не управляет `VideoService`;
- не хранит историю кадров и не скачивает ничего при инициализации;
- не обращается к `window`, `document` и `MediaRecorder` на верхнем уровне
  модуля — SSR безопасен;
- не является обязательным: если `CaptureService` не нужен, кнопку можно не
  подключать.

## Импорт

```ts
import { ScreenshotButtonComponent } from '@erst_dev/ngx-video-capture';
import type { ScreenshotButtonIconContext } from '@erst_dev/ngx-video-capture';
```

## Использование

```ts
import { Component, ElementRef, computed, viewChild } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { ScreenshotButtonComponent } from '@erst_dev/ngx-video-capture';
import type { CaptureError } from '@erst_dev/ngx-video-capture';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, ScreenshotButtonComponent],
  providers: [VideoService],
  template: `
    <video #video ngxVideo [src]="src" crossorigin="anonymous" playsinline></video>

    <ngx-screenshot-button [video]="videoElement()" (capture)="onCapture($event)" (captureError)="onError($event)" />
  `,
})
export class PlayerComponent {
  private readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');

  readonly src = 'https://example.com/video.mp4';

  /** Пока элемента нет, сюда приходит null — кнопка просто отключена. */
  protected readonly videoElement = computed(() => this.videoRef()?.nativeElement ?? null);

  protected onCapture(blob: Blob): void {
    // Blob уже готов, скачивание (если включено) уже запущено.
    console.log(blob.type, blob.size);
  }

  protected onError(error: CaptureError): void {
    console.warn(error.code, error.message);
  }
}
```

`crossorigin="anonymous"` обязателен, если видео приходит с другого origin без
CORS-заголовков: иначе Canvas станет «грязным» и `CaptureService` отдаст
`canvas-failed`.

## Входы

| Вход           | Тип                                                | По умолчанию | Описание                                                     |
| -------------- | -------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| `video`        | `HTMLVideoElement \| null`                         | `null`       | Видео, с которого снимается кадр; без него кнопка отключена  |
| `type`         | `'image/png' \| 'image/jpeg' \| 'image/webp'`      | `image/png`  | MIME-тип кадра                                               |
| `quality`      | `number`                                           | `0.92`       | Качество для JPEG и WebP, от 0 до 1                          |
| `maxWidth`     | `number \| null`                                   | `null`       | Максимальная ширина кадра; `null` — нативная                 |
| `maxHeight`    | `number \| null`                                   | `null`       | Максимальная высота кадра; `null` — нативная                 |
| `fileName`     | `string`                                           | `screenshot` | Базовое имя файла без расширения                             |
| `download`     | `boolean`                                          | `true`       | Скачивать файл после успешного кадра                         |
| `disabled`     | `boolean`                                          | `false`      | Дополнительная блокировка кнопки                             |
| `customClass`  | `string`                                           | `''`         | Дополнительный CSS-класс для хоста `<ngx-screenshot-button>` |
| `ariaLabel`    | `string \| null`                                   | `null`       | Переопределение `aria-label` для обоих состояний             |
| `iconTemplate` | `TemplateRef<ScreenshotButtonIconContext> \| null` | `null`       | Пользовательская иконка вместо стандартной SVG-камеры        |

`maxWidth`/`maxHeight` — это максимум, а не цель: сервис сохраняет пропорции и
не увеличивает кадр. `quality` учитывается только для JPEG и WebP.

## Выходы

| Выход          | Тип            | Описание                                                                  |
| -------------- | -------------- | ------------------------------------------------------------------------- |
| `capture`      | `Blob`         | Успешный кадр; скачивание (если включено) уже запущено                    |
| `captureError` | `CaptureError` | Ошибка захвата; кнопка снова активна, исключение наружу не пробрасывается |

Выход называется `captureError`, а не `error`: имя `error` конфликтует с
нативным DOM-событием и правилом `no-output-native`.

## Скачивание и имя файла

Скачивание запускается только по клику и только после успешного кадра. Компонент
создаёт временную ссылку `<a download>`, object URL через
`URL.createObjectURL(blob)`, вызывает `a.click()` и освобождает URL после клика.
`download = false` ничего не скачивает: потребитель получает `Blob` и
распоряжается им сам.

Имя собирается функцией `buildFileName(fileName, type)`:

- имя обрезается по краям;
- пустое имя заменяется на `screenshot`;
- существующее расширение `.png`, `.jpg`, `.jpeg` или `.webp` срезается;
- добавляется расширение по MIME: `image/png` → `.png`, `image/jpeg` → `.jpg`,
  `image/webp` → `.webp`.

| `fileName`       | `type`       | Результат        |
| ---------------- | ------------ | ---------------- |
| `frame`          | `image/png`  | `frame.png`      |
| `  frame.jpeg  ` | `image/png`  | `frame.png`      |
| `frame`          | `image/jpeg` | `frame.jpg`      |
| `frame`          | `image/webp` | `frame.webp`     |
| `''`             | `image/jpeg` | `screenshot.jpg` |

`fileName` не санитизируется: путь и недопустимые символы — ответственность
потребителя.

## Ошибки

`captureError` отдаёт обычный объект `CaptureError` из `CaptureService`:

```ts
interface CaptureError {
  readonly code: CaptureErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}
```

Коды сервиса: `unsupported`, `no-video`, `canvas-failed`, `recording-failed`,
`gif-failed`, `aborted`; для кадра актуальны первые три. Если из сервиса
прилетело нечто иное, компонент оборачивает исключение в `canvas-failed` с
исходной ошибкой в `cause`. Исключение не пробрасывается — реагируйте на
`captureError` и стройте логику на `code`.

## CSS-переменные

Все значения заданы в `:host`, поэтому кнопка работает из коробки и
переопределяется без правки исходников.

| Переменная                          | По умолчанию         | Описание                           |
| ----------------------------------- | -------------------- | ---------------------------------- |
| `--ngx-screenshot-size`             | `40px`               | Размер кнопки (квадрат)            |
| `--ngx-screenshot-icon-size`        | `55%`                | Размер стандартной SVG-иконки      |
| `--ngx-screenshot-color`            | `#ffffff`            | Цвет иконки                        |
| `--ngx-screenshot-bg`               | `rgba(0, 0, 0, 0.7)` | Фон кнопки                         |
| `--ngx-screenshot-hover-bg`         | `rgba(0, 0, 0, 0.9)` | Фон при наведении                  |
| `--ngx-screenshot-border-radius`    | `50%`                | Скругление                         |
| `--ngx-screenshot-transition`       | `0.15s ease`         | Переход фона, цвета и прозрачности |
| `--ngx-screenshot-focus-color`      | `#34d399`            | Цвет `:focus-visible` outline      |
| `--ngx-screenshot-disabled-opacity` | `0.5`                | Прозрачность отключённой кнопки    |

`--ngx-screenshot-icon-size` действует только на стандартную SVG-иконку.
Содержимое `iconTemplate` компонент не масштабирует — размер задаётся вашими
стилями.

## Стилизация

Переопределение на самом компоненте:

```scss
ngx-screenshot-button {
  --ngx-screenshot-size: 48px;
  --ngx-screenshot-bg: transparent;
  --ngx-screenshot-hover-bg: rgba(255, 255, 255, 0.15);
  --ngx-screenshot-border-radius: 8px;
}
```

Через `customClass` — класс вешается на **хост-элемент** `<ngx-screenshot-button>`:

```html
<ngx-screenshot-button customClass="my-screenshot" [video]="videoElement()" (capture)="onCapture($event)" />
```

```scss
/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-screenshot {
  --ngx-screenshot-size: 36px;
  --ngx-screenshot-focus-color: #fbbf24;
  --ngx-screenshot-bg: #1f2937;
  --ngx-screenshot-hover-bg: #374151;
  --ngx-screenshot-border-radius: 8px;
}
```

`customClass` не затрагивает классы, заданные на элементе вручную:
`<ngx-screenshot-button class="layout-wide" customClass="my-screenshot">`
сохранит оба.

## Своя иконка

```html
<ngx-screenshot-button [video]="videoElement()" [iconTemplate]="myIcon" (capture)="onCapture($event)" />

<ng-template #myIcon let-capturing="capturing">
  <span class="my-icon">{{ capturing ? '…' : '📷' }}</span>
</ng-template>
```

В шаблон передаётся контекст:

```ts
interface ScreenshotButtonIconContext {
  readonly capturing: boolean;
}
```

Пользовательский шаблон рендерится внутри кнопки вместо стандартной SVG-иконки;
размер контейнера и цвета по-прежнему задаются CSS-переменными.

## Доступность

- Рендерится нативный `<button type="button">` — Enter/Space, фокус и семантика
  кнопки работают без дополнительного кода.
- `aria-label` по умолчанию «Сделать скриншот», во время захвата — «Сохранение
  кадра…»; вход `ariaLabel` переопределяет оба.
- `aria-busy` отражает состояние захвата, `disabled` — недоступность кнопки.
  Пока кадр снимается, повторные клики игнорируются.
- Видимый `:focus-visible` outline.
- SVG-иконка помечена `aria-hidden="true"` и `focusable="false"`, чтобы не
  попадать в дерево доступности.
- При `prefers-reduced-motion: reduce` переходы отключаются.

## SSR

На верхнем уровне модуля нет `window`, `document` и `MediaRecorder`.
`document` используется только в обработчике клика — при создании временной
ссылки `<a download>`. Поэтому компонент безопасно рендерится на сервере, а
захват кадра на сервере в принципе недоступен: `CaptureService` в этом случае
отдаёт `unsupported`.

---

[README пакета](../../../../README.md)
