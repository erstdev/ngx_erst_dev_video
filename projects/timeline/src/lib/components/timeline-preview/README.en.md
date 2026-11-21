# TimelinePreviewComponent

Frame preview for the timeline: shows what is at the selected point without
seeking the main player.

Selector: `ngx-timeline-preview`.

## Purpose and responsibilities

**Does:**

- accepts the time and the video source;
- lazily creates a separate hidden `<video>`;
- seeks only that element and draws the frame into a `<canvas>`;
- shows the time and a placeholder while the frame is not ready;
- can be fully disabled with the `enabled` input.

**Does not:**

- does not touch the main `<video>` or its `currentTime`;
- does not control playback;
- does not call `video.seek()` and knows nothing about `VideoService`;
- is not an interactive element: the preview is decorative.

## Import

```ts
import { TimelinePreviewComponent } from '@erst_dev/ngx-video-timeline';
```

## Usage

`TimelinePreviewComponent` is usually passed to the timeline's `previewTemplate`:

```html
<ngx-timeline [currentTime]="video.time()" [duration]="video.duration()" [previewTemplate]="preview" (seek)="video.seek($event)" />

<ng-template #preview let-time="time">
  <ngx-timeline-preview [time]="time" [src]="src" />
</ng-template>
```

The timeline computes the time under the cursor and positions the container; the
preview only draws the frame.

## Inputs

| Input         | Type             | Default      | Description                                                                               |
| ------------- | ---------------- | ------------ | ----------------------------------------------------------------------------------------- |
| `time`        | `number`         | — (required) | Frame time in seconds                                                                     |
| `src`         | `string`         | — (required) | Video source; usually the same `src` as the main player                                   |
| `enabled`     | `boolean`        | `true`       | When `false`, the component does not render and the hidden video is not created or loaded |
| `previewSrc`  | `string \| null` | `null`       | Optional lightweight preview source; when not set, `src` is used                          |
| `customClass` | `string`         | `''`         | Additional CSS class for the `<ngx-timeline-preview>` host element                        |

## Outputs

There are no outputs: the component only renders the frame.

## How the frame is captured

1. On the first request a separate hidden `<video>` is created with `muted`,
   `playsInline`, `preload="auto"` and the required `src`.
2. The component sets `currentTime` and waits for `seeked`.
3. The frame is drawn into canvas via `drawImage` while preserving the aspect
   ratio.
4. While the frame is not ready, a placeholder with the time is shown.

Key implementation details:

- the hidden video is created lazily and removed when the component is destroyed;
- seek requests do not run in parallel: a new hover replaces the pending one;
- a repeated seek to a nearby point (less than 0.2 s) is skipped;
- when `enabled = false`, the video is stopped, `src` is cleared and the element
  is removed — the load disappears completely;
- when `src`/`previewSrc` changes, the old video is released and a new one is
  created;
- if the frame cannot be captured, the placeholder with the time remains.

## CORS and limitations

Canvas is used for **display** only. If the video is loaded from another origin
without CORS, the canvas may become "tainted": it can still be displayed, but
`toDataURL()`/`getImageData()` will be unavailable. The preview does not need
them.

The component does not set `crossorigin` by default: if the server does not send
`Access-Control-Allow-Origin`, a video with this attribute may not load at all.
Caching frames as data URLs would require CORS and separate configuration.

Sprint 3 limitations:

- regular progressive video (`MP4`/`WebM`);
- HLS/DASH require integration with the `sources` package;
- on some mobile browsers a second video element gets limited decoding;
- DRM/protected sources may not provide a frame to canvas — the placeholder
  remains.

## CSS variables

| Variable                             | Default                          | Description                |
| ------------------------------------ | -------------------------------- | -------------------------- |
| `--ngx-timeline-preview-width`       | `160px`                          | Preview width              |
| `--ngx-timeline-preview-bg`          | `#000000`                        | Frame background           |
| `--ngx-timeline-preview-color`       | `#ffffff`                        | Text color                 |
| `--ngx-timeline-preview-muted-color` | `rgba(255, 255, 255, 0.7)`       | Placeholder color          |
| `--ngx-timeline-preview-radius`      | `0.375rem`                       | Frame border radius        |
| `--ngx-timeline-preview-shadow`      | `0 8px 24px rgba(0, 0, 0, 0.35)` | Preview shadow             |
| `--ngx-timeline-preview-font-size`   | `0.75rem`                        | Time label font size       |
| `--ngx-timeline-preview-gap`         | `0.25rem`                        | Gap between frame and time |

## Styling

```scss
ngx-timeline-preview {
  --ngx-timeline-preview-width: 200px;
  --ngx-timeline-preview-radius: 0.5rem;
  --ngx-timeline-preview-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}
```

Through `customClass` — the class is applied to the **host element**
`<ngx-timeline-preview>`:

```html
<ngx-timeline-preview customClass="my-preview" [time]="time" [src]="src" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-preview {
  --ngx-timeline-preview-width: 200px;
  --ngx-timeline-preview-radius: 0.5rem;
}
```

## Disabling

```html
<ngx-timeline-preview [time]="time" [src]="src" [enabled]="previewEnabled()" />
```

When `enabled = false`, the component does not create the hidden video and does
not seek. This is not just `display: none` — the load really disappears.

## Accessibility

- The root block is marked `aria-hidden="true"`: this is a decorative preview.
- The component is non-interactive and is not part of the tab order.
- The time is available to screen readers through the timeline's `aria-valuetext`,
  so it does not need to be duplicated in the preview.

## SSR

The hidden video and canvas are created only in the browser
(`isPlatformBrowser`). On the server an empty/temporary block without DOM APIs is
rendered. `customClass` is synchronized via `ElementRef`, as in the other
building blocks.

---

[Package README](../../../../README.md)
