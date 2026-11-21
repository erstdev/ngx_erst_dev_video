# VolumeSliderComponent

A volume slider built on the native `input[type="range"]`: it shows the passed-in
level and reports a new value to the outside.

Selector: `ngx-volume-slider`.

## Purpose and responsibilities

**Does:**

- displays volume `0…1` and the track fill;
- handles dragging, clicks on the track, and the keyboard;
- emits `volumeChange` with the new value clamped to `0…1`.

**Does not:**

- store state: the displayed value always comes from the `volume` input;
- call `<video>` methods or know about `VideoService`;
- manage mute — that needs a separate button.

## Import

```ts
import { VolumeSliderComponent } from '@erst_dev/ngx-video-controls';
```

## Usage

```html
<ngx-volume-slider [volume]="video.volume()" (volumeChange)="video.setVolume($event)" />

<!-- mute is a separate button; the slider does not replace it -->
<button type="button" (click)="video.toggleMute()">{{ video.muted() ? 'Unmute' : 'Mute' }}</button>
```

## Inputs

| Input         | Type             | Default      | Description                                                               |
| ------------- | ---------------- | ------------ | ------------------------------------------------------------------------- |
| `volume`      | `number`         | — (required) | Current volume `0…1`; values outside the range are clamped when displayed |
| `customClass` | `string`         | `''`         | Additional CSS class for the `<ngx-volume-slider>` host element           |
| `ariaLabel`   | `string \| null` | `null`       | Overrides `aria-label`; defaults to "Volume"                              |

## Outputs

| Output         | Type     | Description                                                              |
| -------------- | -------- | ------------------------------------------------------------------------ |
| `volumeChange` | `number` | New value `0…1` when dragging, clicking the track, or using the keyboard |

## Behavior

- The value is emitted on the native `input` event: while dragging, the level
  updates continuously.
- Before emitting, the value is clamped to `0…1`; invalid numbers are ignored.
- The component does not store state: the displayed value always comes from the
  `volume` input. The parent applies it, for example through `video.setVolume()`.
- Mute is outside the component's scope. When `video.muted() === true`, the
  slider keeps showing `volume`, not `0`: the sound state lives in a separate
  button.
- Internally it uses the `clamp` utility exported by the package. Its behavior:
  invalid values (`NaN`, `Infinity`) become the minimum of the range.

No `ng-template` is provided: inside there is only the native `input[type="range"]`.
For custom markup, a dedicated control is needed.

## CSS variables

All values are defined in `:host`, so the control works out of the box and can be
overridden without editing the sources.

| Variable                           | Default                    | Description                                |
| ---------------------------------- | -------------------------- | ------------------------------------------ |
| `--ngx-volume-width`               | `120px`                    | Slider width                               |
| `--ngx-volume-track-height`        | `4px`                      | Track thickness                            |
| `--ngx-volume-track-color`         | `rgba(255, 255, 255, 0.3)` | Color of the unfilled part of the track    |
| `--ngx-volume-fill-color`          | `#ffffff`                  | Color of the filled part and focus outline |
| `--ngx-volume-thumb-color`         | `#ffffff`                  | Thumb color                                |
| `--ngx-volume-thumb-hover-color`   | `#e5e7eb`                  | Thumb color on hover                       |
| `--ngx-volume-thumb-size`          | `14px`                     | Thumb size                                 |
| `--ngx-volume-border-radius`       | `999px`                    | Track corner radius                        |
| `--ngx-volume-thumb-border-radius` | `50%`                      | Thumb corner radius                        |
| `--ngx-volume-transition`          | `0.15s ease`               | Thumb color transition                     |

## Styling

Override on the component itself:

```scss
ngx-volume-slider {
  --ngx-volume-width: 180px;
  --ngx-volume-fill-color: #34d399;
  --ngx-volume-thumb-color: #34d399;
  --ngx-volume-thumb-size: 18px;
}
```

Via `customClass` — the class is applied to the **host element** `<ngx-volume-slider>`:

```html
<ngx-volume-slider customClass="my-volume" [volume]="video.volume()" (volumeChange)="video.setVolume($event)" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-volume {
  --ngx-volume-width: 180px;
  --ngx-volume-track-height: 6px;
  --ngx-volume-track-color: rgba(255, 255, 255, 0.2);
  --ngx-volume-fill-color: #34d399;
  --ngx-volume-thumb-color: #34d399;
  --ngx-volume-thumb-hover-color: #6ee7b7;
  --ngx-volume-thumb-size: 18px;
}
```

`customClass` does not affect classes set on the element manually:
`<ngx-volume-slider class="layout-wide" customClass="my-volume">` keeps both.

Muted sound is a state of the mute button, not of the slider. If you need to show
it visually too, pass the class dynamically:

```html
<ngx-volume-slider [customClass]="video.muted() ? 'is-muted' : ''" [volume]="video.volume()" (volumeChange)="video.setVolume($event)" />
```

```scss
.is-muted {
  --ngx-volume-fill-color: #6b7280;
  --ngx-volume-thumb-color: #6b7280;
}
```

## Vertical view

Orientation is the consumer's layout, not a component input. Rotate the slider
inside a container of the required size:

```html
<div class="player__volume">
  <ngx-volume-slider customClass="my-volume-vertical" [volume]="video.volume()" (volumeChange)="video.setVolume($event)" />
</div>
```

```scss
.player__volume {
  display: grid;
  place-items: center;
  height: 160px;
}

.my-volume-vertical {
  --ngx-volume-width: 140px;
  transform: rotate(-90deg);
}
```

After rotation, the fill grows from bottom to top, and the keyboard keeps working
the same way as with a horizontal slider.

## Accessibility

- Native `<input type="range">` with `min="0"`, `max="1"`, `step="0.01"`:
  arrows, Home/End, PageUp/PageDown, focus, and semantics work out of the box.
- `aria-label` defaults to "Volume" and is overridden with the `ariaLabel` input.
- `aria-valuetext` is passed as a percentage (`42%`) so the screen reader does not
  read the raw value `0.42`.
- A visible `:focus-visible` outline.
- With `prefers-reduced-motion: reduce`, transitions are disabled.

## SSR

The component does not access `window`/`document`: the template contains only a
native binding, and host classes are synchronized through `ElementRef` in the same
way as in `PlayButtonComponent`.

---

[Package README](../../../../README.md)
