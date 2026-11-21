# QualitySwitcherComponent

A video quality select built on a native `<select>`: it shows an "Auto" option and
the available levels, and on a user choice it emits the level `id` or `null` for
Auto. It does not apply quality to the video — the parent does that through the
`level` input of `HlsSourceDirective`/`DashSourceDirective`.

Selector: `ngx-quality-switcher`.

## Purpose and responsibilities

**Does:**

- shows "Auto" and `levels` in the given order in a native `<select>`;
- marks the selected level according to the `level` input;
- reports the selection via `levelChange`: `null` for Auto, otherwise the level
  `id`;
- supports `customClass`, `ariaLabel`, and the `--ngx-quality-*` CSS variables.

**Does not:**

- parse HLS/DASH manifests or load them via `fetch`/`HttpClient`;
- keep state or remember the selected value;
- know about `VideoService`, `HlsSourceDirective`, and `DashSourceDirective`;
- apply quality or call media APIs;
- sort, deduplicate, or filter `levels`;
- add to the list a level that is absent from the `levels` input;
- mutate the passed `levels` and `level`;
- translate labels or manage i18n.

The component only reports the selection. Applying quality is the parent's
responsibility: it passes the received `id` to the `level` input of the source
directive.

## Import

```ts
import { QualitySwitcherComponent } from '@erst_dev/ngx-video-sources';
```

## Usage with HLS

```html
<video ngxVideo [ngxHlsSource]="src" [level]="level()" (levelsChange)="onLevelsChange($event)" (levelChange)="onLevelChange($event)" playsinline></video>

<ngx-quality-switcher [levels]="levels()" [level]="level()" (levelChange)="level.set($event)" />
```

```ts
import { Component, signal } from '@angular/core';
import type { QualityInterface } from '@erst_dev/ngx-video-core';
import { VideoDirective } from '@erst_dev/ngx-video-core';
import { HlsSourceDirective, QualitySwitcherComponent } from '@erst_dev/ngx-video-sources';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, HlsSourceDirective, QualitySwitcherComponent],
  templateUrl: './player.component.html',
})
export class PlayerComponent {
  readonly src = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  /** Levels from the directive's `levelsChange`. */
  readonly levels = signal<readonly QualityInterface[]>([]);

  /** `id` for the component and the directive's `level` input; `null` — Auto. */
  readonly level = signal<string | null>(null);

  /** Actual level from the directive's `levelChange` — for the label. */
  readonly currentLevel = signal<QualityInterface | null>(null);

  protected onLevelsChange(levels: readonly QualityInterface[]): void {
    this.levels.set(levels);

    // The selected level disappeared from the new list — fall back to Auto.
    if (this.level() !== null && !levels.some((item) => item.id === this.level())) {
      this.level.set(null);
    }
  }

  protected onLevelChange(level: QualityInterface | null): void {
    this.currentLevel.set(level);
  }
}
```

Note two different contracts:

- `QualitySwitcherComponent.levelChange` — `string | null`, the selected `id`;
- `HlsSourceDirective.levelChange` (and DASH) — `QualityInterface | null`, the
  actually selected level.

So it is convenient to keep two signals in the parent: `level` (`string | null`)
for the component and the directive input, and `currentLevel`
(`QualityInterface | null`) for the label.

## Usage with DASH

The component contract is the same for both sources — only the directive changes:

```html
<video ngxVideo [ngxDashSource]="dashSrc" [level]="level()" (levelsChange)="onLevelsChange($event)" (levelChange)="onLevelChange($event)" playsinline></video>

<ngx-quality-switcher [levels]="levels()" [level]="level()" (levelChange)="level.set($event)" />
```

## Inputs

| Input         | Type                          | Default           | Description                                       |
| ------------- | ----------------------------- | ----------------- | ------------------------------------------------- |
| `levels`      | `readonly QualityInterface[]` | `[]`              | Available levels without "auto", in display order |
| `level`       | `string \| null`              | `null`            | Selected level `id`; `null` — Auto                |
| `customClass` | `string`                      | `''`              | Extra CSS class for the host element              |
| `ariaLabel`   | `string`                      | `'Video quality'` | Accessible name of the native `<select>`          |

## Outputs

