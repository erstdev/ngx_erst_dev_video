# @erst_dev/ngx-video-sources

Streaming video sources for the `ngx-video` player: an HLS manifest in `<video>`
through `hls.js` or native HLS, and a DASH manifest through `dash.js`. The
directives do not manage the interface and do not replace `VideoService`: they
deliver the stream and report quality levels and errors, while the player state
stays with the service.

## Building blocks

Detailed documentation for each finished building block lives next to its
sources. On the site it opens in the `/docs` section.

| Building block             | Selector               | Status   | What it solves                          | Documentation                                           |
| -------------------------- | ---------------------- | -------- | --------------------------------------- | ------------------------------------------------------- |
| `HlsSourceDirective`       | `ngxHlsSource`         | ✅ ready | HLS stream through hls.js or native HLS | [README](src/lib/directives/hls-source/README.md)       |
| `DashSourceDirective`      | `ngxDashSource`        | ✅ ready | DASH stream through dash.js (MSE only)  | [README](src/lib/directives/dash-source/README.md)      |
| `QualitySwitcherComponent` | `ngx-quality-switcher` | ✅ ready | Video quality selection                 | [README](src/lib/components/quality-switcher/README.md) |

The `sources` package is complete: the directives deliver the stream and report
levels, the component selects the quality, and applying the choice stays with the
parent.

## Requirements

- Angular 22+
- `@erst_dev/ngx-video-core` (peer dependency)
- `hls.js` 1.x (peer dependency; needed only for `HlsSourceDirective`)
- `dashjs` 5.x (peer dependency; needed only for `DashSourceDirective`)

The package is not yet published to npm (version `1.0.0` is in preparation). Inside the
monorepo it is wired up through `paths` in `tsconfig.base.json`.

## Installation

```sh
npm install @erst_dev/ngx-video-sources hls.js dashjs
```

## Quick start

```typescript
import { Component, signal } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import type { QualityInterface, VideoError } from '@erst_dev/ngx-video-core';
import { HlsSourceDirective } from '@erst_dev/ngx-video-sources';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, HlsSourceDirective],
  providers: [VideoService],
  template: ` <video ngxVideo [ngxHlsSource]="src" [level]="level()" (levelsChange)="onLevelsChange($event)" (error)="onError($event)" playsinline></video> `,
})
export class PlayerComponent {
  readonly src = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  readonly level = signal<string | null>(null);

  protected onLevelsChange(levels: readonly QualityInterface[]): void {
    // Render the quality select: value is level.id, "Auto" is an empty value.
  }

  protected onError(error: VideoError | Event): void {
    // `(error)` on <video> also catches the native event: VideoError has code.
    if (!('code' in error) || typeof error.code !== 'string') {
      return;
    }

    // error.code is the machine contract, error.message is ready-made text.
  }
}
```

With MSE available in the browser, `hls.js` drives the stream — that is how
quality levels become available. Without MSE (iOS Safari) or when
`Hls.isSupported() === false`, the library is not loaded: the URL is set on
`video.src`, and quality levels are unavailable.

DASH uses `DashSourceDirective` (`[ngxDashSource]`) and `dashjs`: the manifest is
loaded through MSE only, there is no native fallback. Levels, the `level` input
and errors work the same way as with HLS:

```html
<video ngxVideo [ngxDashSource]="dashSrc" [level]="level()" (levelsChange)="onLevelsChange($event)" (levelChange)="onLevelChange($event)" playsinline></video>
```

## Quality selection

`QualitySwitcherComponent` is a presentational select on a native `<select>`: it
shows "Auto" and the levels from `levels`, and on selection it emits the level
`id` or `null` for Auto. It does not parse manifests, does not keep state and
does not apply the quality.

```html
<video ngxVideo [ngxHlsSource]="src" [level]="level()" (levelsChange)="onLevelsChange($event)" (levelChange)="onLevelChange($event)" playsinline></video>

<ngx-quality-switcher [levels]="levels()" [level]="level()" (levelChange)="level.set($event)" />
```

```typescript
readonly levels = signal<readonly QualityInterface[]>([]);
readonly level = signal<string | null>(null);
readonly currentLevel = signal<QualityInterface | null>(null);

protected onLevelsChange(levels: readonly QualityInterface[]): void {
  this.levels.set(levels);

  if (this.level() !== null && !levels.some((item) => item.id === this.level())) {
    this.level.set(null);
  }
}

protected onLevelChange(level: QualityInterface | null): void {
  // The directive's `levelChange` emits QualityInterface | null,
  // while the component's `levelChange` is string | null: different contracts.
  this.currentLevel.set(level);
}
```

Full documentation is in the
[building block README](src/lib/components/quality-switcher/README.md).

## Compatibility

Selectors, inputs, outputs and the `QualityInterface` format are the public
contract. While the version is `0.x`, the API may change in minor releases;
breaking changes only in a major version. The package does not change the public
API of `core`.

## License

MIT

---

Core documentation: [@erst_dev/ngx-video-core](../core/README.md).
