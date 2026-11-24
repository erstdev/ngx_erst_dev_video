# @erst_dev/ngx-video-core

Фундамент экосистемы `ngx-video`: headless-сервис и директива для работы с
`<video>`. Пакет не содержит разметки и стилей — только состояние и управление
медиа-элементом.

## Что внутри

| Сущность                                     | Назначение                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `VideoService`                               | Единственный источник правды о состоянии `<video>`: сигналы, Observable, команды управления |
| `VideoDirective` (`[ngxVideo]`)              | Связывает элемент `<video>` с сервисом: `connect()` / `disconnect()`                        |
| `VideoState`, `VideoError`, `VideoErrorCode` | Типы состояния и ошибок                                                                     |
| `Quality`                                    | Общий тип уровня качества для будущего пакета `sources`                                     |
| `formatTime`                                 | Форматирование секунд в `мм:сс` / `ч:мм:сс`                                                 |

## Требования

- Angular 22+
- RxJS 7.8+

Пакет пока не опубликован в npm (готовится версия `1.0.0`). Внутри монорепо
подключается через `paths` в `tsconfig.base.json`.

## Установка

```sh
npm install @erst_dev/ngx-video-core
```

## Быстрый старт

```typescript
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';

@Component({
  selector: 'app-player',
  imports: [VideoDirective],
  template: `
    <video ngxVideo [src]="src" playsinline (click)="video.toggle()"></video>

    <button type="button" (click)="video.toggle()">
      {{ video.isPlaying() ? 'Пауза' : 'Играть' }}
    </button>

    <span>{{ video.time() }} / {{ video.duration() }}</span>
    <span>state: {{ video.state() }}</span>
  `,
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';
}
```

Директива находит `<video>`, при инициализации вызывает `connect()` и с этого
момента сервис слушает нативные события элемента. При уничтожении компонента —
`disconnect()` и сброс состояния.

## Как это работает

**Источник правды — сигналы.** Внутри сервиса состояние хранится в
`WritableSignal`, наружу отдаётся через `asReadonly()`. Observable-зеркала
создаются из сигналов через `toObservable()`, поэтому оба представления всегда
согласованы: нельзя получить расхождение между `time()` и `time$`.

**Никакой магии с DOM.** Сервис не создаёт элементов, не управляет вёрсткой и не
знает про CSS. Всё, что он делает, — читает и пишет свойства `HTMLVideoElement` и
слушает его события.

**Ошибки нормализуются.** Нативные `MediaError` и отказы браузера превращаются в
`VideoError` с машинным кодом, чтобы UI не зависел от текста сообщения.

### Несколько плееров на странице

По умолчанию `VideoService` — синглтон (`providedIn: 'root'`), этого достаточно
для одного плеера. Если плееров несколько, добавьте `providers: [VideoService]` в
компонент плеера — директива внутри его шаблона получит локальный экземпляр:

```typescript
@Component({
  selector: 'app-player',
  imports: [VideoDirective],
  providers: [VideoService],
  templateUrl: './player.html',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
}
```

Без локального провайдера два `<video ngxVideo>` в одном приложении будут делить
один экземпляр сервиса, и состояние будет «перескакивать» между элементами.

## API

### Жизненный цикл

| Метод                                      | Описание                                                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `connect(element: HTMLVideoElement): void` | Привязать сервис к элементу. Вызывается директивой; вручную нужен только при использовании сервиса без неё |
| `disconnect(): void`                       | Снять слушатели и сбросить состояние. Элемент из DOM не удаляется                                          |

```typescript
export class PlayerComponent implements AfterViewInit, OnDestroy {
  readonly video = inject(VideoService);
  private readonly videoEl = viewChild.required<ElementRef<HTMLVideoElement>>('videoEl');

  ngAfterViewInit(): void {
    this.video.connect(this.videoEl().nativeElement);
  }

  ngOnDestroy(): void {
    this.video.disconnect();
  }
}
```

### Сигналы состояния

