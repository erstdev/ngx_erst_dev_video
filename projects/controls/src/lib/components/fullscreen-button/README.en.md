# FullscreenButtonComponent

A button for entering and exiting fullscreen mode. It shows an icon and a label
based on the `fullscreen` input and reports clicks to the outside.

Selector: `ngx-fullscreen-button`.

## Purpose and responsibilities

**Does:**

- chooses the icon, label, and `aria-pressed` based on the `fullscreen` input;
- handles clicks and emits the `toggle` output;
- supports `customClass` and a custom icon via `iconTemplate`.

**Does not:**

- call the Fullscreen API: the parent performs the request, for example
  `video.toggleFullscreen()` or `container.requestFullscreen()`;
- store fullscreen state;
- decide which element to request fullscreen on.

## Import

```ts
import { FullscreenButtonComponent } from '@erst_dev/ngx-video-controls';
```

## Usage

```html
<video ngxVideo [src]="src"></video>

<ngx-fullscreen-button [fullscreen]="video.fullscreen()" (toggle)="video.toggleFullscreen()" />
```

If the control panel should remain visible in fullscreen mode, request
fullscreen on the player container rather than on `<video>`. See the
[package README](../../../../README.md#full-player) for an example with a local
signal and `fullscreenchange`.

## Inputs

| Input          | Type                                               | Default      | Description                                                          |
| -------------- | -------------------------------------------------- | ------------ | -------------------------------------------------------------------- |
| `fullscreen`   | `boolean`                                          | — (required) | Whether fullscreen mode is enabled: determines the icon and label    |
| `customClass`  | `string`                                           | `''`         | Extra CSS class for the host element `<ngx-fullscreen-button>`       |
| `ariaLabel`    | `string \| null`                                   | `null`       | Overrides `aria-label`; defaults to "Fullscreen" / "Exit fullscreen" |
| `iconTemplate` | `TemplateRef<FullscreenButtonIconContext> \| null` | `null`       | Custom icon instead of the default one                               |

## Outputs

| Output   | Type   | Description                                                                                                           |
| -------- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| `toggle` | `void` | Click on the button. May match the name of the native DOM `toggle` event — this is safe because the element is custom |

## Behavior by state

| `fullscreen` | Icon     | `aria-pressed` | Default `aria-label` |
| ------------ | -------- | -------------- | -------------------- |
| `false`      | expand   | `false`        | Fullscreen           |
| `true`       | collapse | `true`         | Exit fullscreen      |

## CSS variables

All values are set in `:host`, so the control works out of the box and can be
overridden without editing the source.

| Variable                         | Default              | Description                                  |
| -------------------------------- | -------------------- | -------------------------------------------- |
| `--ngx-fullscreen-size`          | `48px`               | Button size (square)                         |
| `--ngx-fullscreen-icon-size`     | `55%`                | Default SVG icon size relative to the button |
| `--ngx-fullscreen-color`         | `#ffffff`            | Icon color                                   |
| `--ngx-fullscreen-bg`            | `rgba(0, 0, 0, 0.7)` | Button background                            |
| `--ngx-fullscreen-hover-bg`      | `rgba(0, 0, 0, 0.9)` | Hover background                             |
| `--ngx-fullscreen-border-radius` | `50%`                | Border radius                                |
| `--ngx-fullscreen-transition`    | `0.15s ease`         | Background and color transition              |

`--ngx-fullscreen-icon-size` applies only to the default SVG icon. The component
does not scale the contents of `iconTemplate` — its size is set by your styles.

## Styling

Override on the component itself:

```scss
ngx-fullscreen-button {
  --ngx-fullscreen-size: 40px;
  --ngx-fullscreen-bg: transparent;
  --ngx-fullscreen-hover-bg: rgba(255, 255, 255, 0.15);
  --ngx-fullscreen-border-radius: 8px;
}
```

Via `customClass` — the class is applied to the **host element** `<ngx-fullscreen-button>`:

```html
<ngx-fullscreen-button customClass="my-fullscreen" [fullscreen]="video.fullscreen()" (toggle)="video.toggleFullscreen()" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-fullscreen {
  --ngx-fullscreen-size: 40px;
  --ngx-fullscreen-color: #34d399;
  --ngx-fullscreen-bg: #1f2937;
  --ngx-fullscreen-hover-bg: #374151;
  --ngx-fullscreen-border-radius: 8px;
}
```

`customClass` does not affect classes set manually on the element:
`<ngx-fullscreen-button class="layout-wide" customClass="my-fullscreen">`
keeps both.

## Custom icon

```html
<ngx-fullscreen-button [fullscreen]="video.fullscreen()" [iconTemplate]="myIcon" (toggle)="video.toggleFullscreen()" />

<ng-template #myIcon let-fullscreen="fullscreen">
  <span class="my-icon">{{ fullscreen ? '⤡' : '⤢' }}</span>
</ng-template>
```

The template receives the following context:

```ts
interface FullscreenButtonIconContext {
  readonly fullscreen: boolean;
}
```

The custom template is rendered inside the button instead of the default SVG
icon; the container size and colors are still set by CSS variables.

## Accessibility

- Renders a native `<button type="button">` — Enter/Space, focus, and button
  semantics work without extra code.
- `aria-label` changes with state and is overridden by the `ariaLabel` input.
- `aria-pressed` reflects whether fullscreen mode is enabled.
- SVG icons are marked `aria-hidden="true"` and `focusable="false"` so they do
  not enter the accessibility tree.
- A visible `:focus-visible` outline.
- With `prefers-reduced-motion: reduce`, transitions are disabled.

## SSR

The component does not access the DOM API or the Fullscreen API: the template
contains only bindings and SVG, so it renders safely on the server along with
the rest of the player.

---

[package README](../../../../README.md)
