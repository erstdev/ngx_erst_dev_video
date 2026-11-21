# GestureDirective

Player swipes: left and right seek, up and down adjust volume or brightness.
The directive maps a gesture to a single output and contains no playback
logic — the parent applies the deltas, usually through `VideoService`.

Selector: `[ngxGesture]`.

## Purpose and responsibilities

**Does:**

- listens for Pointer Events on the host element: `pointerdown`, `pointermove`,
  `pointerup`, `pointercancel`, `lostpointercapture`;
- waits until the offset exceeds `threshold` and locks the gesture axis;
- captures the pointer via `setPointerCapture()` so that the gesture is not lost
  when the cursor leaves the host;
- on `pointerup`, computes a single delta and emits `seek`, `volumeChange` or
  `brightnessChange`;
- clamps the offset to the step and rounds it to hundredths;
- ignores gestures on interactive elements and when `enabled` is off.

**Does not:**

- store player state or remember position, volume or brightness;
- call `play()`, `pause()`, `seek()`, `setVolume()`, `setPlaybackRate()` and
  other media element methods;
- know about `VideoService`;
- render DOM, or contain styles or CSS variables;
- manage focus, add `tabindex`, `role` or ARIA attributes;
- set `touch-action`: the consumer does that;
- emit outputs during `pointermove` or support a live mode (continuous seek or
  volume).

## Import

```ts
import { GestureDirective } from '@erst_dev/ngx-video-extras';
```

## Usage

```html
<div class="player" ngxGesture [enabled]="gesturesEnabled()" (seek)="onSeek($event)" (volumeChange)="onVolumeChange($event)" (brightnessChange)="onBrightnessChange($event)">
  <video ngxVideo [src]="src" playsinline></video>
</div>
```

```scss
.player {
  /* For touch: without this the browser takes the vertical gesture for scrolling. */
  touch-action: none;
}
```

```ts
import { Component, inject, signal } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { GestureDirective } from '@erst_dev/ngx-video-extras';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, GestureDirective],
  templateUrl: './player.component.html',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';
  readonly gesturesEnabled = signal(true);
  readonly brightness = signal(1);

  protected onSeek(delta: number): void {
    this.video.seekBy(delta);
  }

  protected onVolumeChange(delta: number): void {
    this.video.setVolume(this.video.volume() + delta);
  }

  protected onBrightnessChange(delta: number): void {
    const next = Math.min(1, Math.max(0.2, this.brightness() + delta));
    this.brightness.set(next);
  }
}
```

The directive does not apply the deltas itself: seek, volume and brightness are
handled by the parent. `VideoService.setVolume()` clamps volume to the `0…1`
range itself, so the handler only needs to add the current value and the delta.

## Inputs

| Input            | Type      | Default | Description                                              |
| ---------------- | --------- | ------- | -------------------------------------------------------- |
| `enabled`        | `boolean` | `true`  | Disables gesture handling                                |
| `seekStep`       | `number`  | `30`    | Seconds per full host width                              |
| `volumeStep`     | `number`  | `0.5`   | Volume per full height of the right half of the host     |
| `brightnessStep` | `number`  | `0.5`   | Brightness per full height of the left half of the host  |
| `threshold`      | `number`  | `12`    | Minimum swipe length in pixels before the axis is locked |

Invalid `seekStep`, `volumeStep` and `brightnessStep` values (non-finite or
`<= 0`) are replaced with the defaults. A negative or non-numeric `threshold` is
replaced with zero.

## Outputs

| Output             | Type     | Emitted when                                               |
| ------------------ | -------- | ---------------------------------------------------------- |
| `seek`             | `number` | Horizontal swipe: offset in seconds, signed                |
| `volumeChange`     | `number` | Vertical swipe in the right half: volume offset, signed    |
| `brightnessChange` | `number` | Vertical swipe in the left half: brightness offset, signed |

Outputs are not emitted if the final delta after rounding is zero.

## Gestures

| Gesture                               | Output             | Formula                                       |
| ------------------------------------- | ------------------ | --------------------------------------------- |
| Left / right                          | `seek`             | `dx / width * seekStep`, clamp to `±seekStep` |
| Up / down, starting in the left half  | `brightnessChange` | `-dy / height * brightnessStep`, clamp        |
| Up / down, starting in the right half | `volumeChange`     | `-dy / height * volumeStep`, clamp            |

A swipe up yields a positive offset, down a negative one. The side is determined
by the `pointerdown` point: left half for brightness, right half for volume. The
swipe length is normalized to the host size, so a gesture over half the width
yields half the step.

## Behavior

- **`pointerdown`.** The event is ignored if `enabled = false`, the pointer is
  not primary, it is a mouse with `button !== 0`, the target is an interactive
  element (`input`, `textarea`, `select`, `button`, `a`, `contenteditable`) or a
  gesture is already being tracked. Otherwise the directive stores `pointerId`,
  the start coordinates, the host size and the start side, then calls
  `setPointerCapture()`.
- **Threshold and axis.** Until the Euclidean length of the offset exceeds
  `threshold`, the axis is not locked. Then the axis with the larger absolute
  offset is chosen; on a tie, the horizontal one. `preventDefault()` is called
  at the moment of locking.
- **`pointermove`.** After locking, the last offset is stored. A foreign
  `pointerId` is ignored. If `enabled` is turned off mid-gesture, the state is
  reset without an output.
- **`pointerup`.** If the axis is locked, one final delta is computed:
  horizontal — `dx / width * seekStep`, vertical — `-dy / height * step`. The
  result is clamped to `±step`, rounded to hundredths and emitted only if
  non-zero.
- **`pointercancel` and `lostpointercapture`.** Reset the state without
  emitting.
- **Pointer capture.** If the browser does not support `setPointerCapture()` or
  the call fails, the gesture continues without capture: `pointermove` and
  `pointerup` still reach the host while the pointer is over it.
- **One gesture, one output.** No outputs are emitted during `pointermove`.
  Live mode (continuous seek or volume) is not part of this building block.
- **No state is stored.** The directive does not read the current time, volume
  or brightness: it only reports the offset, and the parent decides how to
  apply it and how to handle boundaries.
- **Mouse, pen and touch.** Pointer Events are used, so the demo and the gesture
  work on desktop. Touch Events are not used.
- **Interactive targets.** A gesture started on a button, link, input or
  `contenteditable` is not intercepted: native controls keep working as usual.

## `touch-action` and styling

The directive does not render DOM and does not own styles: it has no CSS
variables, `customClass` or `ng-template`. For touch, the consumer must set
`touch-action: none` on the host element. Without this the browser claims the
vertical gesture for page scrolling, and `pointercancel` resets the gesture
without an output.

```scss
.player {
  touch-action: none;
}
```

`touch-action` is part of the contract, like `tabindex` for the keyboard
directive. The directive does not set it itself so as not to change the scroll
behavior of an element that the consumer uses for more than a player.

## Accessibility

- The directive does not manage focus and does not add `tabindex`, `role` or
  ARIA attributes. Swiping is not the only way to control: the player needs
  buttons and sliders that are accessible from the keyboard and to a screen
  reader.
- A gesture is not a replacement for an `aria-label` or a text hint. If the
  gesture matters for a scenario, hint at it in the interface and in the
  accessible description.
- Gestures on interactive elements are ignored, so buttons, links, inputs and
  editable areas inside the container keep working.

## SSR

The directive does not use `window`, `document` or media APIs. There are no
Pointer Events on the server, so the handlers do not run. Host geometry and
pointer capture are only accessed inside browser handlers; no browser
initialization is required.

---

[Package README](../../../../README.md)