| Сигнал         | Тип                          | Описание                                                                 |
| -------------- | ---------------------------- | ------------------------------------------------------------------------ |
| `time`         | `Signal<number>`             | Текущая позиция в секундах                                               |
| `duration`     | `Signal<number>`             | Длительность в секундах (`0`, пока нет метаданных)                       |
| `state`        | `Signal<VideoState>`         | Состояние плеера                                                         |
| `volume`       | `Signal<number>`             | Громкость `0…1`                                                          |
| `muted`        | `Signal<boolean>`            | Звук выключен                                                            |
| `playbackRate` | `Signal<number>`             | Скорость воспроизведения                                                 |
| `buffered`     | `Signal<number>`             | Конец буферизованного диапазона, содержащего текущую позицию, в секундах |
| `fullscreen`   | `Signal<boolean>`            | Полноэкранный режим                                                      |
| `error`        | `Signal<VideoError \| null>` | Последняя ошибка                                                         |

Производные значения:

| Сигнал      | Тип               | Описание                                                      |
| ----------- | ----------------- | ------------------------------------------------------------- |
| `progress`  | `Signal<number>`  | Прогресс `0…1` (`time / duration`, ограничен сверху единицей) |
| `isPlaying` | `Signal<boolean>` | `state === 'playing'` (буферизация сюда не входит)            |
| `hasError`  | `Signal<boolean>` | Есть активная ошибка                                          |

### Observable-зеркала

Для каждого сигнала есть RxJS-представление:

`time$`, `duration$`, `state$`, `volume$`, `muted$`, `playbackRate$`,
`buffered$`, `fullscreen$`, `error$`.

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

readonly time = toSignal(inject(VideoService).time$, { initialValue: 0 });
```

Для шаблонов удобнее сигналы, для операторов (`debounceTime`, `switchMap`,
`combineLatest`) — Observable. Оба представления синхронны между собой.

### Команды

| Метод                           | Возвращает      | Описание                                                                         |
| ------------------------------- | --------------- | -------------------------------------------------------------------------------- |
| `play()`                        | `Promise<void>` | Запуск воспроизведения. Не бросает исключений: отказ браузера попадает в `error` |
| `pause()`                       | `void`          | Пауза                                                                            |
| `toggle()`                      | `void`          | Переключить воспроизведение                                                      |
| `seek(time: number)`            | `void`          | Перемотка на абсолютную позицию; значение обрезается границами видео             |
| `seekBy(delta: number)`         | `void`          | Перемотка на смещение (может быть отрицательным)                                 |
| `setVolume(volume: number)`     | `void`          | Громкость `0…1`; значение обрезается                                             |
| `setMuted(muted: boolean)`      | `void`          | Включить/выключить звук                                                          |
| `toggleMute()`                  | `void`          | Переключить звук                                                                 |
| `setPlaybackRate(rate: number)` | `void`          | Скорость воспроизведения (значения `<= 0` игнорируются)                          |
| `requestFullscreen()`           | `Promise<void>` | Запросить полноэкранный режим для `<video>`                                      |
| `exitFullscreen()`              | `Promise<void>` | Выйти из полноэкранного режима                                                   |
| `toggleFullscreen()`            | `Promise<void>` | Переключить полноэкранный режим                                                  |

Особенности:

- `play()` игнорирует `AbortError` (воспроизведение прервали `pause`/`seek`) и
  превращает `NotAllowedError` (автоплей заблокирован) в ошибку с кодом
  `playback-blocked`.
- `seek()` не падает, если элемент ещё не готов к перемотке: команда
  игнорируется, а актуальное время придёт из событий элемента.
- `requestFullscreen()`/`exitFullscreen()` не бросают исключений: отказ браузера
  (например, iframe без `allowfullscreen`) просто игнорируется.

### Директива

Селектор: `video[ngxVideo]`, `exportAs: 'ngxVideo'`.

```html
<video ngxVideo [src]="src"></video>
```

Доступ к сервису через `exportAs`:

```html
<video ngxVideo #player="ngxVideo" [src]="src"></video> <button (click)="player.service.toggle()">Play</button>
```

### Типы

```typescript
type VideoState = 'idle' | 'playing' | 'paused' | 'buffering' | 'seeking' | 'ended' | 'error';

