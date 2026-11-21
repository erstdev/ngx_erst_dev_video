# @erst_dev/ngx-video-controls

Ready-made controls for the `ngx-video` player. Each component is a self-contained
building block: state comes in through inputs, actions go out through outputs, and
appearance is customized with CSS variables, `customClass`, and `ng-template`.

The package **does not control** the media element and **knows nothing** about
`VideoService`: the parent component does the wiring. That is why the same control
works both with `core` and with any custom state.

## Building blocks

Detailed documentation for each building block lives next to its component. npm
shows only the package README, so the links point to GitHub.

| Component                     | Selector                  | What it solves                                                | Documentation                                                                                                                          |
| ----------------------------- | ------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `PlayButtonComponent`         | `ngx-play-button`         | Play/Pause button, state icon, `toggle` output                | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/controls/src/lib/components/play-button/README.md)         |
| `VolumeSliderComponent`       | `ngx-volume-slider`       | Volume slider `0…1`, `volumeChange` output                    | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/controls/src/lib/components/volume-slider/README.md)       |
| `TimeDisplayComponent`        | `ngx-time-display`        | Current time and duration via `formatTime`                    | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/controls/src/lib/components/time-display/README.md)        |
| `FullscreenButtonComponent`   | `ngx-fullscreen-button`   | Fullscreen enter/exit button, `toggle` output                 | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/controls/src/lib/components/fullscreen-button/README.md)   |
| `BufferingIndicatorComponent` | `ngx-buffering-indicator` | Spinner for the `buffering` state, delay, and custom template | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/controls/src/lib/components/buffering-indicator/README.md) |

## Requirements

- Angular 22+
- `@erst_dev/ngx-video-core` (peer dependency)

The package is not yet published to npm (working version `0.0.1`). Inside the
monorepo it is wired up through `paths` in `tsconfig.base.json`.

## Installation

```sh
npm install @erst_dev/ngx-video-controls
```

## Quick start

```typescript
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { PlayButtonComponent } from '@erst_dev/ngx-video-controls';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, PlayButtonComponent],
  template: `
    <video ngxVideo [src]="src"></video>
    <ngx-play-button [state]="video.state()" (toggle)="video.toggle()" />
  `,
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';
}
```

The button only displays state and reports a click. What exactly to do is up to the
parent: in the example above it calls `video.toggle()`.

## Styling: how it works

Components have two customization points, and they complement each other:

- **CSS variables on the element** — a shared theme for all instances:
  `ngx-play-button { --ngx-play-size: 64px; }`.
- **`customClass`** — targeted styling of a specific instance and its host
  element: layout, border, padding, specificity boost.

If the same variable is set in both places, the more specific selector wins:
`.my-button` overrides `ngx-play-button`, while the other variables from the
element keep applying. This is normal CSS cascade, there is no conflict.
`border`/`padding` from `customClass` apply to the host, not to the component's
internal markup.

Detailed tables of variables and examples are in each building block's README.

## Full player

You can assemble a player from ready-made controls. A live example is the
`/controls/player` page in the demo app; its sources:
[player-demo.ts](https://github.com/erstdev/ngx_erst_dev_video/blob/master/apps/demo/src/app/demos/controls/player/player-demo.ts).

Each player needs its own `VideoService` instance — add
`providers: [VideoService]` to the player component.

```html
<div #player class="player" [class.player--show-controls]="!video.isPlaying()">
  <video class="player__video" ngxVideo [src]="src" preload="metadata" playsinline (click)="video.toggle()"></video>

  @if (showCenterPlay()) {
  <ngx-play-button customClass="player__center-play" [state]="video.state()" (toggle)="video.toggle()" />
  }

  <div class="player__buffering">
    <ngx-buffering-indicator [state]="video.state()" [delay]="200" />
  </div>

  <div class="player__bar">
    <ngx-play-button customClass="player__control" [state]="video.state()" (toggle)="video.toggle()" />

    <button type="button" class="player__mute" [attr.aria-label]="muteLabel()" [attr.aria-pressed]="video.muted()" (click)="video.toggleMute()">
      <!-- mute / volume icon -->
    </button>

    <ngx-volume-slider customClass="player__volume" [volume]="video.volume()" (volumeChange)="video.setVolume($event)" />

    <ngx-time-display customClass="player__time" [currentTime]="video.time()" [duration]="video.duration()" />

    <span class="player__spacer"></span>

    <ngx-fullscreen-button customClass="player__control" [fullscreen]="isFullscreen()" (toggle)="toggleFullscreen()" />
  </div>
</div>
```

```typescript
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { BufferingIndicatorComponent, FullscreenButtonComponent, PlayButtonComponent, TimeDisplayComponent, VolumeSliderComponent } from '@erst_dev/ngx-video-controls';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, PlayButtonComponent, VolumeSliderComponent, TimeDisplayComponent, FullscreenButtonComponent, BufferingIndicatorComponent],
  providers: [VideoService],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  readonly video = inject(VideoService);

  private readonly player = viewChild.required<ElementRef<HTMLElement>>('player');

  readonly isFullscreen = signal(false);

  readonly showCenterPlay = computed(() => {
    const state = this.video.state();
    return state === 'idle' || state === 'paused' || state === 'ended' || state === 'error';
  });

  readonly muteLabel = computed(() => (this.video.muted() ? 'Unmute' : 'Mute'));

  constructor() {
    fromEvent(document, 'fullscreenchange')
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.syncFullscreen());
  }

  async toggleFullscreen(): Promise<void> {
    const element = this.player().nativeElement;

    try {
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
      } else {
        await element.requestFullscreen();
      }
    } catch {
      // The browser may refuse — the state stays unchanged.
    }
  }

  private syncFullscreen(): void {
    this.isFullscreen.set(document.fullscreenElement === this.player().nativeElement);
  }
}
```

```scss
.player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 0.75rem;
  background: #000;
}

.player__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.player__center-play {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  transform: translate(-50%, -50%);
}

.player__buffering {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.player__bar {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 0.75rem 0.75rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.player:hover .player__bar,
.player:focus-within .player__bar,
.player--show-controls .player__bar {
  opacity: 1;
}

.player:fullscreen {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  aspect-ratio: auto;
}
```

Full styles, including the responsive bar and control sizes, are in the demo
player sources.

### Fullscreen on the container, not the video

`VideoService.toggleFullscreen()` requests fullscreen on the `<video>` itself.
In this mode the control bar sitting next to the video is not part of the
fullscreen element. To keep the controls available, request fullscreen on the
`.player` container:

- keep the state in a local signal of the demo player;
- sync it on `fullscreenchange` by comparing `document.fullscreenElement` with
  the container;
- pass the local signal to the button rather than `video.fullscreen()`.

The public `core` API does not change.

## Multiple players on a page

`VideoService` is `providedIn: 'root'` by default — that is enough for one
player. If there are several players, add `providers: [VideoService]` to each
player's component: the directive inside its template gets a local instance, and
the states do not mix.

## Utilities

The package exports pure functions that are used by the components and are
available to consumers.

### `clamp`

```typescript
clamp(value: number, min: number, max: number): number;
```

Clamps a number to the `min…max` range. Invalid values (`NaN`, `Infinity`) become
`min`, so that `NaN` never appears in styles, attributes, or calculations.

## Compatibility

Input names, output names, selectors, and CSS variables are part of the public
contract; breaking changes only in a major version. While the version is `0.x`,
the API may change in minor releases.

## License

MIT

---

Core documentation: [@erst_dev/ngx-video-core](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/core/README.md).
