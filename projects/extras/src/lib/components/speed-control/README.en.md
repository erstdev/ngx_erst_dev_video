# SpeedControlComponent

A playback rate selector: it shows the current value and reports the choice of a
new one. It does not apply the rate to the video — the parent does that, usually
through `VideoService.setPlaybackRate()`.

Selector: `ngx-speed-control`.

## Purpose and responsibilities

**Does:**

- shows the current rate in a native `<select>`;
- builds the option list from `rates` in the given order, without duplicates;
- appends the current rate to the end of the list if it is not among `rates`;
- reports a selection through the `rateChange` output only as a finite positive
  number;
- supports `customClass` and the `--ngx-speed-*` CSS variables.

**Does not:**

- store state or remember the selected value;
- call `setPlaybackRate()`, `play()`, `pause()`, or other media element methods;
- know about `VideoService` or read player state;
- modify the passed `playbackRate` and `rates`;
- translate labels or manage i18n.

## Import

```ts
import { SpeedControlComponent } from '@erst_dev/ngx-video-extras';
```

## Usage

```html
<div class="player">
  <video ngxVideo [src]="src" playsinline></video>

  <ngx-speed-control [playbackRate]="video.playbackRate()" (rateChange)="onRateChange($event)" />
</div>
```

```ts
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { SpeedControlComponent } from '@erst_dev/ngx-video-extras';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, SpeedControlComponent],
  templateUrl: './player.component.html',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';

  protected onRateChange(rate: number): void {
    this.video.setPlaybackRate(rate);
  }
}
```

The component only emits the selected value. Applying the rate, checking browser
support, and syncing with the service are the parent's responsibility.

## Inputs

| Input          | Type                | Default            | Description                               |
| -------------- | ------------------- | ------------------ | ----------------------------------------- |
| `playbackRate` | `number`            | — (required)       | Current playback rate                     |
| `rates`        | `readonly number[]` | `[0.5, 1, 1.5, 2]` | Available rates in display order          |
| `customClass`  | `string`            | `''`               | Additional CSS class for the host element |

## Outputs

| Output       | Type     | Description                          |
| ------------ | -------- | ------------------------------------ |
| `rateChange` | `number` | Selected rate. The parent applies it |

## Behavior

- Options are built from `rates` in the order they are passed. Duplicates are
  collapsed: a repeated rate does not create a second option.
- Invalid values in `rates` (non-finite numbers or values not greater than zero)
  are discarded — they can neither be displayed meaningfully nor applied.
- If `playbackRate` is missing from `rates`, it is appended to the end of the
  list. Therefore the select never shows an empty value because the current rate
  is not among the available ones.
- Option labels are `0.5x`, `1x`, `1.5x`, `2x`: a number and the `x` suffix.
- The value is read on the native `change` event, converted through `Number`,
  and emitted only if it is finite and greater than zero. An invalid value is
  silently ignored.
- The component does not store the selected value: the displayed rate is
  determined by the `playbackRate` input. If the parent does not apply the
  emitted value, the select stays under the control of the input signal.

## Rate list

`rates` lets you define a custom set. For example, for slow motion and faster
playback:

```ts
readonly rates = [0.25, 1, 3] as const;
```

```html
<ngx-speed-control [playbackRate]="video.playbackRate()" [rates]="rates" (rateChange)="onRateChange($event)" />
```

If the current rate is `1.5` and it is not in `rates`, the select shows `0.25x`,
`1x`, `3x`, `1.5x` — the current rate appended to the end.

## CSS variables

All values are defined in `:host`, so the component works out of the box and is
overridden without editing the sources.

| Variable                    | Default                    | Description                          |
| --------------------------- | -------------------------- | ------------------------------------ |
| `--ngx-speed-bg`            | `rgba(0, 0, 0, 0.6)`       | Select background                    |
| `--ngx-speed-color`         | `#ffffff`                  | Text color and border color on hover |
| `--ngx-speed-border-color`  | `rgba(255, 255, 255, 0.3)` | Border color at rest                 |
| `--ngx-speed-border-radius` | `0.375rem`                 | Select border radius                 |
| `--ngx-speed-padding`       | `0.25rem 0.5rem`           | Select padding                       |
| `--ngx-speed-font-size`     | `0.8125rem`                | Font size                            |
| `--ngx-speed-focus-color`   | `#60a5fa`                  | Outline color on keyboard focus      |
| `--ngx-speed-transition`    | `0.15s ease`               | Border and background transition     |

## Styling

Override on the component itself:

```scss
ngx-speed-control {
  --ngx-speed-bg: #111827;
  --ngx-speed-border-radius: 999px;
  --ngx-speed-focus-color: #34d399;
}
```

Via `customClass` — the class is applied to the **host element**
`<ngx-speed-control>`:

```html
<ngx-speed-control customClass="my-speed" [playbackRate]="video.playbackRate()" [rates]="rates" (rateChange)="onRateChange($event)" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-speed {
  --ngx-speed-bg: #064e3b;
  --ngx-speed-color: #d1fae5;
  --ngx-speed-border-color: #059669;
  --ngx-speed-border-radius: 999px;
  --ngx-speed-padding: 0.375rem 0.75rem;
  --ngx-speed-font-size: 0.875rem;
  --ngx-speed-focus-color: #34d399;
}
```

`customClass` does not affect classes set on the element manually:
`<ngx-speed-control class="layout-wide" customClass="my-speed">` keeps both
classes.

## i18n

There is no separate i18n layer — this is a Sprint 4 decision:

- option labels (`0.5x`, `1x`, …) consist of a number and the technical suffix
  `x`, so they do not need translation;
- the select's `aria-label` is a fixed Russian string meaning “Playback speed”;
- if the application needs another language, the label can be moved to an
  additive `ariaLabel` input in a future version without breaking the current
  API.

The component does not translate text or replace labels by locale.

## Accessibility

- A native `<select>` is used: keyboard, type-ahead by first letter, focus, and
  semantics work without extra code.
- The select has a permanent `aria-label="Playback speed"` — the label is not
  lost if there is no visual `<label>` nearby.
- A visible `:focus-visible` outline with a configurable color
  `--ngx-speed-focus-color`.
- With `prefers-reduced-motion: reduce`, the border and background transition is
  disabled.
- The select always has a selected option: the current rate is added to the list
  even if it is not among `rates`.

## SSR

The component does not use `window`, `document`, or media APIs. The only DOM
access is synchronizing host classes through `ElementRef` in `effect()`; on the
server Angular provides the element in the same way as in the browser. The
`<select>` markup renders safely on the server; the `change` event occurs only
in the browser.

---

[Package README](../../../../README.md)
