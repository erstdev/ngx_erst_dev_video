# ScreenshotButtonComponent

A screenshot button for an already playing `<video>`. It delegates frame capture
to `CaptureService`, returns a ready `Blob` through the `capture` output and
downloads the file by default. It does not control the player.

Selector: `ngx-screenshot-button`.

> **PRO.** The component is part of the paid package
> `@erst_dev/ngx-video-capture`.

## Purpose and responsibilities

**Does:**

- on click calls `CaptureService.captureFrame(video, options)` and passes
  `type`, `quality`, `maxWidth`, `maxHeight`;
- disables the button while a frame is being captured and sets
  `aria-busy="true"`;
- emits `capture` with a ready `Blob`;
- when `download = true`, downloads the file via a temporary `<a download>` link;
- builds the file name with an extension based on the frame MIME type;
- passes errors to `captureError`, wrapping a foreign exception in
  `canvas-failed`;
- supports `customClass`, CSS variables and `iconTemplate`.

**Does not:**

- does not capture the frame itself and does not work with Canvas — that is
  `CaptureService`;
- does not call `play()`, `pause()`, `seek()` and does not control
  `VideoService`;
- does not keep a frame history and downloads nothing on initialization;
- does not access `window`, `document` or `MediaRecorder` at the top level of
  the module — SSR is safe;
- is not mandatory: if `CaptureService` is not needed, the button can be left
  out.

## Import

```ts
import { ScreenshotButtonComponent } from '@erst_dev/ngx-video-capture';
import type { ScreenshotButtonIconContext } from '@erst_dev/ngx-video-capture';
```

## Usage

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

  /** While the element is missing, null arrives here — the button is simply disabled. */
  protected readonly videoElement = computed(() => this.videoRef()?.nativeElement ?? null);

  protected onCapture(blob: Blob): void {
    // The Blob is ready and the download (if enabled) has already started.
    console.log(blob.type, blob.size);
  }

  protected onError(error: CaptureError): void {
    console.warn(error.code, error.message);
  }
}
```

`crossorigin="anonymous"` is mandatory if the video comes from another origin
without CORS headers: otherwise Canvas becomes tainted and `CaptureService`
returns `canvas-failed`.

## Inputs

| Input          | Type                                               | Default      | Description                                                        |
| -------------- | -------------------------------------------------- | ------------ | ------------------------------------------------------------------ |
| `video`        | `HTMLVideoElement \| null`                         | `null`       | Video to capture the frame from; without it the button is disabled |
| `type`         | `'image/png' \| 'image/jpeg' \| 'image/webp'`      | `image/png`  | Frame MIME type                                                    |
| `quality`      | `number`                                           | `0.92`       | Quality for JPEG and WebP, from 0 to 1                             |
| `maxWidth`     | `number \| null`                                   | `null`       | Maximum frame width; `null` — native                               |
| `maxHeight`    | `number \| null`                                   | `null`       | Maximum frame height; `null` — native                              |
| `fileName`     | `string`                                           | `screenshot` | Base file name without extension                                   |
| `download`     | `boolean`                                          | `true`       | Download the file after a successful frame                         |
| `disabled`     | `boolean`                                          | `false`      | Additional button lock                                             |
| `customClass`  | `string`                                           | `''`         | Extra CSS class for the `<ngx-screenshot-button>` host             |
| `ariaLabel`    | `string \| null`                                   | `null`       | Override `aria-label` for both states                              |
| `iconTemplate` | `TemplateRef<ScreenshotButtonIconContext> \| null` | `null`       | Custom icon instead of the default SVG camera                      |

`maxWidth`/`maxHeight` are a maximum, not a target: the service preserves the
aspect ratio and does not upscale the frame. `quality` only applies to JPEG and
WebP.

## Outputs

| Output         | Type           | Description                                                              |
| -------------- | -------------- | ------------------------------------------------------------------------ |
| `capture`      | `Blob`         | Successful frame; the download (if enabled) has already started          |
| `captureError` | `CaptureError` | Capture error; the button is active again, the exception is not rethrown |

The output is named `captureError`, not `error`: the name `error` conflicts with
the native DOM event and the `no-output-native` rule.

## Download and file name

Download starts only on click and only after a successful frame. The component
creates a temporary `<a download>` link, an object URL via
`URL.createObjectURL(blob)`, calls `a.click()` and releases the URL after the
click. `download = false` downloads nothing: the consumer gets the `Blob` and
handles it itself.

The name is built by the `buildFileName(fileName, type)` function:

- the name is trimmed;
- an empty name is replaced with `screenshot`;
- an existing `.png`, `.jpg`, `.jpeg` or `.webp` extension is stripped;
- an extension is added based on MIME: `image/png` → `.png`, `image/jpeg` →
  `.jpg`, `image/webp` → `.webp`.

| `fileName`       | `type`       | Result           |
| ---------------- | ------------ | ---------------- |
| `frame`          | `image/png`  | `frame.png`      |
| `  frame.jpeg  ` | `image/png`  | `frame.png`      |
| `frame`          | `image/jpeg` | `frame.jpg`      |
| `frame`          | `image/webp` | `frame.webp`     |
| `''`             | `image/jpeg` | `screenshot.jpg` |

`fileName` is not sanitized: path and invalid characters are the consumer's
responsibility.

## Errors

`captureError` emits a plain `CaptureError` object from `CaptureService`:

```ts
interface CaptureError {
  readonly code: CaptureErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}
