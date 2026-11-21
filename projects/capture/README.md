# @erst_dev/ngx-video-capture

Захват кадров, запись фрагментов и GIF из уже играющего `<video>` для плеера
`ngx-video`. `CaptureService` получает нативный `HTMLVideoElement`, снимает данные
через Canvas и `MediaRecorder` и возвращает `Blob` или объект записи, а
`ScreenshotButtonComponent` и `ClipRecorderComponent` — готовые кирпичи поверх
него: кнопка скриншота со скачиванием файла и UI записи клипа с таймером.

Пакет **PRO**: распространяется отдельно от бесплатных пакетов экосистемы.

## Кирпичи

| Кирпич                      | Что решает                          | Статус   |
| --------------------------- | ----------------------------------- | -------- |
| `CaptureService`            | Кадр, клип и GIF без UI             | ✅ готов |
| `ScreenshotButtonComponent` | Кнопка скриншота и скачивание файла | ✅ готов |
| `ClipRecorderComponent`     | UI записи клипа: кнопки и таймер    | ✅ готов |

Все три кирпича пакета готовы: сервис снимает кадр, пишет клип и GIF, кнопка
скриншота вызывает его по клику и скачивает файл, а `ClipRecorderComponent`
управляет UI записи клипа и отдаёт готовый `Blob`. Публикация — в финальной фазе
плана, после сайта с документацией.

## Требования

- Angular 22+
- `@erst_dev/ngx-video-core` (peer-зависимость, для совместной работы с
  `VideoService` и типами ошибок)
- Браузер с Canvas и `MediaRecorder` для записи клипа

Пакет пока не опубликован в npm (рабочая версия `0.0.1`). Внутри монорепо
подключается через `paths` в `tsconfig.base.json`.

## Установка

```sh
npm install @erst_dev/ngx-video-capture
```

## Быстрый старт

```typescript
import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { CaptureService } from '@erst_dev/ngx-video-capture';

@Component({
  selector: 'app-player',
  imports: [VideoDirective],
  providers: [VideoService],
  template: `
    <video #video ngxVideo [src]="src" crossorigin="anonymous" playsinline></video>

    <button type="button" (click)="captureFrame()">Кадр</button>
    <button type="button" (click)="startRecording()">Начать запись</button>
    <button type="button" (click)="stopRecording()">Остановить</button>
    <button type="button" (click)="captureGif()">GIF</button>
  `,
})
export class PlayerComponent {
  private readonly capture = inject(CaptureService);
  private readonly videoRef = viewChild.required<ElementRef<HTMLVideoElement>>('video');
  private recording: ClipRecording | null = null;

  readonly src = 'https://example.com/video.mp4';

  protected async captureFrame(): Promise<void> {
    const blob = await this.capture.captureFrame(this.videoRef().nativeElement, { type: 'image/jpeg', quality: 0.9, maxWidth: 1280 });

    this.download(blob, 'frame.jpg');
  }

  protected startRecording(): void {
    this.recording = this.capture.recordClip(this.videoRef().nativeElement, { videoBitsPerSecond: 2_500_000, timeslice: 1000 });
  }

  protected async stopRecording(): Promise<void> {
    const blob = await this.recording?.stop();

    if (blob) {
      this.download(blob, 'clip.webm');
    }
  }

  protected async captureGif(): Promise<void> {
    const blob = await this.capture.captureGif(this.videoRef().nativeElement, { fps: 10, duration: 2000, width: 320, loop: true });

    this.download(blob, 'capture.gif');
  }

  private download(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
```

`CaptureService` не управляет воспроизведением: `play()`, `pause()`, `seek()` и
`toggle()` остаются за `VideoService`. Скачивание файлов — тоже задача
потребителя: сервис отдаёт только `Blob`.

Запись клипа возвращает объект с сигналом состояния и методами управления:

```typescript
const recording = this.capture.recordClip(video);

recording.state(); // 'recording' | 'stopped' | 'cancelled' | 'error'

const blob = await recording.stop(); // фактический MIME — в blob.type
recording.cancel(); // отмена: ожидающий stop() отклонится с кодом 'aborted'
```

## ScreenshotButtonComponent

Готовая кнопка скриншота: по клику вызывает `CaptureService.captureFrame()`,
эмитит `capture` с готовым `Blob` и по умолчанию скачивает файл. Захват остаётся
в сервисе, а `play()`, `pause()` и `seek()` — за `VideoService`.

