# @erst_dev/ngx-video-core

Фундамент экосистемы `ngx-video`: headless-сервис и директива для работы с `<video>`.

Пакет не содержит разметки и стилей — только состояние и управление медиа-элементом.
Из него собираются любые плееры: от кнопки Play до собственного таймлайна.

## Установка

```sh
npm install @erst_dev/ngx-video-core
```

Требования: Angular 22+, RxJS 7.8+.

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

`VideoService` доступен в корне (`providedIn: 'root'`) — для одного плеера ничего
дополнительно настраивать не нужно.

### Несколько плееров на странице

Если плееров несколько, каждому нужен свой экземпляр сервиса. Добавьте
`providers: [VideoService]` в компонент плеера — директива внутри его шаблона
получит локальный экземпляр:

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

## API

### Состояние — сигналы

| Сигнал         | Тип                          | Описание                                                       |
| -------------- | ---------------------------- | -------------------------------------------------------------- |
| `time`         | `Signal<number>`             | Текущая позиция в секундах                                     |
| `duration`     | `Signal<number>`             | Длительность в секундах (`0`, пока нет метаданных)             |
| `state`        | `Signal<VideoState>`         | Состояние плеера                                               |
| `volume`       | `Signal<number>`             | Громкость `0…1`                                                |
| `muted`        | `Signal<boolean>`            | Звук выключен                                                  |
| `playbackRate` | `Signal<number>`             | Скорость воспроизведения                                       |
| `buffered`     | `Signal<number>`             | Конец буферизованного диапазона с текущей позицией, в секундах |
| `fullscreen`   | `Signal<boolean>`            | Полноэкранный режим                                            |
| `error`        | `Signal<VideoError \| null>` | Последняя ошибка                                               |

Производные значения:

| Сигнал      | Тип               | Описание                           |
| ----------- | ----------------- | ---------------------------------- |
| `progress`  | `Signal<number>`  | Прогресс `0…1` (`time / duration`) |
| `isPlaying` | `Signal<boolean>` | `state === 'playing'`              |
| `hasError`  | `Signal<boolean>` | Есть активная ошибка               |

### Состояние — Observable

Для каждого сигнала есть RxJS-представление: `time$`, `duration$`, `state$`,
`volume$`, `muted$`, `playbackRate$`, `buffered$`, `fullscreen$`, `error$`.

Источник правды — сигналы; Observable создаются через `toObservable()`, поэтому
оба представления всегда согласованы.

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

readonly time = toSignal(inject(VideoService).time$, { initialValue: 0 });
```

### Методы

| Метод                                                             | Описание                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------ |
| `connect(element)`                                                | Привязать сервис к `<video>` (вызывает директива)            |
| `disconnect()`                                                    | Отвязать элемент, снять слушатели, сбросить состояние        |
| `play()`                                                          | Запустить воспроизведение; отказ браузера попадает в `error` |
| `pause()`                                                         | Поставить на паузу                                           |
| `toggle()`                                                        | Переключить воспроизведение                                  |
| `seek(time)`                                                      | Перемотка на абсолютную позицию (обрезается по границам)     |
| `seekBy(delta)`                                                   | Перемотка на смещение, может быть отрицательным              |
| `setVolume(volume)`                                               | Громкость `0…1` (значение обрезается)                        |
| `setMuted(muted)` / `toggleMute()`                                | Управление звуком                                            |
| `setPlaybackRate(rate)`                                           | Скорость воспроизведения                                     |
| `requestFullscreen()` / `exitFullscreen()` / `toggleFullscreen()` | Полноэкранный режим                                          |

### Директива

`VideoDirective` (`[ngxVideo]`) связывает элемент с сервисом: `connect()` при
инициализации, `disconnect()` при уничтожении. Доступ через `exportAs`:

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

interface Quality {
  readonly id: string;
  readonly label: string;
  readonly width?: number;
  readonly height?: number;
  readonly bitrate?: number;
}
```

### Утилиты

```typescript
import { formatTime } from '@erst_dev/ngx-video-core';

formatTime(0); // '00:00'
formatTime(67); // '01:07'
formatTime(3723); // '1:02:03'
formatTime(Number.NaN); // '00:00'
```

## Особенности

- **Headless.** Ноль разметки, ноль стилей, ноль навязанных макетов.
- **SSR-безопасность.** Вне браузера сервис не трогает DOM и остаётся в состоянии `idle`.
- **Сообщения об ошибках** по умолчанию на русском; для локализации используйте
  `error().code`, а не текст.
- **`buffered`** — конец диапазона, в котором находится текущая позиция. Для полосы
  буфера в таймлайне: `buffered() / duration() * 100`.

## Лицензия

MIT
