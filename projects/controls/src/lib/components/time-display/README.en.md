# TimeDisplayComponent

Current position and duration as "current / total". Both values are formatted by
the shared `formatTime` utility from `@erst_dev/ngx-video-core`.

Selector: `ngx-time-display`.

## Purpose and responsibilities

**Does:**

- accepts `currentTime` and `duration` in seconds;
- formats them through `formatTime` and renders them in the template;
- ensures correct screen-reader output ("00:07 of 01:30").

**Does not:**

- subscribe to `VideoService` or watch `<video>`;
- request time and duration on its own;
- manage playback or seeking.

## Import

```ts
import { TimeDisplayComponent } from '@erst_dev/ngx-video-controls';
```

## Usage

```html
<video ngxVideo [src]="src"></video>

<ngx-time-display [currentTime]="video.time()" [duration]="video.duration()" />
```

Updates come from the parent: the template reads `VideoService` signals, and the
component only formats the numbers it receives.

## Inputs

| Input         | Type     | Default      | Description                                                    |
| ------------- | -------- | ------------ | -------------------------------------------------------------- |
| `currentTime` | `number` | — (required) | Current position in seconds                                    |
| `duration`    | `number` | — (required) | Total duration in seconds; `0` until metadata is loaded        |
| `customClass` | `string` | `''`         | Additional CSS class for the `<ngx-time-display>` host element |

## Outputs

No outputs: the component only displays the values it receives.

## Behavior

- Below an hour the format is `mm:ss`; from an hour on it is `h:mm:ss`.
- Invalid values (`NaN`, `Infinity`, negative, `null`/`undefined`) become `00:00` —
  this is `formatTime` behavior.
- The fractional part of seconds is truncated: `formatTime` uses `Math.floor`.
- No `ng-template` is provided: the internal markup is minimal, and the appearance
  is customized with CSS variables and `customClass`.

## CSS variables

| Variable                     | Default                    | Description              |
| ---------------------------- | -------------------------- | ------------------------ |
| `--ngx-time-color`           | `#ffffff`                  | Text color               |
| `--ngx-time-separator-color` | `rgba(255, 255, 255, 0.6)` | Separator color          |
| `--ngx-time-font-size`       | `0.875rem`                 | Font size                |
| `--ngx-time-gap`             | `0.25rem`                  | Gap between output parts |

Digits are rendered with `font-variant-numeric: tabular-nums`, so the text width
does not jump when seconds change.

## Styling

```scss
ngx-time-display {
  --ngx-time-color: #34d399;
  --ngx-time-separator-color: rgba(52, 211, 153, 0.6);
  --ngx-time-font-size: 1rem;
  --ngx-time-gap: 0.4rem;
}
```

Via `customClass` — the class is applied to the **host element** `<ngx-time-display>`:

```html
<ngx-time-display customClass="my-time" [currentTime]="video.time()" [duration]="video.duration()" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-time {
  --ngx-time-color: #34d399;
  --ngx-time-font-size: 1rem;
}
```

`customClass` does not affect classes set on the element manually:
`<ngx-time-display class="layout-wide" customClass="my-time">` keeps both.

## Accessibility

- The text is read as "00:07 of 01:30": the visible `/` is hidden via
  `aria-hidden="true"`, and a visually hidden "of" is added in its place.
- `aria-live` is not used: time changes every second, and announcing every update
  would get in the way. The screen reader will read the value when focus moves to
  the element.
- The component is non-interactive, so it is not in the tab order.

## SSR

The component does not access `window`/`document`: only formatting and bindings,
and host classes are synchronized through `ElementRef` in the same way as in
`PlayButtonComponent`.

---

[Package README](../../../../README.md)