```html
<video #video ngxVideo [src]="src" crossorigin="anonymous" playsinline></video>

<ngx-screenshot-button [video]="videoElement()" (capture)="onCapture($event)" (captureError)="onError($event)" />
```

Имя файла собирается с расширением по MIME-типу, ошибки приходят в
`captureError`, а `download = false` оставляет потребителю только `Blob`.
Поддерживаются CSS-переменные `--ngx-screenshot-*`, `customClass`,
`iconTemplate` и SSR.

Подробно — в
[README кирпича](src/lib/components/screenshot-button/README.md).

## ClipRecorderComponent

UI записи клипа: кнопки «Начать запись» и «Остановить», таймер, индикатор и
автоматическая остановка по `maxDuration`. Компонент вызывает
`CaptureService.recordClip()`, владеет полученным `ClipRecording` и отдаёт
готовый `Blob` через `recordStop`; плеером он не управляет и файлы не скачивает.

```html
<video #video ngxVideo [src]="src" crossorigin="anonymous" playsinline></video>

<ngx-clip-recorder [video]="videoElement()" [maxDuration]="30" (recordStart)="onRecordStart()" (recordStop)="onRecordStop($event)" (recordError)="onError($event)" />
```

`maxDuration` — секунды (`0` — без ограничения); ошибки приходят в `recordError`,
а `maxDuration`, `indicatorTemplate`, CSS-переменные и `customClass` настраивают
поведение и вид. SSR безопасен: на верхнем уровне модуля нет DOM и
`MediaRecorder`.

Подробно — в [README кирпича](src/lib/components/clip-recorder/README.md).

## Методы

### captureFrame

Снимает текущий кадр видео в `Blob`.

```typescript
const blob = await capture.captureFrame(video, {
  type: 'image/jpeg',
  quality: 0.9,
  maxWidth: 1280,
  maxHeight: 720,
});
```

| Опция       | По умолчанию | Описание                                            |
| ----------- | ------------ | --------------------------------------------------- |
| `type`      | `image/png`  | `image/png`, `image/jpeg` или `image/webp`          |
| `quality`   | `0.92`       | Качество `0..1`; учитывается только для JPEG и WebP |
| `maxWidth`  | нативная     | Максимальная ширина, px; кадр не увеличивается      |
| `maxHeight` | нативная     | Максимальная высота, px; кадр не увеличивается      |

Кадр рисуется в Canvas с сохранением пропорций; `maxWidth`/`maxHeight` — это
максимум, а не цель. Некорректные числа заменяются дефолтами и зажимаются в
диапазон. Если у видео ещё нет кадра (`videoWidth` или `videoHeight` равны нулю),
промис отклоняется с кодом `no-video`.

### recordClip

Начинает запись фрагмента из текущего состояния видео.

```typescript
const recording = capture.recordClip(video, {
  mimeType: 'video/webm;codecs=vp9,opus',
  videoBitsPerSecond: 2_500_000,
  audioBitsPerSecond: 128_000,
  timeslice: 1000,
});
```

| Опция                | По умолчанию | Описание                                               |
| -------------------- | ------------ | ------------------------------------------------------ |
| `mimeType`           | автоподбор   | Явный MIME; неподдержанный — ошибка `recording-failed` |
| `videoBitsPerSecond` | `2 500 000`  | Битрейт видео                                          |
| `audioBitsPerSecond` | `128 000`    | Битрейт звука                                          |
| `timeslice`          | `1000`       | Интервал отдачи данных, мс; `0` — без `timeslice`      |

Если `mimeType` не задан, выбирается первый поддержанный из
`video/webm;codecs=vp9,opus`, `video/webm;codecs=vp8,opus`, `video/webm`,
`video/mp4` через `MediaRecorder.isTypeSupported`. Итоговый MIME всегда доступен в
`blob.type`.

`ClipRecording`:

- `state` — сигнал `'recording' | 'stopped' | 'cancelled' | 'error'`;
- `stop()` — останавливает запись и отдаёт `Blob`; идемпотентен: повторный вызов
  возвращает тот же промис; пустые данные — ошибка `recording-failed`;