type VideoErrorCode = 'aborted' | 'network' | 'decode' | 'source-not-supported' | 'playback-blocked' | 'unknown';

interface VideoError {
  readonly code: VideoErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}

interface QualityInterface {
  readonly id: string;
  readonly label: string;
  readonly width?: number;
  readonly height?: number;
  readonly bitrate?: number;
}
```

`Quality` объявлен в `core` как общий тип для пакета `sources` (HLS/DASH и выбор
качества). Сам `VideoService` его не использует.

### Утилита `formatTime`

```typescript
import { formatTime } from '@erst_dev/ngx-video-core';

formatTime(0); // '00:00'
formatTime(7); // '00:07'
formatTime(67); // '01:07'
formatTime(3599); // '59:59'
formatTime(3600); // '1:00:00'
formatTime(3723); // '1:02:03'
formatTime(Number.NaN); // '00:00'
formatTime(-5); // '00:00'
formatTime(null); // '00:00'
```

Некорректные значения (`NaN`, `Infinity`, `null`, `undefined`, отрицательные)
превращаются в `'00:00'`, чтобы шаблон никогда не показывал мусор.

## Машина состояний

`VideoState` меняется в ответ на нативные события элемента:

| Событие           | Результат                                                    |
| ----------------- | ------------------------------------------------------------ |
| `play`, `playing` | `playing`                                                    |
| `pause`           | `paused` (кроме случая, когда воспроизведение уже завершено) |
| `ended`           | `ended`                                                      |
| `waiting`         | `buffering`                                                  |
| `canplay`         | `paused`/`playing`, если до этого была буферизация           |
| `seeking`         | `seeking`                                                    |
| `seeked`          | `ended`, `paused` или `playing` — в зависимости от элемента  |
| `loadedmetadata`  | `paused`/`playing`, плюс запись `duration` и `time`          |
| `loadstart`       | сброс ошибки, `idle`                                         |
| `emptied`         | `time = 0`, `duration = 0`, `buffered = 0`, `idle`           |
| `error`           | `error` + заполненный `VideoError`                           |

Смысл значений:

- `idle` — элемент есть, но метаданные ещё не загружены;
- `playing` — идёт воспроизведение;
- `paused` — пауза;
- `buffering` — идёт подгрузка, воспроизведение приостановлено;
- `seeking` — выполняется перемотка;
- `ended` — воспроизведение завершено;
- `error` — произошла ошибка.

## Ошибки

| Код                    | Источник                                                      |
| ---------------------- | ------------------------------------------------------------- |
| `aborted`              | `MediaError` 1: загрузка прервана                             |
| `network`              | `MediaError` 2: ошибка сети                                   |
| `decode`               | `MediaError` 3: не удалось декодировать поток                 |
| `source-not-supported` | `MediaError` 4: формат не поддерживается                      |
| `playback-blocked`     | `NotAllowedError` при `play()`: браузер заблокировал автоплей |
| `unknown`              | всё остальное                                                 |

`message` — готовый текст для пользователя (по умолчанию на русском), `cause` —
исходная ошибка (`MediaError`, `DOMException` или объект без типа). Для логики и
локализации используйте `code`, а не `message`.

## SSR

Сервис SSR-безопасен: вне браузера `connect()` не навешивает слушатели и не
трогает DOM, состояние остаётся `idle`. Это позволяет рендерить страницы с
плеером на сервере и не падать на отсутствии `HTMLVideoElement`.

## Зона ответственности

`VideoService` **не**:

- управляет DOM-структурой плеера и не создаёт кнопок;
- рендерит субтитры и превью кадров;
- знает о CSS, вёрстке и темах;
- хранит список уровней качества — это задача пакета `sources`.

Компоненты интерфейса живут в `@erst_dev/ngx-video-controls` и следующих пакетах
экосистемы.

## Совместимость

Публичный контракт (имена сигналов, Observable, методов, полей типов) фиксируется
по semver. Ломающие изменения — только в мажорной версии. Пока версия `0.x`,
API может меняться в минорных релизах, но мы стараемся этого избегать.

## Лицензия

MIT
