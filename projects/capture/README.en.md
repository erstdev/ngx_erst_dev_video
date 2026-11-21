# @erst_dev/ngx-video-capture

Frame capture, clip recording and GIF creation from an already playing `<video>`
for the `ngx-video` player. `CaptureService` receives a native
`HTMLVideoElement`, grabs data through Canvas and `MediaRecorder`, and returns a
`Blob` or a recording object, while `ScreenshotButtonComponent` and
`ClipRecorderComponent` are ready-made building blocks on top of it: a
screenshot button with file download and a clip recording UI with a timer.

The package is **PRO**: distributed separately from the free packages of the
ecosystem.

## Building blocks

| Building block              | What it solves                       | Status   |
| --------------------------- | ------------------------------------ | -------- |
| `CaptureService`            | Frame, clip and GIF without UI       | ✅ ready |
| `ScreenshotButtonComponent` | Screenshot button and file download  | ✅ ready |
| `ClipRecorderComponent`     | Clip recording UI: buttons and timer | ✅ ready |

All three building blocks of the package are ready: the service captures a
frame, records a clip and a GIF, the screenshot button calls it on click and
downloads the file, and `ClipRecorderComponent` manages the clip recording UI and
returns a ready `Blob`. Publication is in the final phase of the plan, after the
documentation site.

## Requirements

- Angular 22+
- `@erst_dev/ngx-video-core` (peer dependency, for working together with
  `VideoService` and error types)
- A browser with Canvas and `MediaRecorder` for clip recording

The package is not published to npm yet (working version `0.0.1`). Inside the
monorepo it is wired through `paths` in `tsconfig.base.json`.

## Installation

```sh
npm install @erst_dev/ngx-video-capture
```

## Quick start

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

    <button type="button" (click)="captureFrame()">Frame</button>
    <button type="button" (click)="startRecording()">Start recording</button>
    <button type="button" (click)="stopRecording()">Stop</button>
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

`CaptureService` does not control playback: `play()`, `pause()`, `seek()` and
`toggle()` stay with `VideoService`. Downloading files is also the consumer's
job: the service only returns a `Blob`.

Clip recording returns an object with a state signal and control methods:

```typescript
const recording = this.capture.recordClip(video);

recording.state(); // 'recording' | 'stopped' | 'cancelled' | 'error'

const blob = await recording.stop(); // actual MIME is in blob.type
recording.cancel(); // cancel: a pending stop() rejects with code 'aborted'
```

## ScreenshotButtonComponent

A ready-made screenshot button: on click it calls
`CaptureService.captureFrame()`, emits `capture` with a ready `Blob` and
downloads the file by default. Capture stays in the service, while `play()`,
`pause()` and `seek()` stay with `VideoService`.

```html
<video #video ngxVideo [src]="src" crossorigin="anonymous" playsinline></video>

<ngx-screenshot-button [video]="videoElement()" (capture)="onCapture($event)" (captureError)="onError($event)" />
```

The file name is assembled with an extension based on the MIME type, errors
arrive in `captureError`, and `download = false` leaves only the `Blob` to the
consumer. CSS variables `--ngx-screenshot-*`, `customClass`, `iconTemplate` and
SSR are supported.

See the [building block README](src/lib/components/screenshot-button/README.md)
for details.

## ClipRecorderComponent

Clip recording UI: Start recording and Stop buttons, a timer, an indicator and
automatic stop at `maxDuration`. The component calls
`CaptureService.recordClip()`, owns the resulting `ClipRecording` and returns a
ready `Blob` through `recordStop`; it does not control the player and does not
download files.

```html
<video #video ngxVideo [src]="src" crossorigin="anonymous" playsinline></video>

<ngx-clip-recorder [video]="videoElement()" [maxDuration]="30" (recordStart)="onRecordStart()" (recordStop)="onRecordStop($event)" (recordError)="onError($event)" />
```

`maxDuration` is in seconds (`0` means no limit); errors arrive in
`recordError`, while `maxDuration`, `indicatorTemplate`, CSS variables and
`customClass` configure behavior and appearance. SSR is safe: there is no DOM
and no `MediaRecorder` at the top level of the module.

See the [building block README](src/lib/components/clip-recorder/README.md) for
details.

## Methods

### captureFrame

Captures the current video frame into a `Blob`.

```typescript
const blob = await capture.captureFrame(video, {
  type: 'image/jpeg',
  quality: 0.9,
  maxWidth: 1280,
  maxHeight: 720,
});
```

| Option      | Default     | Description                                   |
| ----------- | ----------- | --------------------------------------------- |
| `type`      | `image/png` | `image/png`, `image/jpeg` or `image/webp`     |
| `quality`   | `0.92`      | Quality `0..1`; only applies to JPEG and WebP |
| `maxWidth`  | native      | Maximum width, px; the frame is not upscaled  |
| `maxHeight` | native      | Maximum height, px; the frame is not upscaled |

The frame is drawn to Canvas with its aspect ratio preserved;
`maxWidth`/`maxHeight` are a maximum, not a target. Invalid numbers are replaced
with the defaults and clamped to the range. If the video has no frame yet
(`videoWidth` or `videoHeight` is zero), the promise rejects with code
`no-video`.