- `cancel()` — останавливает `MediaRecorder`, выбрасывает данные и останавливает
  треки `MediaStream`; состояние `cancelled`, ожидающий `stop()` отклоняется с
  кодом `aborted`.

Запись идёт из текущего состояния: если видео на паузе, кадры в клипе могут
повторяться — это ответственность родителя, сервис `play()` не вызывает. Ошибка
`MediaRecorder` переводит запись в состояние `error`, а ожидающий `stop()` — в
отказ с кодом `recording-failed`.

### captureGif

Записывает GIF из текущего состояния видео.

```typescript
const blob = await capture.captureGif(video, {
  fps: 10,
  duration: 2000,
  width: 320,
  loop: true,
});
```

| Опция      | По умолчанию | Описание                                   |
| ---------- | ------------ | ------------------------------------------ |
| `fps`      | `10`         | Частота кадров, от 1 до 30                 |
| `duration` | `3000`       | Длительность, мс, от 100 до 15 000         |
| `width`    | `320`        | Ширина GIF, px, от 16 до 640               |
| `loop`     | `true`       | Зацикливание через Netscape loop extension |

Результат — настоящий `image/gif`, собранный собственным энкодером без
зависимостей: заголовок GIF89a, глобальная палитра 256 цветов 3-3-2, ближайший
цвет для каждого пикселя, LZW с минимальным размером кода 8, Graphic Control
Extension с задержкой `max(2, round(100 / fps))` сотых секунды и Netscape loop
extension при `loop: true`. Высота считается по пропорциям видео.

## Ошибки

Методы отклоняют промис или бросают обычный объект `CaptureError` — так же, как
`core` отдаёт `VideoError`:

```typescript
interface CaptureError {
  readonly code: CaptureErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}
```

| Код                | Когда возникает                                                 |
| ------------------ | --------------------------------------------------------------- |
| `unsupported`      | Нет нужного API или серверный рендеринг                         |
| `no-video`         | У видео ещё нет кадра: метаданные не загружены                  |
| `canvas-failed`    | Canvas не создался, `toBlob` вернул `null` или canvas «грязный» |
| `recording-failed` | Неподдержанный MIME, отказ `captureStream()` или пустая запись  |
| `gif-failed`       | Не удалось закодировать GIF                                     |
| `aborted`          | Запись отменена через `cancel()`                                |

`code` — машинный контракт, `message` — готовый русский текст, `cause` —
исходная ошибка (`DOMException`, `Error`). Логику стройте на `code`.

## SSR

Сервис можно внедрять на сервере: на верхнем уровне модуля нет `window`,
`document` и `MediaRecorder`. На сервере методы отклоняются (а `recordClip`
бросает) с кодом `unsupported`; проверка идёт через
`isPlatformBrowser`/`PLATFORM_ID`.

## CORS и canvas taint

Кадр и GIF читаются из Canvas. Если видео загружено с другого origin без
CORS-заголовков, canvas становится «грязным» и `toBlob`/`getImageData` бросают
`SecurityError` — сервис отдаёт `canvas-failed` с исходной ошибкой в `cause`.
Поэтому у `<video>` нужен `crossorigin="anonymous"`, а сервер видео — заголовок
`Access-Control-Allow-Origin`.

`MediaRecorder` работает с уже полученным потоком: `video.captureStream()` может
отказать для защищённого контента (DRM/EME) — это тоже `recording-failed`.

## Ограничения GIF

- Палитра фиксированная: 256 цветов 3-3-2, без подбора под кадр и без
  дизеринга — плавные градиенты могут выглядеть грубее оригинала.
- Прозрачности нет: все кадры непрозрачные, Graphic Control Extension без
  transparent index.
- Локальных палитр нет: одна глобальная на весь файл.
- Задержка кадра одна на файл и не может быть меньше 2 сотых секунды.
- Размер файла растёт с `width × fps × duration`: 320 px, 10 к/с и 2–3 секунды —
  разумный выбор для превью.

## Совместимость

Имена методов, поля опций, структура `CaptureError` и значения `CaptureErrorCode`
— публичный контракт. Пока версия `0.x`, API может меняться в минорных релизах;
ломающие изменения — только в мажорной версии. Публичный API `core` пакет не
меняет.

## Лицензия

MIT

---

Документация ядра: [@erst_dev/ngx-video-core](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/core/README.md).
