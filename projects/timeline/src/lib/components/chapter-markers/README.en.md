# ChapterMarkersComponent

Chapter markers on top of the timeline: draws markers from an array of
"time + title", highlights the active chapter and reports the selection
outward.

Selector: `ngx-chapter-markers`.

## Purpose and responsibilities

**Does:**

- accepts chapters and duration;
- sorts chapters and filters out invalid ones;
- draws marker buttons at the required positions;
- highlights the active chapter based on `currentTime`;
- emits `chapterSelect` with the full chapter object.

**Does not:**

- does not call `video.seek()` and knows nothing about `VideoService`;
- does not parse video metadata;
- does not edit or save chapters;
- does not render the timeline — that is a separate building block.

## Import

```ts
import { ChapterMarkersComponent, type ChapterInterface } from '@erst_dev/ngx-video-timeline';
```

## Usage

```html
<div class="timeline-track">
  <ngx-timeline [currentTime]="video.time()" [duration]="video.duration()" (seek)="video.seek($event)" />

  <ngx-chapter-markers [chapters]="chapters" [duration]="video.duration()" [currentTime]="video.time()" (chapterSelect)="video.seek($event.time)" />
</div>
```

```scss
.timeline-track {
  position: relative;
}
```

The `ngx-chapter-markers` host is positioned absolutely (`inset: 0`), so the
parent container must be `position: relative` and match the timeline in height.

## Chapter interface

```ts
interface ChapterInterface {
  readonly id?: string;
  readonly time: number;
  readonly title: string;
}
```

- `time` — chapter start in seconds, required;
- `title` — name for the tooltip and `aria-label`, required;
- `id` — optional stable identifier for `track` and analytics.

## Inputs

| Input         | Type                          | Default      | Description                                                        |
| ------------- | ----------------------------- | ------------ | ------------------------------------------------------------------ |
| `chapters`    | `readonly ChapterInterface[]` | — (required) | List of chapters; an empty array can be passed                     |
| `duration`    | `number`                      | — (required) | Video duration in seconds: needed to convert time into percentages |
| `currentTime` | `number`                      | `0`          | Current position: the active chapter is highlighted based on it    |
| `customClass` | `string`                      | `''`         | Additional CSS class for the `<ngx-chapter-markers>` host element  |
| `ariaLabel`   | `string \| null`              | `null`       | Override for the group `aria-label`; defaults to "Chapters"        |

## Outputs

| Output          | Type               | Description                               |
| --------------- | ------------------ | ----------------------------------------- |
| `chapterSelect` | `ChapterInterface` | Marker click; the parent applies the seek |

Why not `seek` with a number: the component knows the whole chapter, and passing
`time`, `title` and `id` is more useful than making the parent look up the
chapter by time. Seeking remains the parent's responsibility:

```ts
onChapterSelect(chapter: ChapterInterface): void {
  this.video.seek(chapter.time);
}
```

## Behavior

- Chapters are sorted by `time`; the source array is not mutated.
- Invalid times (`NaN`, negative, greater than `duration`) are ignored.
- When `duration <= 0` or the list is empty, nothing is rendered.
- The active chapter is the last one whose `time <= currentTime`.
- A marker click does not fall through to the timeline: `stopPropagation()`.
- Markers are native `<button type="button">`: Enter/Space work out of the box.
- A tooltip with the title and time appears on hover and focus.
- For the outermost chapters the tooltip is pinned to the edge so it does not
  extend beyond the player.

## CSS variables

| Variable                               | Default                    | Description                         |
| -------------------------------------- | -------------------------- | ----------------------------------- |
| `--ngx-timeline-chapter-color`         | `rgba(255, 255, 255, 0.6)` | Inactive marker color               |
| `--ngx-timeline-chapter-active-color`  | `#ffffff`                  | Active marker and hover/focus color |
| `--ngx-timeline-chapter-size`          | `8px`                      | Width of the visible marker         |
| `--ngx-timeline-chapter-height`        | `14px`                     | Height of the visible marker        |
| `--ngx-timeline-chapter-hit-size`      | `24px`                     | Hit area size (the button)          |
| `--ngx-timeline-chapter-radius`        | `2px`                      | Marker border radius                |
| `--ngx-timeline-chapter-transition`    | `0.15s ease`               | Color and scale transition          |
| `--ngx-timeline-chapter-tooltip-bg`    | `rgba(0, 0, 0, 0.85)`      | Tooltip background                  |
| `--ngx-timeline-chapter-tooltip-color` | `#ffffff`                  | Tooltip text color                  |
| `--ngx-timeline-chapter-focus-color`   | `#ffffff`                  | Outline color at `:focus-visible`   |

## Styling

```scss
ngx-chapter-markers {
  --ngx-timeline-chapter-color: #34d399;
  --ngx-timeline-chapter-active-color: #6ee7b7;
  --ngx-timeline-chapter-size: 10px;
  --ngx-timeline-chapter-height: 18px;
}
```

Through `customClass` — the class is applied to the **host element**
`<ngx-chapter-markers>`:

```html
<ngx-chapter-markers customClass="my-chapters" [chapters]="chapters" [duration]="video.duration()" [currentTime]="video.time()" (chapterSelect)="video.seek($event.time)" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-chapters {
  --ngx-timeline-chapter-color: #34d399;
  --ngx-timeline-chapter-active-color: #6ee7b7;
  --ngx-timeline-chapter-size: 10px;
  --ngx-timeline-chapter-height: 18px;
}
```

## Accessibility

- The container is `role="group"` with `aria-label="Chapters"`.
- Each marker is a native button with an `aria-label` like
  "Chapter: Introduction, 00:00".
- The active chapter has `aria-current="true"`.
- A visible `:focus-visible` outline.
- The hit area is larger than the visible marker
  (`--ngx-timeline-chapter-hit-size`) so the markers are accessible on touch
  screens.
- The tooltip is marked `aria-hidden="true"`: its text is already present in
  `aria-label`.

## SSR

The component does not access `window`/`document`: only computations and
bindings, and host classes are synchronized via `ElementRef`. It renders safely
on the server together with the timeline.

---

[Package README](../../../../README.md)
