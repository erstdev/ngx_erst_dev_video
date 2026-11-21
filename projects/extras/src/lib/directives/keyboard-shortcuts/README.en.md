# KeyboardShortcutsDirective

Player keyboard shortcuts: Space, arrows, F and M. The directive maps keys to
outputs and contains no playback logic — the parent applies the commands,
usually through `VideoService`.

Selector: `[ngxKeyboardShortcuts]`.

## Purpose and responsibilities

**Does:**

- listens for `keydown` on the host element;
- maps recognized keys to the `togglePlay`, `seekBy`, `volumeChange`,
  `toggleMute`, `toggleFullscreen` outputs;
- calls `preventDefault()` for recognized keys so that Space and the arrows do
  not scroll the page;
- sets `aria-keyshortcuts` on the host while the directive is enabled;
- ignores events inside inputs, selects, buttons, links and editable areas.

**Does not:**

- store state or remember key presses;
- call `play()`, `pause()`, `seek()`, `setVolume()`, `toggleMute()`,
  `toggleFullscreen()` or other media element methods;
- know about `VideoService` or read player state;
- manage focus or add `tabindex`;
- translate labels or handle i18n;
- contain styles or CSS variables.

## Import

```ts
import { KeyboardShortcutsDirective } from '@erst_dev/ngx-video-extras';
```

## Usage

```html
<div class="player" ngxKeyboardShortcuts tabindex="0" [enabled]="shortcutsEnabled()" [seekStep]="seekStep()" [volumeStep]="volumeStep()" (togglePlay)="video.toggle()" (seekBy)="onSeekBy($event)" (volumeChange)="onVolumeChange($event)" (toggleMute)="video.toggleMute()" (toggleFullscreen)="video.toggleFullscreen()">
  <video ngxVideo [src]="src" playsinline></video>
</div>
```

```ts
import { Component, computed, inject, signal } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { KeyboardShortcutsDirective } from '@erst_dev/ngx-video-extras';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, KeyboardShortcutsDirective],
  templateUrl: './player.component.html',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';

  readonly shortcutsEnabled = signal(true);
  readonly seekStep = signal(5);
  readonly volumeStep = signal(0.1);

  protected onSeekBy(delta: number): void {
    this.video.seekBy(delta);
  }

  protected onVolumeChange(delta: number): void {
    this.video.setVolume(this.video.volume() + delta);
  }
}
```

The host must be focusable: the consumer sets `tabindex="0"`. The directive
intentionally does not add it — the player container can be any element, and
the decision about focusability stays with the application markup.

## Inputs

| Input        | Type      | Default | Description                                   |
| ------------ | --------- | ------- | --------------------------------------------- |
| `seekStep`   | `number`  | `5`     | Arrow seek step in seconds                    |
| `volumeStep` | `number`  | `0.1`   | Volume step for the up/down arrows            |
| `enabled`    | `boolean` | `true`  | Disables key handling and `aria-keyshortcuts` |

## Outputs

| Output             | Type     | Emitted when                                  |
| ------------------ | -------- | --------------------------------------------- |
| `togglePlay`       | `void`   | Space                                         |
| `seekBy`           | `number` | Left/right arrows: `-seekStep` / `+seekStep`  |
| `volumeChange`     | `number` | Down/up arrows: `-volumeStep` / `+volumeStep` |
| `toggleMute`       | `void`   | M                                             |
| `toggleFullscreen` | `void`   | F                                             |

## Keys

| Key          | Output                      |
| ------------ | --------------------------- |
| `Space`      | `togglePlay`                |
| `ArrowRight` | `seekBy(+seekStep)`         |
| `ArrowLeft`  | `seekBy(-seekStep)`         |
| `ArrowUp`    | `volumeChange(+volumeStep)` |
| `ArrowDown`  | `volumeChange(-volumeStep)` |
| `F` / `f`    | `toggleFullscreen`          |
| `M` / `m`    | `toggleMute`                |

Keys are detected by `event.code`, not by `event.key`: `KeyF` and `KeyM` also
fire on the Russian layout, and `Space` and the arrows do not depend on the
character that modifiers would produce.

## Behavior

- `preventDefault()` is called for recognized keys: Space and the arrows do not
  scroll the page. Unrecognized keys are not cancelled and do not interfere with
  the rest of the markup.
- The event is ignored if:
  - `enabled` is `false`;
  - Ctrl, Meta or Alt is pressed;
  - `event.defaultPrevented` is already `true` — another handler has already
    handled the key;
  - the event target is `input`, `textarea`, `select`, `button`, `a` or
    `contenteditable` (including an element nested inside them). This protects
    the controls inside the player: focus in the speed select or a button is
    not captured.
- For `togglePlay`, `toggleMute` and `toggleFullscreen`, holding the key is
  ignored (`event.repeat === true`): playback, mute and fullscreen are not
  toggled by a series of repeats. For the arrows, repeat is allowed — holding
  the key seeks or changes the volume in steps.
- The directive only emits outputs. The parent decides whether to apply the
  command and how to handle boundaries (for example, out-of-range volume is
  clamped by `VideoService`).
- No state is stored: pressing the same key again emits the output again, and
  the result of the toggle comes from the player state.

## Focus and accessibility

- The host must be focusable: the consumer sets `tabindex="0"`. The directive
  does not add `tabindex` and does not call `focus()`.
- While the directive is enabled, the host has
  `aria-keyshortcuts="Space ArrowRight ArrowLeft ArrowUp ArrowDown F M"`.
  With `enabled = false` the attribute is removed so that the hint does not
  promise keys that do not work.
- The visual `:focus-visible` on the container is the consumer's responsibility.
  An explicit outline with a contrasting color is recommended.
- Keys inside interactive controls are ignored, so native `<select>`,
  `<input>`, `<button>` and links keep working as usual.
- Key handling does not depend on the focus position inside the container: the
  event bubbles from child elements to the host, and the target is checked
  separately.
- In fullscreen mode, focus may move to `<video>` or `body`. If F must exit
  fullscreen, the consumer returns focus into the container itself — for
  example, by setting `tabindex="-1"` on `<video>` and calling `focus()` on
  `fullscreenchange`. The directive does not manage focus.

## SSR

The directive does not use `window`, `document` or media APIs. There is no
`keydown` on the server, so the handler does not run; the `aria-keyshortcuts`
host binding renders safely into the markup. All logic starts with the host
listener and requires no browser initialization.

---

[Package README](../../../../README.md)
