# ClipRecorderComponent

Clip recording UI for an already playing `<video>`. On click it calls
`CaptureService.recordClip()`, owns the resulting `ClipRecording`, shows the timer
and the `maxDuration` limit, and hands the finished `Blob` out through the
`recordStop` output. It does not control the player and does not download files.

Selector: `ngx-clip-recorder`.

> **PRO.** The component is part of the paid `@erst_dev/ngx-video-capture` package.

## Purpose and responsibilities

**Does:**

- on click calls `CaptureService.recordClip(video, options)` and passes
  `mimeType`, `videoBitsPerSecond`, `audioBitsPerSecond`, `timeslice`;
- after a successful start shows the timer and the indicator, emits `recordStart`;
- stops recording on click or automatically when `maxDuration` is reached;
- emits `recordStop` with the finished `Blob` and the actual MIME type;
- reports start and stop errors through `recordError`, wrapping a foreign
  exception into `recording-failed`;
- supports `customClass`, CSS variables, and `indicatorTemplate`.

**Does not:**

- control the player: `play()`, `pause()`, `seek()`, and `VideoService` are not
  its scope;
- work with Canvas and `MediaRecorder` directly — that is `CaptureService`;
- download the file or keep a recording history: the `Blob` goes to the consumer;
- cancel recording on click: cancellation is possible only when the component is
  destroyed;
- access `window`, `document`, and `MediaRecorder` at module top level — it is
  SSR-safe.

## Import

```ts
import { ClipRecorderComponent } from '@erst_dev/ngx-video-capture';
import type { ClipRecorderIndicatorContext } from '@erst_dev/ngx-video-capture';
```

## Usage

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

  /** While the element is missing, null arrives here — recording start is disabled. */
  protected readonly videoElement = computed(() => this.videoRef()?.nativeElement ?? null);

  protected onRecordStart(): void {
    // ClipRecording is already created, recording is in progress, the timer is running.
  }

  protected onRecordStop(blob: Blob): void {
    // blob.type is the actual MIME, for example video/webm;codecs=vp9,opus.
    // Downloading and preview are the consumer's job.
    const url = URL.createObjectURL(blob);

    console.log(blob.type, blob.size, url);
  }

  protected onError(error: CaptureError): void {
    console.warn(error.code, error.message);
  }
}
```

`crossorigin="anonymous"` is needed if the video comes from another origin:
without CORS headers, recording through `video.captureStream()` may be
unavailable, and the service returns `recording-failed`.

## Inputs

| Input                | Type                                                | Default     | Description                                             |
| -------------------- | --------------------------------------------------- | ----------- | ------------------------------------------------------- |
| `video`              | `HTMLVideoElement \| null`                          | `null`      | Video to record; without it the start is blocked        |
| `maxDuration`        | `number`                                            | `30`        | Recording limit in seconds; `0` — no limit              |
| `mimeType`           | `string \| null`                                    | `null`      | Explicit MIME; `null` — auto-detection in the service   |
| `videoBitsPerSecond` | `number`                                            | `2 500 000` | Video bitrate, bit/s                                    |
| `audioBitsPerSecond` | `number`                                            | `128 000`   | Audio bitrate, bit/s                                    |
| `timeslice`          | `number`                                            | `1000`      | Data delivery interval, ms; `0` — no `timeslice`        |
| `disabled`           | `boolean`                                           | `false`     | Additional start lock                                   |
| `customClass`        | `string`                                            | `''`        | Additional CSS class for the `<ngx-clip-recorder>` host |
| `ariaLabel`          | `string \| null`                                    | `null`      | Overrides the `aria-label` of the group                 |
| `indicatorTemplate`  | `TemplateRef<ClipRecorderIndicatorContext> \| null` | `null`      | Custom indicator instead of the default dot             |

`mimeType`, the bitrates, and `timeslice` are passed to `recordClip()` as is;
`null` for `mimeType` means auto-detection, and invalid numbers are normalized by
the service.

## Outputs

| Output        | Type           | Description                                                            |
| ------------- | -------------- | ---------------------------------------------------------------------- |
| `recordStart` | `void`         | Recording started successfully: `ClipRecording` is created, timer runs |
| `recordStop`  | `Blob`         | Recording stopped: the finished `Blob` with the actual MIME type       |
| `recordError` | `CaptureError` | Start or stop error; the exception is not propagated outside           |

The output is called `recordError`, not `error`: the name `error` conflicts with
the native DOM event and the `no-output-native` rule.

## States and timer

| State      | "Start recording" button        | "Stop" button | Timer             |
| ---------- | ------------------------------- | ------------- | ----------------- |
| Idle       | available when there is a video | disabled      | `00:00`           |
| Recording  | disabled                        | available     | grows             |
| Stopping   | disabled                        | disabled      | grows until ready |
| After stop | available when there is a video | disabled      | actual length     |

- The timer updates every `250` ms, but it is created only in the click handler —
  there are no intervals on the server.
- After stopping, the timer freezes at the actual duration; a new start begins
  again from `00:00`.
- While recording is in progress, repeated clicks on start are ignored. A repeated
  click on "Stop" during stopping is also ignored.
- If the `disabled` input is set, start is blocked, but "Stop" stays available
  while recording is active: the recording must be able to finish.
- After a stop or an error, start is available again if there is a `video` and
  `disabled` is not set.

## maxDuration

`maxDuration` is the limit in seconds. The value is fixed at the moment of start:
changing the input during recording does not change the current limit.

| Value                | Behavior                  |
| -------------------- | ------------------------- |
| `0`                  | no limit                  |
| negative             | clamped to `0`            |
| greater than `3600`  | clamped to `3600`         |
| `NaN`/`Infinity`     | replaced with `30`        |
| `5`, `10`, `30`, ... | auto-stop after N seconds |

When the limit is reached, the component performs the same stop as the button:
`recordStop` is emitted once, and the timer freezes at the actual duration.

## Errors

`recordError` returns a regular `CaptureError` object from `CaptureService`:

```ts
interface CaptureError {
  readonly code: CaptureErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}
