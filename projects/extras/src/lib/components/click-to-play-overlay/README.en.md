# ClickToPlayOverlayComponent

A transparent layer over the video with a large Play button. It covers the
typical "click to play" scenario: the browser allows playback after a user
gesture, and the component reports the click outward.

Selector: `ngx-click-to-play-overlay`.

## Purpose and responsibilities

**Does:**

- shows the overlay only in the `idle` and `paused` states;
- covers the entire area of the parent container and receives the click;
- draws a round button with a Play icon;
- supports `customClass` and a custom icon via `iconTemplate`;
- reports the click through the `play` output.

**Does not:**

- does not call `play()`, `pause()`, or other media element methods;
- does not know about `VideoService` and does not store player state;
- does not decide whether to start playback or pause it;
- does not control the container layout — the parent must set
  `position: relative` on it.

## Import

```ts
import { ClickToPlayOverlayComponent } from '@erst_dev/ngx-video-extras';
```

## Usage

```html
<div class="player">
  <video ngxVideo [src]="src" playsinline (click)="video.pause()"></video>

  <ngx-click-to-play-overlay [state]="video.state()" (play)="video.play()" />
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
import { ClickToPlayOverlayComponent } from '@erst_dev/ngx-video-extras';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, ClickToPlayOverlayComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';
}
```

The parent decides what to do on click. In the typical scenario this is
`video.play()`; after the state switches to `playing`, the overlay disappears
from the DOM.

## Inputs

| Input          | Type                                                 | Default      | Description                                         |
| -------------- | ---------------------------------------------------- | ------------ | --------------------------------------------------- |
| `state`        | `VideoState`                                         | — (required) | Current player state; visibility is derived from it |
| `customClass`  | `string`                                             | `''`         | Extra CSS class for the host element                |
| `ariaLabel`    | `string \| null`                                     | `null`       | Overrides `aria-label`; defaults to "Play video"    |
| `iconTemplate` | `TemplateRef<ClickToPlayOverlayIconContext> \| null` | `null`       | Custom icon instead of the default SVG              |

## Outputs

| Output | Type   | Description                                        |
| ------ | ------ | -------------------------------------------------- |
| `play` | `void` | Click on the overlay. The parent controls playback |

## Behavior by state

| `state`     | Overlay in DOM |
| ----------- | -------------- |
| `idle`      | yes            |
| `playing`   | no             |
| `paused`    | yes            |
| `buffering` | no             |
| `seeking`   | no             |
| `ended`     | no             |
| `error`     | no             |

The overlay is rendered via `@if`, so in hidden states the button is absent not
only visually but also from the DOM: it does not intercept clicks and does not
enter the accessibility tree. The host element `<ngx-click-to-play-overlay>`
stays in the markup — the parent creates it — but an empty host does not block
clicks on the video: `:host` has `pointer-events: none`, while the button has
`auto`.

The click is received by the button stretched over the whole host. Inside it sits
the visual circle; `:focus-visible` draws the outline on the circle itself.

## CSS variables

All values are defined in `:host`, so the component works out of the box and can
be overridden without editing the sources.

| Variable                      | Default               | Description                      |
| ----------------------------- | --------------------- | -------------------------------- |
| `--ngx-overlay-size`          | `72px`                | Circle diameter                  |
| `--ngx-overlay-icon-size`     | `40%`                 | Icon size relative to the circle |
| `--ngx-overlay-color`         | `#ffffff`             | Icon color                       |
| `--ngx-overlay-bg`            | `rgba(0, 0, 0, 0.55)` | Circle background                |
| `--ngx-overlay-hover-bg`      | `rgba(0, 0, 0, 0.75)` | Circle background on hover       |
| `--ngx-overlay-border-radius` | `50%`                 | Circle corner radius             |
| `--ngx-overlay-transition`    | `0.15s ease`          | Background and color transition  |
| `--ngx-overlay-focus-color`   | `#ffffff`             | Outline color on keyboard focus  |

`--ngx-overlay-icon-size` sets the size of the default SVG icon and of the
custom icon container. The component does not impose the inner size of the
`iconTemplate` content — the consumer sets it.

## Styling

Override on the component itself:

```scss
ngx-click-to-play-overlay {
  --ngx-overlay-size: 96px;
  --ngx-overlay-bg: #059669;
  --ngx-overlay-hover-bg: #047857;
}
```

Via `customClass` — the class is applied to the **host element**
`<ngx-click-to-play-overlay>`:

```html
<ngx-click-to-play-overlay customClass="my-overlay" [state]="video.state()" (play)="video.play()" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-overlay {
  --ngx-overlay-size: 96px;
  --ngx-overlay-bg: #059669;
  --ngx-overlay-hover-bg: #047857;
  --ngx-overlay-border-radius: 16px;
}
```

`customClass` does not affect classes set on the element manually:
`<ngx-click-to-play-overlay class="layout-wide" customClass="my-overlay">`
keeps both classes.

## Custom icon

```html
<ngx-click-to-play-overlay [state]="video.state()" [iconTemplate]="myIcon" (play)="video.play()" />

<ng-template #myIcon let-state="state">
  <span class="my-icon" [class.my-icon--paused]="state === 'paused'">★</span>
</ng-template>
```

Context is passed into the template:

```ts
interface ClickToPlayOverlayIconContext {
  readonly state: VideoState;
}
```

The custom template is rendered inside the circle instead of the default SVG
icon. The icon container is marked `aria-hidden="true"`: the icon is decorative,
and the button label comes from `aria-label`. Do not add text to the template
that a screen reader should announce.

## Accessibility

- A native `<button type="button">` is rendered — Enter/Space, focus, and button
  semantics work without extra code.
- `aria-label` defaults to "Play video" and is overridden by the `ariaLabel`
  input.
- The icons are marked `aria-hidden="true"`; the default SVG also has
  `focusable="false"`.
- A visible `:focus-visible` outline on the circle.
- With `prefers-reduced-motion: reduce`, transitions are disabled.
- In hidden states there is no overlay button in the DOM, and the empty host
  does not block focus or clicks on the video.

## SSR

The component does not use `window`, `document`, or media APIs. The only DOM
access is syncing the host classes through `ElementRef` in `effect()`; on the
server Angular provides the element the same way as in the browser. The template
renders safely on the server.

---

[Package README](../../../../README.md)
