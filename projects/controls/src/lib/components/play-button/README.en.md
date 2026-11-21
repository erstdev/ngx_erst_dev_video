# PlayButtonComponent

Play/Pause button for the player. It shows an icon for the given state and
reports clicks to the outside.

Selector: `ngx-play-button`.

## Purpose and responsibilities

**Does:**

- picks the icon, label, and `aria-pressed` from the `state` input;
- handles clicks and emits the `toggle` output;
- supports `customClass` and a custom icon via `iconTemplate`.

**Does not:**

- does not call `<video>` methods and knows nothing about `VideoService`;
- does not store player state;
- does not decide whether to start playback or pause — that is the parent's job,
  which subscribes to `toggle`.

## Import

```ts
import { PlayButtonComponent } from '@erst_dev/ngx-video-controls';
```

## Usage

```html
<video ngxVideo [src]="src" (click)="video.toggle()"></video>

<ngx-play-button [state]="video.state()" (toggle)="video.toggle()" />
```

```ts
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { PlayButtonComponent } from '@erst_dev/ngx-video-controls';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, PlayButtonComponent],
  template: `
    <video ngxVideo [src]="src" (click)="video.toggle()"></video>
    <ngx-play-button [state]="video.state()" (toggle)="video.toggle()" />
  `,
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';
}
```

## Inputs

| Input          | Type                                         | Default      | Description                                                 |
| -------------- | -------------------------------------------- | ------------ | ----------------------------------------------------------- |
| `state`        | `VideoState`                                 | — (required) | Current player state; the icon and label are chosen from it |
| `customClass`  | `string`                                     | `''`         | Extra CSS class for the `<ngx-play-button>` host element    |
| `ariaLabel`    | `string \| null`                             | `null`       | Overrides `aria-label`; defaults to “Play” / “Pause”        |
| `iconTemplate` | `TemplateRef<PlayButtonIconContext> \| null` | `null`       | Custom icon instead of the default one                      |

## Outputs

| Output   | Type   | Description                                                                                                                      |
| -------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `toggle` | `void` | Click on the button. It may coincide with the name of the native DOM `toggle` event — this is safe because the element is custom |

## Behavior by state

`playing = state === 'playing' || state === 'buffering'` — during buffering the
button shows pause, because playback has already started.

| `state`     | Icon    | `aria-pressed` | Default `aria-label` |
| ----------- | ------- | -------------- | -------------------- |
| `idle`      | ▶ play  | `false`        | Play                 |
| `playing`   | ⏸ pause | `true`         | Pause                |
| `buffering` | ⏸ pause | `true`         | Pause                |
| `paused`    | ▶ play  | `false`        | Play                 |
| `seeking`   | ▶ play  | `false`        | Play                 |
| `ended`     | ▶ play  | `false`        | Play                 |
| `error`     | ▶ play  | `false`        | Play                 |

## CSS variables

All values are defined in `:host`, so the control works out of the box and is
overridden without editing the sources.

| Variable                   | Default              | Description                                         |
| -------------------------- | -------------------- | --------------------------------------------------- |
| `--ngx-play-size`          | `48px`               | Button size (square)                                |
| `--ngx-play-icon-size`     | `55%`                | Size of the default SVG icon relative to the button |
| `--ngx-play-color`         | `#ffffff`            | Icon color                                          |
| `--ngx-play-bg`            | `rgba(0, 0, 0, 0.7)` | Button background                                   |
| `--ngx-play-hover-bg`      | `rgba(0, 0, 0, 0.9)` | Background on hover                                 |
| `--ngx-play-border-radius` | `50%`                | Border radius                                       |
| `--ngx-play-transition`    | `0.15s ease`         | Background and color transition                     |

`--ngx-play-icon-size` only affects the default SVG icon. The component does not
scale the content of `iconTemplate` — its size is up to your styles.

## Styling

Override on the component itself:

```scss
ngx-play-button {
  --ngx-play-size: 64px;
  --ngx-play-bg: #059669;
  --ngx-play-hover-bg: #047857;
  --ngx-play-border-radius: 12px;
}
```

Via `customClass` — the class is applied to the **host element** `<ngx-play-button>`:

```html
<ngx-play-button customClass="my-play" [state]="video.state()" (toggle)="video.toggle()" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-play {
  --ngx-play-size: 72px;
  --ngx-play-bg: #ffffff;
  --ngx-play-color: #111827;
  --ngx-play-hover-bg: #e5e7eb;
}
```

`customClass` does not affect classes set on the element manually:
`<ngx-play-button class="layout-wide" customClass="my-play">` keeps both.

## Custom icon

```html
<ngx-play-button [state]="video.state()" [iconTemplate]="myIcon" (toggle)="video.toggle()" />

<ng-template #myIcon let-playing="playing" let-state="state">
  <span class="my-icon">{{ playing ? '⏸' : '▶' }}</span>
</ng-template>
```

Context is passed to the template:

```ts
interface PlayButtonIconContext {
  readonly state: VideoState;
  readonly playing: boolean;
}
```

The custom template is rendered inside the button instead of the default SVG
icon; container size and colors are still set by CSS variables.

## Accessibility

- A native `<button type="button">` is rendered — Enter/Space, focus, and button
  semantics work without extra code.
- `aria-label` is computed from the state (`Play`/`Pause`) and overridden by the
  `ariaLabel` input.
- `aria-pressed` reflects whether playback is in progress.
- SVG icons are marked `aria-hidden="true"` and `focusable="false"` so they do
  not enter the accessibility tree.
- Visible `:focus-visible` outline.
- With `prefers-reduced-motion: reduce`, transitions are disabled.

## SSR

The component does not touch DOM APIs: the template contains only bindings and
SVG, so it renders safely on the server along with the rest of the player.

---

[Package README](../../../../README.md)