```

- `recordClip()` fails synchronously — the error goes to `recordError` as is;
- `stop()` rejects — the error goes to `recordError` as is;
- a foreign exception is wrapped into `recording-failed` with the original error
  in `cause`;
- if `ClipRecording.state()` switches to `error` during recording, the component
  stops the timer and emits `recordError` without waiting for a click;
- after an error the buttons are available again, and the exception is not
  propagated outside.

Current codes: `unsupported` (no API or the server), `recording-failed`
(unsupported MIME, `captureStream()` refusal, empty recording, `MediaRecorder`
error), and `aborted` (recording cancelled on component destruction). On
destruction the component clears the interval, calls `cancel()` on the active
recording, and no longer emits outputs.

## CSS variables

All values are defined in `:host`, so the component works out of the box and is
overridden without editing the sources.

| Variable                          | Default      | Description                                       |
| --------------------------------- | ------------ | ------------------------------------------------- |
| `--ngx-recorder-gap`              | `0.5rem`     | Gap between the elements of the group             |
| `--ngx-recorder-radius`           | `999px`      | Button corner radius                              |
| `--ngx-recorder-font-size`        | `0.8125rem`  | Font size of the buttons and the timer            |
| `--ngx-recorder-color`            | `#e5e7eb`    | Button text color                                 |
| `--ngx-recorder-bg`               | `#111827`    | Button background                                 |
| `--ngx-recorder-hover-bg`         | `#1f2937`    | Button background on hover                        |
| `--ngx-recorder-border-color`     | `#374151`    | Button border color                               |
| `--ngx-recorder-record-color`     | `#ef4444`    | Color of the start dot and recording indicator    |
| `--ngx-recorder-stop-color`       | `#f59e0b`    | Stop indicator color                              |
| `--ngx-recorder-timer-color`      | `#9ca3af`    | Timer color                                       |
| `--ngx-recorder-focus-color`      | `#34d399`    | `:focus-visible` outline color                    |
| `--ngx-recorder-disabled-opacity` | `0.5`        | Opacity of a disabled button                      |
| `--ngx-recorder-transition`       | `0.15s ease` | Background, border, color, and opacity transition |

## Styling

Override on the component itself:

```scss
ngx-clip-recorder {
  --ngx-recorder-radius: 12px;
  --ngx-recorder-bg: #0f172a;
  --ngx-recorder-record-color: #f97316;
}
```

Via `customClass` — the class is applied to the **host element**
`<ngx-clip-recorder>`:

```html
<ngx-clip-recorder customClass="my-recorder" [video]="videoElement()" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-recorder {
  --ngx-recorder-radius: 8px;
  --ngx-recorder-font-size: 0.75rem;
  --ngx-recorder-focus-color: #fbbf24;
}
```

`customClass` does not affect classes set on the element manually:
`<ngx-clip-recorder class="layout-wide" customClass="my-recorder">` keeps both.

## Custom indicator

```html
<ngx-clip-recorder [video]="videoElement()" [indicatorTemplate]="myIndicator" (recordStart)="onRecordStart()" (recordStop)="onRecordStop($event)" />

<ng-template #myIndicator let-recording="recording" let-stopping="stopping">
  <span class="my-indicator" aria-hidden="true"> {{ stopping ? '…' : recording ? 'REC' : 'IDLE' }} </span>
</ng-template>
```

The template receives the context:

```ts
interface ClipRecorderIndicatorContext {
  readonly recording: boolean;
  readonly stopping: boolean;
}
```

The default indicator is a pulsing dot and is decorative (`aria-hidden`). A custom
template is rendered in its place; sizes and colors are up to your styles.

## Accessibility

- The inner group has `role="group"` and `aria-label` "Clip recording"; `ariaLabel`
  overrides the name.
- The buttons are native `<button type="button">` with the names "Start recording"
  and "Stop recording"; Enter/Space, focus, and semantics work without extra code.
- The timer is `role="timer"` with `aria-live="off"`: the value is not read out by
  a screen reader on every tick.
- The default dot is marked `aria-hidden="true"` and does not enter the
  accessibility tree.
- A visible `:focus-visible` outline; with `prefers-reduced-motion: reduce` the
  animation and transitions are disabled.

## SSR

At module top level there is no `window`, `document`, or `MediaRecorder`.
`setInterval` is created only in the click handler, so creating the component on
the server does not crash. The recording itself is unavailable on the server: in
this case `recordClip()` returns a `CaptureError` with the `unsupported` code — the
component passes it to `recordError` and does not throw the exception.

---

[Package README](../../../../README.md)
