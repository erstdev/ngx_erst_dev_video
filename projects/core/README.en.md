# @erst_dev/ngx-video-core

The foundation of the `ngx-video` ecosystem: a headless service and a directive
for working with `<video>`. The package contains no markup or styles — only state
and control of the media element.

## What's inside

| Entity                                       | Purpose                                                                                |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| `VideoService`                               | The single source of truth for `<video>` state: signals, Observables, control commands |
| `VideoDirective` (`[ngxVideo]`)              | Binds a `<video>` element to the service: `connect()` / `disconnect()`                 |
| `VideoState`, `VideoError`, `VideoErrorCode` | State and error types                                                                  |
| `Quality`                                    | Shared quality-level type for the future `sources` package                             |
| `formatTime`                                 | Formats seconds as `mm:ss` / `h:mm:ss`                                                 |

## Requirements

- Angular 22+
- RxJS 7.8+

The package is not yet published to npm (working version `0.0.1`). Inside the
monorepo it is wired up through `paths` in `tsconfig.base.json`.

## Installation

```sh
npm install @erst_dev/ngx-video-core
```

## Quick start

```typescript
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';

@Component({
  selector: 'app-player',
  imports: [VideoDirective],
  template: `
    <video ngxVideo [src]="src" playsinline (click)="video.toggle()"></video>

    <button type="button" (click)="video.toggle()">
      {{ video.isPlaying() ? 'Pause' : 'Play' }}
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

The directive locates the `<video>`, calls `connect()` on initialization, and
from that moment on the service listens to the element's native events. When the
component is destroyed, it calls `disconnect()` and resets the state.

## How it works

**Signals are the source of truth.** Inside the service, state is kept in a
`WritableSignal` and exposed through `asReadonly()`. Observable mirrors are
created from signals via `toObservable()`, so both representations always stay
consistent: `time()` and `time$` cannot diverge.

**No DOM magic.** The service does not create elements, does not manage layout,
and knows nothing about CSS. All it does is read and write `HTMLVideoElement`
properties and listen to its events.

**Errors are normalized.** Native `MediaError` codes and browser refusals are
turned into a `VideoError` with a machine-readable code, so the UI does not
depend on message text.

### Multiple players on a page

By default `VideoService` is a singleton (`providedIn: 'root'`), which is enough
for a single player. If there are several players, add
`providers: [VideoService]` to the player component — the directive inside its
template will receive a local instance:

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

Without a local provider, two `<video ngxVideo>` in one application will share a
single service instance, and state will "jump" between the elements.

## API

### Lifecycle

| Method                                     | Description                                                                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `connect(element: HTMLVideoElement): void` | Binds the service to the element. Called by the directive; only needed manually when using the service without it |
| `disconnect(): void`                       | Removes the listeners and resets state. The element is not removed from the DOM                                   |

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

### State signals

| Signal         | Type                         | Description                                                           |
| -------------- | ---------------------------- | --------------------------------------------------------------------- |
| `time`         | `Signal<number>`             | Current position in seconds                                           |
| `duration`     | `Signal<number>`             | Duration in seconds (`0` until metadata is loaded)                    |
| `state`        | `Signal<VideoState>`         | Player state                                                          |
| `volume`       | `Signal<number>`             | Volume `0…1`                                                          |
| `muted`        | `Signal<boolean>`            | Sound is off                                                          |
| `playbackRate` | `Signal<number>`             | Playback rate                                                         |
| `buffered`     | `Signal<number>`             | End of the buffered range containing the current position, in seconds |
| `fullscreen`   | `Signal<boolean>`            | Fullscreen mode                                                       |
| `error`        | `Signal<VideoError \| null>` | Last error                                                            |

Derived values:

| Signal      | Type              | Description                                       |
| ----------- | ----------------- | ------------------------------------------------- |
| `progress`  | `Signal<number>`  | Progress `0…1` (`time / duration`, capped at one) |
| `isPlaying` | `Signal<boolean>` | `state === 'playing'` (buffering is not included) |
| `hasError`  | `Signal<boolean>` | An error is active                                |

### Observable mirrors

Every signal has an RxJS representation:

`time$`, `duration$`, `state$`, `volume$`, `muted$`, `playbackRate$`,
`buffered$`, `fullscreen$`, `error$`.

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