| Output        | Type             | Description                        |
| ------------- | ---------------- | ---------------------------------- |
| `levelChange` | `string \| null` | Selected level `id`; `null` — Auto |

The output emits a **string**, not a `QualityInterface`. The full level object comes
from the `levelChange` of the source directive.

## Behavior

- The select always has a first `Auto` option with the value `''`, then `levels` in
  the same order. Option labels are the level `label`.
- `selected` is computed from `level`: if the `id` is among `levels`, it is marked,
  otherwise Auto. Inputs are not mutated.
- If `level` is an unknown `id`, the component shows Auto and emits nothing until
  the user acts: quality cannot be "invented".
- An empty `levels` does not remove the select from the DOM: only the `Auto` option
  remains.
- No sorting, deduplication, filtering, or adding of a missing level: the list is
  shown exactly as it arrived.
- The event is emitted only on the user's native `change`. Changing inputs
  (`levels`, `level`) does not trigger outputs.
- On `change`, the value `''` becomes `null`, and any other value becomes the `id`
  as a string.
- `level` and `levels` are inputs, so the displayed value is always determined by
  the parent. If the parent does not apply the emitted `id`, the select remains
  controlled by the input signal.

## CSS variables

All values are set in `:host`, so the component works out of the box and can be
overridden without editing the sources.

| Variable                      | Default                    | Description                      |
| ----------------------------- | -------------------------- | -------------------------------- |
| `--ngx-quality-bg`            | `rgba(0, 0, 0, 0.6)`       | Select background                |
| `--ngx-quality-color`         | `#ffffff`                  | Text color and hover border      |
| `--ngx-quality-border-color`  | `rgba(255, 255, 255, 0.3)` | Border color at rest             |
| `--ngx-quality-border-radius` | `0.375rem`                 | Select corner radius             |
| `--ngx-quality-padding`       | `0.25rem 0.5rem`           | Select inner padding             |
| `--ngx-quality-font-size`     | `0.8125rem`                | Font size                        |
| `--ngx-quality-focus-color`   | `#60a5fa`                  | Outline color on keyboard focus  |
| `--ngx-quality-transition`    | `0.15s ease`               | Border and background transition |

## Styling

Override on the component itself:

```scss
ngx-quality-switcher {
  --ngx-quality-bg: #111827;
  --ngx-quality-border-radius: 999px;
  --ngx-quality-focus-color: #34d399;
}
```

Via `customClass` — the class is added to the **host element**
`<ngx-quality-switcher>`:

```html
<ngx-quality-switcher customClass="my-quality" [levels]="levels()" [level]="level()" (levelChange)="level.set($event)" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-quality {
  --ngx-quality-bg: #064e3b;
  --ngx-quality-color: #d1fae5;
  --ngx-quality-border-color: #059669;
  --ngx-quality-border-radius: 999px;
  --ngx-quality-padding: 0.375rem 0.75rem;
  --ngx-quality-font-size: 0.875rem;
  --ngx-quality-focus-color: #34d399;
}
```

`customClass` does not affect classes set on the element manually:
`<ngx-quality-switcher class="layout-wide" customClass="my-quality">` keeps both
classes. The component's internals are just a native `<select>`; there is no
`ng-template`, and customization goes through CSS variables and `customClass`.

## Accessibility

- A native `<select>` is used: keyboard, type-ahead by first letter, focus, and
  semantics work without extra code and without `FormsModule`.
- The select always has an `aria-label` from the `ariaLabel` input (by default
  "Video quality") — the label is not lost when there is no visual `<label>` nearby.
- The component adds no visible label of its own, no `role`, and no `aria-live`.
- A visible `:focus-visible` outline with the configurable
  `--ngx-quality-focus-color` color.
- With `prefers-reduced-motion: reduce`, the border and background transition is
  disabled.
- The select always has a selected option: if `level` is unknown or `levels` is
  empty, Auto is marked.

## SSR

The component does not use `window`, `document`, or media APIs. The only DOM access
is synchronizing host classes via `ElementRef` in `effect()`; on the server Angular
provides the element just as in the browser. The `<select>` markup renders safely on
the server; the `change` event occurs only in the browser. Manifests are neither
loaded nor parsed, on the server or in the browser.

---

[Package README](../../../../README.md)
