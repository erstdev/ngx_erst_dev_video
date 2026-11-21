# ErrorDisplayComponent

A card with a player error message and a “Retry” button. It shows user-friendly
text instead of technical details, but fixes nothing: the parent decides whether
to retry.

Selector: `ngx-error-display`.

## Purpose and responsibilities

**Does:**

- renders the card only when `error` is non-empty;
- shows `error.message`, substituting a neutral fallback for empty text;
- displays the “Retry” button and reports a click through the `retry` output;
- supports `customClass` and the `--ngx-error-*` CSS variables.

**Does not:**

- call `play()`, `seek()`, or other media element methods;
- know about `VideoService` or store player state;
- reload the source or fix the error;
- show `cause` or other technical details;
- control the container's layout — the parent must set `position: relative` on
  it.

## Import

```ts
import { ErrorDisplayComponent } from '@erst_dev/ngx-video-extras';
```

## Usage

```html
<div class="player">
  <video ngxVideo [src]="src" playsinline></video>

  <ngx-error-display [error]="video.error()" (retry)="onRetry()" />
</div>
```

```scss
.player {
  position: relative;
  background: #000;
}
```

```ts
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { ErrorDisplayComponent } from '@erst_dev/ngx-video-extras';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, ErrorDisplayComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';

  protected onRetry(): void {
    // The parent decides what "retry" means: reload the source,
    // retry the request, or simply start playback.
    void this.video.play();
  }
}
```

The error state comes from the outside. It can be a `VideoService.error()`
signal or the application's own signal — the component only cares about the
`VideoError` object itself.

## Inputs

| Input         | Type                 | Default      | Description                                          |
| ------------- | -------------------- | ------------ | ---------------------------------------------------- |
| `error`       | `VideoError \| null` | — (required) | Player error; with `null` the card is not in the DOM |
| `customClass` | `string`             | `''`         | Additional CSS class for the host element            |

## Outputs

| Output  | Type   | Description                                                |
| ------- | ------ | ---------------------------------------------------------- |
| `retry` | `void` | Click on the “Retry” button. The parent performs the retry |

## Behavior

- With `error === null` the card is not rendered: it is absent not only visually
  but also in the DOM, so it does not enter the accessibility tree. The
  `<ngx-error-display>` host element stays in the markup — it is created by the
  parent — but the empty host does not block clicks on the video: `:host` has
  `pointer-events: none`, and the card has `auto`.
- The text comes from `error.message`. If the string is empty or consists of
  whitespace, the fallback “Could not play the video” is shown.
- The `cause` field and technical details are not shown: the message is already
  normalized in core.
- The button has `type="button"` and the text “Retry”. A click only emits
  `retry`.
- The component does not use `error.code` — it is a machine contract for the
  consumer's logic.

## CSS variables

All values are defined in `:host`, so the component works out of the box and is
overridden without editing the sources.

| Variable                      | Default              | Description                     |
| ----------------------------- | -------------------- | ------------------------------- |
| `--ngx-error-bg`              | `rgba(0, 0, 0, 0.8)` | Card background                 |
| `--ngx-error-color`           | `#f9fafb`            | Text color                      |
| `--ngx-error-border-radius`   | `0.75rem`            | Card border radius              |
| `--ngx-error-padding`         | `1.25rem`            | Card padding                    |
| `--ngx-error-gap`             | `0.75rem`            | Gap between text and button     |
| `--ngx-error-max-width`       | `320px`              | Maximum card width              |
| `--ngx-error-button-bg`       | `#ffffff`            | Button background               |
| `--ngx-error-button-color`    | `#111827`            | Button text color               |
| `--ngx-error-button-hover-bg` | `#e5e7eb`            | Button background on hover      |
| `--ngx-error-focus-color`     | `#60a5fa`            | Outline color on keyboard focus |
| `--ngx-error-transition`      | `0.15s ease`         | Button background transition    |

## Styling

Override on the component itself:

```scss
ngx-error-display {
  --ngx-error-bg: rgba(17, 24, 39, 0.92);
  --ngx-error-max-width: 400px;
}
```

Via `customClass` — the class is applied to the **host element**
`<ngx-error-display>`:

```html
<ngx-error-display customClass="my-error" [error]="error()" (retry)="onRetry()" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-error {
  --ngx-error-bg: #7f1d1d;
  --ngx-error-color: #fef2f2;
  --ngx-error-border-radius: 16px;
  --ngx-error-button-bg: #fecaca;
  --ngx-error-button-hover-bg: #fca5a5;
  --ngx-error-button-color: #7f1d1d;
  --ngx-error-focus-color: #fca5a5;
}
```

`customClass` does not affect classes set on the element manually:
`<ngx-error-display class="layout-wide" customClass="my-error">` keeps both
classes. The card itself and its internal classes remain private.

## i18n

There is no separate i18n layer — this is a deliberate Sprint 4 decision:

- `VideoError.message` already contains ready-made Russian text from core;
- the consumer can pass its own `VideoError` with a localized `message`; `code`
  stays a machine contract;
- the retry button text is still hardcoded Russian, without a separate token.

The component does not translate the message or replace it based on `code`: it
shows exactly what arrives in the `error` input.

## Accessibility

- The card is marked `role="alert"`: when it appears in the DOM, the screen
  reader announces the error message.
- The button is a native `<button type="button">`: Enter/Space, focus, and
  semantics work without extra code.
- A visible `:focus-visible` outline on the button.
- With `prefers-reduced-motion: reduce`, the background transition is disabled.
- When there is no error, the card is absent from the DOM, and the empty host
  does not intercept clicks or interfere with video controls.

## SSR

The component does not use `window`, `document`, or media APIs. The only DOM
access is synchronizing host classes through `ElementRef` in `effect()`; on the
server Angular provides the element in the same way as in the browser. The
template renders safely on the server.

---

[Package README](../../../../README.md)
