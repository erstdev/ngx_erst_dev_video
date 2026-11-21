# TimelineComponent

The base seek bar: it shows progress, buffer, and the thumb, and handles clicks,
dragging, and the keyboard.

Selector: `ngx-timeline`.

## Purpose and responsibilities

**Does:**

- renders `currentTime`, `duration`, and `buffered`;
- computes the time from the pointer coordinate;
- handles clicks, drag, and the keyboard;
- emits `seek`, `scrubStart`, and `scrubEnd`;
- accepts an optional `previewTemplate` for a preview above the bar.

**Does not:**

- call `<video>` methods or know about `VideoService`;
- store the current time as the source of truth;
- render frame previews or manage chapters — `TimelinePreviewComponent` and
  `ChapterMarkersComponent` are for that;
- seek the video continuously during a drag: the base version emits `seek` once
  on release.

## Import

```ts
import { TimelineComponent } from '@erst_dev/ngx-video-timeline';
```

## Usage

```html
<video ngxVideo [src]="src" (click)="video.toggle()"></video>

<ngx-timeline [currentTime]="video.time()" [duration]="video.duration()" [buffered]="video.buffered()" (seek)="video.seek($event)" />
```

## Inputs

| Input             | Type                                          | Default      | Description                                                          |
| ----------------- | --------------------------------------------- | ------------ | -------------------------------------------------------------------- |
| `currentTime`     | `number`                                      | — (required) | Current position in seconds                                          |
| `duration`        | `number`                                      | — (required) | Total duration; `0` until metadata is loaded                         |
| `buffered`        | `number`                                      | `0`          | End of the buffered range in seconds                                 |
| `keyboardStep`    | `number`                                      | `5`          | Keyboard arrow step in seconds                                       |
| `customClass`     | `string`                                      | `''`         | Additional CSS class for the `<ngx-timeline>` host element           |
| `ariaLabel`       | `string \| null`                              | `null`       | Overrides `aria-label`; defaults to "Seek"                           |
| `previewTemplate` | `TemplateRef<TimelinePreviewContext> \| null` | `null`       | Preview template rendered above the bar on hover; context `{ time }` |

## Outputs

| Output       | Type     | When it fires                                          |
| ------------ | -------- | ------------------------------------------------------ |
| `seek`       | `number` | Releasing the thumb, clicking the bar, or the keyboard |
| `scrubStart` | `void`   | Start of a pointer gesture on the bar                  |
| `scrubEnd`   | `void`   | End of the gesture: pointerup or pointercancel         |

## Behavior

- During a drag, only the local `dragTime` moves; `seek` is emitted once on
  release. This is option A: the video is not seeked dozens of times per
  gesture.
- On release, the event order is `seek(target)`, then `scrubEnd`. The parent has
  time to apply the seek before a possible resume.
- `pointercancel` emits `scrubEnd` without `seek`.
- A click is a short gesture: `scrubStart` → `seek` → `scrubEnd`.
- The keyboard emits only `seek`:
  - `ArrowLeft` / `ArrowDown` — back by `keyboardStep`;
  - `ArrowRight` / `ArrowUp` — forward by `keyboardStep`;
  - `Home` — to the start;
  - `End` — to the end.
- When `duration <= 0`, the component is non-interactive: `tabindex="-1"`,
  `aria-disabled="true"`, and `seek` is not emitted.
- After `seek`, the component does not change `currentTime` itself: if the parent
  does not update the input, the thumb returns to its previous position. This is
  a controlled component.

Live-scrub (continuous `seek` during drag) is not enabled in the base version.
It can be added later as a separate input without breaking the current contract.

## CSS variables

All values are defined in `:host`, so the control works out of the box.

| Variable                        | Default                     | Description                         |
| ------------------------------- | --------------------------- | ----------------------------------- |
| `--ngx-timeline-height`         | `4px`                       | Bar thickness                       |
| `--ngx-timeline-hit-height`     | `28px`                      | Hit area height                     |
| `--ngx-timeline-track-color`    | `rgba(255, 255, 255, 0.25)` | Color of the unfilled bar           |
| `--ngx-timeline-buffered-color` | `rgba(255, 255, 255, 0.45)` | Color of the buffered part          |
| `--ngx-timeline-progress-color` | `#ffffff`                   | Progress color                      |
| `--ngx-timeline-thumb-color`    | `#ffffff`                   | Thumb color                         |
| `--ngx-timeline-thumb-size`     | `14px`                      | Thumb size                          |
| `--ngx-timeline-border-radius`  | `999px`                     | Corner radius of the bar and thumb  |
| `--ngx-timeline-transition`     | `0.15s ease`                | Thumb size transition               |
| `--ngx-timeline-focus-color`    | `#ffffff`                   | Outline color on `:focus-visible`   |
| `--ngx-timeline-preview-gap`    | `0.5rem`                    | Gap between the preview and the bar |

## Styling

```scss
ngx-timeline {
  --ngx-timeline-height: 6px;
  --ngx-timeline-progress-color: #34d399;
  --ngx-timeline-buffered-color: rgba(52, 211, 153, 0.4);
  --ngx-timeline-thumb-color: #34d399;
  --ngx-timeline-thumb-size: 18px;
}
```

Via `customClass` — the class is applied to the **host element** `<ngx-timeline>`:

```html
<ngx-timeline customClass="my-timeline" [currentTime]="video.time()" [duration]="video.duration()" (seek)="video.seek($event)" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-timeline {
  --ngx-timeline-height: 6px;
  --ngx-timeline-progress-color: #34d399;
  --ngx-timeline-thumb-color: #34d399;
}
```

## Preview via `previewTemplate`

The timeline only positions the template and passes the time under the cursor.
What to show is up to the consumer:

```html
<ngx-timeline [currentTime]="video.time()" [duration]="video.duration()" [previewTemplate]="preview" (seek)="video.seek($event)" />

<ng-template #preview let-time="time">
  <ngx-timeline-preview [time]="time" [src]="src" />
</ng-template>
```

Context:

```ts
interface TimelinePreviewContext {
  readonly time: number;
}
```

If `previewTemplate` is not passed, the preview is not rendered.

## Accessibility

- `role="slider"`, `aria-orientation="horizontal"`.
- `aria-valuemin="0"`, `aria-valuemax="duration"`, `aria-valuenow="currentTime"`.
- `aria-valuetext` — "00:45 of 02:10" via `formatTime`.
- `aria-disabled="true"` and `tabindex="-1"` when `duration <= 0`.
- A visible `:focus-visible` outline.
- Keyboard: arrows, Home, End.
- The bar has an enlarged hit area (`--ngx-timeline-hit-height`), so it is easy
  to hit on a touch screen.
- With `prefers-reduced-motion: reduce`, transitions are disabled.

## SSR

The component does not access `window`/`document`: coordinates are computed via
`getBoundingClientRect()` only in pointer event handlers, and on the server those
handlers are never called. Host classes are synchronized through `ElementRef`,
as in the other building blocks.

---

[Package README](../../../../README.md)