readonly time = toSignal(inject(VideoService).time$, { initialValue: 0 });
```

Signals are more convenient in templates; Observables are better for operators
(`debounceTime`, `switchMap`, `combineLatest`). Both representations are
synchronous with each other.

### Commands

| Method                          | Returns         | Description                                                             |
| ------------------------------- | --------------- | ----------------------------------------------------------------------- |
| `play()`                        | `Promise<void>` | Starts playback. Does not throw: a browser refusal lands in `error`     |
| `pause()`                       | `void`          | Pause                                                                   |
| `toggle()`                      | `void`          | Toggles playback                                                        |
| `seek(time: number)`            | `void`          | Seeks to an absolute position; the value is clamped to the video bounds |
| `seekBy(delta: number)`         | `void`          | Seeks by an offset (may be negative)                                    |
| `setVolume(volume: number)`     | `void`          | Volume `0…1`; the value is clamped                                      |
| `setMuted(muted: boolean)`      | `void`          | Turns sound on/off                                                      |
| `toggleMute()`                  | `void`          | Toggles sound                                                           |
| `setPlaybackRate(rate: number)` | `void`          | Playback rate (values `<= 0` are ignored)                               |
| `requestFullscreen()`           | `Promise<void>` | Requests fullscreen mode for the `<video>`                              |
| `exitFullscreen()`              | `Promise<void>` | Exits fullscreen mode                                                   |
| `toggleFullscreen()`            | `Promise<void>` | Toggles fullscreen mode                                                 |

Details:

- `play()` ignores `AbortError` (playback was interrupted by `pause`/`seek`) and
  turns `NotAllowedError` (autoplay is blocked) into an error with the code
  `playback-blocked`.
- `seek()` does not fail if the element is not yet ready to seek: the command is
  ignored, and the actual time will come from the element's events.
- `requestFullscreen()`/`exitFullscreen()` do not throw: a browser refusal (for
  example, an iframe without `allowfullscreen`) is simply ignored.

### Directive

Selector: `video[ngxVideo]`, `exportAs: 'ngxVideo'`.

```html
<video ngxVideo [src]="src"></video>
```

Accessing the service through `exportAs`:

```html
<video ngxVideo #player="ngxVideo" [src]="src"></video> <button (click)="player.service.toggle()">Play</button>
```

### Types

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

`Quality` is declared in `core` as a shared type for the `sources` package
(HLS/DASH and quality selection). `VideoService` itself does not use it.

### `formatTime` utility

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

Invalid values (`NaN`, `Infinity`, `null`, `undefined`, negative) become
`'00:00'`, so the template never displays garbage.

## State machine

`VideoState` changes in response to the element's native events:

| Event             | Result                                                     |
| ----------------- | ---------------------------------------------------------- |
| `play`, `playing` | `playing`                                                  |
| `pause`           | `paused` (unless playback has already ended)               |
| `ended`           | `ended`                                                    |
| `waiting`         | `buffering`                                                |
| `canplay`         | `paused`/`playing`, if there was buffering before          |
| `seeking`         | `seeking`                                                  |
| `seeked`          | `ended`, `paused`, or `playing` — depending on the element |
| `loadedmetadata`  | `paused`/`playing`, plus writing `duration` and `time`     |
| `loadstart`       | error reset, `idle`                                        |
| `emptied`         | `time = 0`, `duration = 0`, `buffered = 0`, `idle`         |
| `error`           | `error` + a populated `VideoError`                         |

Meaning of the values:

- `idle` — the element exists, but metadata has not been loaded yet;
- `playing` — playback is running;
- `paused` — paused;
- `buffering` — loading is in progress, playback is suspended;
- `seeking` — a seek is in progress;
- `ended` — playback has finished;
- `error` — an error occurred.

## Errors

| Code                   | Source                                                      |
| ---------------------- | ----------------------------------------------------------- |
| `aborted`              | `MediaError` 1: loading was aborted                         |
| `network`              | `MediaError` 2: network error                               |
| `decode`               | `MediaError` 3: failed to decode the stream                 |
| `source-not-supported` | `MediaError` 4: format is not supported                     |
| `playback-blocked`     | `NotAllowedError` on `play()`: the browser blocked autoplay |
| `unknown`              | everything else                                             |

`message` is ready-to-show user text (Russian by default), `cause` is the
original error (`MediaError`, `DOMException`, or an untyped object). For logic
and localization use `code`, not `message`.

## SSR

The service is SSR-safe: outside the browser, `connect()` does not attach
listeners and does not touch the DOM, and state remains `idle`. This allows
rendering pages with a player on the server without crashing on a missing
`HTMLVideoElement`.

## Scope

`VideoService` does **not**:

- manage the player's DOM structure or create buttons;
- render subtitles and frame previews;
- know about CSS, layout, or themes;
- keep the list of quality levels — that is the job of the `sources` package.

UI components live in `@erst_dev/ngx-video-controls` and the following packages
of the ecosystem.

## Compatibility

The public contract (signal names, Observables, methods, type fields) is fixed
under semver. Breaking changes only in a major version. While the version is
`0.x`, the API may change in minor releases, but we try to avoid that.

## License

MIT
