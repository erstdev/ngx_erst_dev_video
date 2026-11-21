# BufferingIndicatorComponent

A loading indicator (spinner). It is shown when the passed state equals
`buffering`. The moment buffering starts is determined by `VideoService`, not by
the component: it only reflects the state.

Selector: `ngx-buffering-indicator`.

## Purpose and responsibilities

**Does:**

- shows the indicator only when `state === 'buffering'`;
- can delay its appearance via `delay` so short gaps do not flicker;
- provides `role="status"` and the hidden text "Loading…" for screen readers;
- allows replacing the visual spinner via `indicatorTemplate`.

**Does not:**

- decide when to turn buffering on and off;
- store player state;
- control playback.

## Import

```ts
import { BufferingIndicatorComponent } from '@erst_dev/ngx-video-controls';
```

## Usage

```html
<div class="player">
  <video ngxVideo [src]="src"></video>

  <ngx-buffering-indicator [state]="video.state()" />
</div>
```

```scss
.player {
  position: relative;
}

ngx-buffering-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

## Inputs

| Input               | Type                        | Default      | Description                                                           |
| ------------------- | --------------------------- | ------------ | --------------------------------------------------------------------- |
| `state`             | `VideoState`                | — (required) | Current player state; the indicator is visible only for `buffering`   |
| `delay`             | `number`                    | `0`          | Appearance delay in milliseconds; prevents flicker on short buffering |
| `customClass`       | `string`                    | `''`         | Extra CSS class for the host element `<ngx-buffering-indicator>`      |
| `indicatorTemplate` | `TemplateRef<void> \| null` | `null`       | Custom visual indicator instead of the default spinner                |

## Outputs

No outputs: the component only displays the passed state.

## Behavior

- The indicator renders only when `state === 'buffering'`; in other states
  nothing is in the DOM.
- `delay` postpones appearance: if buffering ends earlier, the spinner does not
  flash. Negative and invalid values are treated as zero.
- `indicatorTemplate` replaces only the visual part. The wrapper with
  `role="status"` and the hidden text "Loading…" stays with the component; the
  contents of the custom template are marked `aria-hidden="true"`.
- No context is passed into `indicatorTemplate`: the template renders only in
  the `buffering` state.

## CSS variables

| Variable                          | Default                     | Description                                      |
| --------------------------------- | --------------------------- | ------------------------------------------------ |
| `--ngx-buffering-size`            | `32px`                      | Spinner size                                     |
| `--ngx-buffering-thickness`       | `3px`                       | Ring thickness                                   |
| `--ngx-buffering-color`           | `#ffffff`                   | Color of the active part of the ring             |
| `--ngx-buffering-track-color`     | `rgba(255, 255, 255, 0.25)` | Ring track color                                 |
| `--ngx-buffering-speed`           | `0.8s`                      | Duration of one full turn (`animation-duration`) |
| `--ngx-buffering-easing`          | `linear`                    | Easing function (`animation-timing-function`)    |
| `--ngx-buffering-delay`           | `0s`                        | Start delay (`animation-delay`)                  |
| `--ngx-buffering-iteration-count` | `infinite`                  | Iteration count (`animation-iteration-count`)    |
| `--ngx-buffering-direction`       | `normal`                    | Direction (`animation-direction`)                |
| `--ngx-buffering-fill-mode`       | `none`                      | Fill mode (`animation-fill-mode`)                |
| `--ngx-buffering-play-state`      | `running`                   | `running` / `paused` (`animation-play-state`)    |

The set mirrors the CSS animation properties: speed, easing, direction,
iteration count, delay, and pause can be changed independently. For example,
`--ngx-buffering-direction: alternate` makes the spinner rotate first one way,
then the other.

`--ngx-buffering-easing` accepts any value of the CSS property
`animation-timing-function`: `linear`, `ease-in`, `ease-in-out`,
`cubic-bezier(...)`, etc.

The keyframes name is fixed (`ngx-buffering-spin`): Angular scopes the
component's `@keyframes`, so it cannot be replaced with a CSS variable. If you
need custom `@keyframes`, use `indicatorTemplate` — see below.

## Styling

Override on the component itself:

```scss
ngx-buffering-indicator {
  --ngx-buffering-size: 48px;
  --ngx-buffering-thickness: 4px;
  --ngx-buffering-color: #34d399;
  --ngx-buffering-track-color: rgba(52, 211, 153, 0.25);
  --ngx-buffering-speed: 0.6s;
  --ngx-buffering-easing: ease-in;
  --ngx-buffering-direction: alternate;
}
```

Via `customClass` — the class is applied to the **host element** `<ngx-buffering-indicator>`:

```html
<ngx-buffering-indicator customClass="my-buffering" [state]="video.state()" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-buffering {
  --ngx-buffering-size: 48px;
  --ngx-buffering-color: #34d399;
  --ngx-buffering-track-color: rgba(52, 211, 153, 0.25);
}
```

`customClass` does not affect classes set manually on the element:
`<ngx-buffering-indicator class="layout-wide" customClass="my-buffering">`
keeps both.

## Custom indicator and custom `@keyframes`

`indicatorTemplate` replaces the default spinner. The template's styles and
`@keyframes` are declared in the consumer component: Angular scopes them
together with the template, so the animation name can be written literally.

```html
<ngx-buffering-indicator [state]="video.state()" [indicatorTemplate]="myIndicator" />

<ng-template #myIndicator>
  <span class="my-indicator"></span>
</ng-template>
```

```scss
/* player.component.scss */
.my-indicator {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(#34d399 0 30%, rgba(52, 211, 153, 0.2) 0);
  animation: my-indicator-pulse 0.8s ease-in-out infinite alternate;
}

@keyframes my-indicator-pulse {
  from {
    transform: scale(0.7);
    opacity: 0.5;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

The default container size equals `--ngx-buffering-size`; the template contents
can fill it entirely (`width/height: 100%`).

## Accessibility

- The wrapper renders with `role="status"`: the indicator's appearance is
  announced by screen readers.
- The visible spinner (or custom template) is marked `aria-hidden="true"`, and
  the visually hidden text "Loading…" sits next to it.
- With `prefers-reduced-motion: reduce`, rotation of the default spinner is
  disabled — a static ring remains. The consumer is responsible for animating a
  custom template.

## SSR

The delay timer is created only in the browser (`isPlatformBrowser`); on the
server the indicator is rendered immediately based on state. The animation is
pure CSS, and the component does not use the DOM API.

---

[package README](../../../../README.md)