### recordClip

Starts recording a fragment from the current video state.

```typescript
const recording = capture.recordClip(video, {
  mimeType: 'video/webm;codecs=vp9,opus',
  videoBitsPerSecond: 2_500_000,
  audioBitsPerSecond: 128_000,
  timeslice: 1000,
});
```

| Option               | Default     | Description                                                  |
| -------------------- | ----------- | ------------------------------------------------------------ |
| `mimeType`           | auto        | Explicit MIME; an unsupported one — error `recording-failed` |
| `videoBitsPerSecond` | `2 500 000` | Video bitrate                                                |
| `audioBitsPerSecond` | `128 000`   | Audio bitrate                                                |
| `timeslice`          | `1000`      | Data chunk interval, ms; `0` — no `timeslice`                |

If `mimeType` is not set, the first supported one of
`video/webm;codecs=vp9,opus`, `video/webm;codecs=vp8,opus`, `video/webm`,
`video/mp4` is chosen via `MediaRecorder.isTypeSupported`. The resulting MIME is
always available in `blob.type`.

`ClipRecording`:

- `state` — signal `'recording' | 'stopped' | 'cancelled' | 'error'`;
- `stop()` — stops recording and returns a `Blob`; idempotent: a repeated call
  returns the same promise; empty data — error `recording-failed`;
- `cancel()` — stops `MediaRecorder`, discards the data and stops the
  `MediaStream` tracks; the state is `cancelled`, and a pending `stop()` rejects
  with code `aborted`.

Recording starts from the current state: if the video is paused, frames in the
clip may repeat — that is the parent's responsibility, the service does not call
`play()`. A `MediaRecorder` error moves the recording to the `error` state, and a
pending `stop()` rejects with code `recording-failed`.

### captureGif

Records a GIF from the current video state.

```typescript
const blob = await capture.captureGif(video, {
  fps: 10,
  duration: 2000,
  width: 320,
  loop: true,
});
```

| Option     | Default | Description                             |
| ---------- | ------- | --------------------------------------- |
| `fps`      | `10`    | Frame rate, from 1 to 30                |
| `duration` | `3000`  | Duration, ms, from 100 to 15 000        |
| `width`    | `320`   | GIF width, px, from 16 to 640           |
| `loop`     | `true`  | Looping via the Netscape loop extension |

The result is a real `image/gif` assembled by its own dependency-free encoder: a
GIF89a header, a global 3-3-2 256-color palette, the nearest color for each
pixel, LZW with a minimum code size of 8, a Graphic Control Extension with a
delay of `max(2, round(100 / fps))` hundredths of a second and the Netscape loop
extension when `loop: true`. The height is derived from the video proportions.

## Errors

Methods reject the promise or throw a plain `CaptureError` object — the same way
`core` returns `VideoError`:

```typescript
interface CaptureError {
  readonly code: CaptureErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}
```

| Code               | When it occurs                                                            |
| ------------------ | ------------------------------------------------------------------------- |
| `unsupported`      | A required API is missing or server-side rendering                        |
| `no-video`         | The video has no frame yet: metadata is not loaded                        |
| `canvas-failed`    | Canvas was not created, `toBlob` returned `null` or the canvas is tainted |
| `recording-failed` | Unsupported MIME, `captureStream()` failure or an empty recording         |
| `gif-failed`       | GIF encoding failed                                                       |
| `aborted`          | Recording was cancelled via `cancel()`                                    |

`code` is a machine contract, `message` is a ready-made Russian-language
message, `cause` is the original error (`DOMException`, `Error`). Build your
logic on `code`.

## SSR

The service can be injected on the server: there is no `window`, `document` or
`MediaRecorder` at the top level of the module. On the server the methods reject
(and `recordClip` throws) with code `unsupported`; the check goes through
`isPlatformBrowser`/`PLATFORM_ID`.

## CORS and canvas taint

The frame and GIF are read from Canvas. If the video is loaded from another
origin without CORS headers, the canvas becomes tainted and
`toBlob`/`getImageData` throw `SecurityError` — the service returns
`canvas-failed` with the original error in `cause`. That is why `<video>` needs
`crossorigin="anonymous"` and the video server needs the
`Access-Control-Allow-Origin` header.

`MediaRecorder` works with an already obtained stream: `video.captureStream()`
may fail for protected content (DRM/EME) — that is also `recording-failed`.

## GIF limitations

- The palette is fixed: 256 colors, 3-3-2, with no adaptation to the frame and
  no dithering — smooth gradients may look rougher than the original.
- There is no transparency: all frames are opaque, the Graphic Control Extension
  has no transparent index.
- There are no local palettes: one global palette for the whole file.
- The frame delay is the same for the whole file and cannot be less than 2
  hundredths of a second.
- The file size grows with `width × fps × duration`: 320 px, 10 fps and 2–3
  seconds is a reasonable choice for a preview.

## Compatibility

Method names, option fields, the `CaptureError` structure and
`CaptureErrorCode` values are a public contract. While the version is `0.x`, the
API may change in minor releases; breaking changes only in a major version. The
package does not change the public API of `core`.

## License

MIT

---

Core documentation: [@erst_dev/ngx-video-core](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/core/README.md).