```

Service codes: `unsupported`, `no-video`, `canvas-failed`, `recording-failed`,
`gif-failed`, `aborted`; the first three are relevant for a frame. If something
else arrives from the service, the component wraps the exception in
`canvas-failed` with the original error in `cause`. The exception is not
rethrown — react to `captureError` and build logic on `code`.

## CSS variables

All values are defined in `:host`, so the button works out of the box and can be
overridden without editing the sources.

| Variable                            | Default              | Description                              |
| ----------------------------------- | -------------------- | ---------------------------------------- |
| `--ngx-screenshot-size`             | `40px`               | Button size (square)                     |
| `--ngx-screenshot-icon-size`        | `55%`                | Default SVG icon size                    |
| `--ngx-screenshot-color`            | `#ffffff`            | Icon color                               |
| `--ngx-screenshot-bg`               | `rgba(0, 0, 0, 0.7)` | Button background                        |
| `--ngx-screenshot-hover-bg`         | `rgba(0, 0, 0, 0.9)` | Background on hover                      |
| `--ngx-screenshot-border-radius`    | `50%`                | Corner radius                            |
| `--ngx-screenshot-transition`       | `0.15s ease`         | Background, color and opacity transition |
| `--ngx-screenshot-focus-color`      | `#34d399`            | `:focus-visible` outline color           |
| `--ngx-screenshot-disabled-opacity` | `0.5`                | Disabled button opacity                  |

`--ngx-screenshot-icon-size` affects only the default SVG icon. The component
does not scale the `iconTemplate` content — its size is set by your styles.

## Styling

Override on the component itself:

```scss
ngx-screenshot-button {
  --ngx-screenshot-size: 48px;
  --ngx-screenshot-bg: transparent;
  --ngx-screenshot-hover-bg: rgba(255, 255, 255, 0.15);
  --ngx-screenshot-border-radius: 8px;
}
```

Through `customClass` — the class is applied to the **host element**
`<ngx-screenshot-button>`:

```html
<ngx-screenshot-button customClass="my-screenshot" [video]="videoElement()" (capture)="onCapture($event)" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-screenshot {
  --ngx-screenshot-size: 36px;
  --ngx-screenshot-focus-color: #fbbf24;
  --ngx-screenshot-bg: #1f2937;
  --ngx-screenshot-hover-bg: #374151;
  --ngx-screenshot-border-radius: 8px;
}
```

`customClass` does not affect classes set on the element manually:
`<ngx-screenshot-button class="layout-wide" customClass="my-screenshot">` keeps
both.

## Custom icon

```html
<ngx-screenshot-button [video]="videoElement()" [iconTemplate]="myIcon" (capture)="onCapture($event)" />

<ng-template #myIcon let-capturing="capturing">
  <span class="my-icon">{{ capturing ? '…' : '📷' }}</span>
</ng-template>
```

The following context is passed to the template:

```ts
interface ScreenshotButtonIconContext {
  readonly capturing: boolean;
}
```

A custom template is rendered inside the button instead of the default SVG icon;
the container size and colors are still set by CSS variables.

## Accessibility

- A native `<button type="button">` is rendered — Enter/Space, focus and button
  semantics work without extra code.
- The default `aria-label` is “Take a screenshot”, during capture it is “Saving
  the frame…”; the `ariaLabel` input overrides both.
- `aria-busy` reflects the capture state, `disabled` — the button being
  unavailable. While a frame is being captured, repeated clicks are ignored.
- A visible `:focus-visible` outline.
- The SVG icon is marked `aria-hidden="true"` and `focusable="false"` so it does
  not enter the accessibility tree.
- With `prefers-reduced-motion: reduce`, transitions are disabled.

## SSR

There is no `window`, `document` or `MediaRecorder` at the top level of the
module. `document` is used only in the click handler — when creating the
temporary `<a download>` link. That is why the component renders safely on the
server, and frame capture is fundamentally unavailable on the server: in that
case `CaptureService` returns `unsupported`.

---

[Package README](../../../../README.md)
