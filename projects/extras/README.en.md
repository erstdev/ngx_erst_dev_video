# @erst_dev/ngx-video-extras

Additional building blocks for the `ngx-video` player: first-play overlay, error
handling, playback speed, keyboard, gestures, and subtitles. Each building block
is a standalone component or directive that does not control media and does not
know about `VideoService`: state comes in through inputs, actions go out through
outputs.

## Building blocks

Detailed documentation for each finished building block lives next to its
sources. On npm only the package README is shown, so the links point to GitHub.

| Building block                | Selector                    | Status   | What it solves                            | Documentation                                                                                                                          |
| ----------------------------- | --------------------------- | -------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `ClickToPlayOverlayComponent` | `ngx-click-to-play-overlay` | ✅ ready | Play button overlay to start on a gesture | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/extras/src/lib/components/click-to-play-overlay/README.md) |
| `ErrorDisplayComponent`       | `ngx-error-display`         | ✅ ready | Error message and a Retry button          | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/extras/src/lib/components/error-display/README.md)         |
| `SpeedControlComponent`       | `ngx-speed-control`         | ✅ ready | Playback speed selection                  | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/extras/src/lib/components/speed-control/README.md)         |
| `KeyboardShortcutsDirective`  | `ngxKeyboardShortcuts`      | ✅ ready | Keyboard control of the player            | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/extras/src/lib/directives/keyboard-shortcuts/README.md)    |
| `GestureDirective`            | `ngxGesture`                | ✅ ready | Swipes: seek, volume, brightness          | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/extras/src/lib/directives/gesture/README.md)               |
| `SubtitleRendererComponent`   | `ngx-subtitle-renderer`     | ✅ ready | WebVTT subtitle rendering                 | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/extras/src/lib/components/subtitle-renderer/README.md)     |

## Requirements

- Angular 22+
- `@erst_dev/ngx-video-core` (peer dependency)

The package is not yet published to npm (working version `0.0.1`). Inside the
monorepo it is wired up through `paths` in `tsconfig.base.json`.

## Installation

```sh
npm install @erst_dev/ngx-video-extras
```

## Quick start

```typescript
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { ClickToPlayOverlayComponent } from '@erst_dev/ngx-video-extras';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, ClickToPlayOverlayComponent],
  template: `
    <div class="player">
      <video ngxVideo [src]="src" playsinline (click)="video.pause()"></video>

      <ngx-click-to-play-overlay [state]="video.state()" (play)="video.play()" />
    </div>
  `,
  styles: `
    .player {
      position: relative;
      background: #000;
    }
  `,
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';
}
```

The overlay exists in the DOM only in the `idle` and `paused` states. A click on
it emits `play`, and the parent starts playback.

## Styling

The building blocks expose CSS variables with defaults in `:host` and a
`customClass` input that is applied to the host element. This makes it possible
to override the look with regular scoped component styles — no `::ng-deep`.

```scss
ngx-click-to-play-overlay {
  --ngx-overlay-size: 96px;
  --ngx-overlay-bg: #059669;
  --ngx-overlay-hover-bg: #047857;
}
```

```html
<ngx-click-to-play-overlay customClass="my-overlay" [state]="video.state()" (play)="video.play()" />
```

See the building block README for the full variables table.

## Compatibility

Selectors, inputs, outputs, and CSS variables are the public contract. While the
version is `0.x`, the API may change in minor releases; breaking changes only in
a major version.

## License

MIT

---

Core documentation: [@erst_dev/ngx-video-core](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/core/README.md).
