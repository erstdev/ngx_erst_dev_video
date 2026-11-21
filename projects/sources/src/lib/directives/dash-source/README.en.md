# DashSourceDirective

Connecting a DASH manifest to `<video>` via `dash.js`. The directive delivers the
stream into the media element and exposes quality levels, but does not manage the
interface and does not replace `VideoService`.

Selector: `[ngxDashSource]`.

## Purpose and responsibilities

**Does:**

- loads the DASH manifest from the URL in the `ngxDashSource` input;
- in the browser, dynamically imports `dashjs`, creates a player, initializes it
  on `<video>` with `autoplay = false`, and loads the manifest;
- after `STREAM_INITIALIZED`, maps video representations to `QualityInterface[]`
  and emits `levelsChange`;
- applies the `level` input (level `id`, `null` — automatic ABR selection);
- emits `levelChange` with the actually rendered level on
  `QUALITY_CHANGE_RENDERED`;
- with `autoplay`, calls `video.play()` and converts a browser refusal into
  `playback-blocked`;
- converts terminal dash.js errors, an unsupported browser, and blocked autoplay
  into `VideoError` with a code from `core`;
- fully recreates the source when `ngxDashSource` changes and clears it when
  `enabled = false`;
- releases resources when the directive is destroyed.

**Does not:**

- draw the interface: the quality select, buttons, and error messages are the
  consumer's job;
- call `VideoService.play()`, `pause()`, `seek()`, and other commands; video
  state is managed by the service;
- load the manifest via `fetch`/`HttpClient` — `dash.js` does that;
- recover from terminal errors automatically;
- support HLS (that is `HlsSourceDirective`), or contain CSS variables,
  `customClass`, and `ng-template`;
- manage native `controls`, focus, and ARIA;
- touch the DOM on the server;
- do a native fallback: browsers have no native DASH.

## Import

```ts
import { DashSourceDirective } from '@erst_dev/ngx-video-sources';
```

## Installation of `dashjs`

`dashjs` is a peer dependency of the package and does not end up in the build:

```sh
npm install dashjs
```

The version is the current `5.x` (`^5.3.0`). The library is imported dynamically
only in the browser, so it does not end up in the server bundle or in the demo's
initial chunk.

## Usage

```html
<video ngxVideo [ngxDashSource]="src" [autoplay]="false" [enabled]="true" [level]="level()" [attr.playsinline]="true" (levelsChange)="onLevelsChange($event)" (levelChange)="onLevelChange($event)" (error)="onError($event)"></video>
```

```ts
import { Component, inject, signal } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import type { QualityInterface, VideoError } from '@erst_dev/ngx-video-core';
import { DashSourceDirective } from '@erst_dev/ngx-video-sources';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, DashSourceDirective],
  providers: [VideoService],
  templateUrl: './player.component.html',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd';
  readonly level = signal<string | null>(null);

  protected onLevelsChange(levels: readonly QualityInterface[]): void {
    // For example, render a quality <select>.
  }

  protected onLevelChange(level: QualityInterface | null): void {
    // null — automatic selection.
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

`ngxVideo` is not required: the directive works with any `<video>`. But only
`VideoService` exposes the player state (time, pause, volume), so in a real player
they are usually used together.

Do not set `src` on this `<video>` at the same time: the directive manages the
source, and its `removeAttribute('src')` will conflict with the binding.

## Inputs

| Input           | Type             | Default | Description                                                          |
| --------------- | ---------------- | ------- | -------------------------------------------------------------------- |
| `ngxDashSource` | `string \| null` | `null`  | DASH manifest URL; `null` and an empty string unload the stream      |
| `autoplay`      | `boolean`        | `false` | Start playback after `STREAM_INITIALIZED`                            |
| `enabled`       | `boolean`        | `true`  | `false` destroys the player, removes `src`, and calls `video.load()` |
| `level`         | `string \| null` | `null`  | Level `id` from `QualityInterface`; `null` — automatic selection     |

The URL is a string, not an object: `dash.js` configuration is not part of this
building block. Leading and trailing spaces are trimmed, and a string of only
spaces is treated as empty.

## Outputs

| Output         | Type                          | When it is emitted                                            |
| -------------- | ----------------------------- | ------------------------------------------------------------- |
| `levelsChange` | `readonly QualityInterface[]` | After `STREAM_INITIALIZED`; no "auto"                         |
| `levelChange`  | `QualityInterface \| null`    | On `QUALITY_CHANGE_RENDERED`; `null` — automatic selection    |
| `error`        | `VideoError`                  | Terminal dash.js error, unsupported browser, autoplay refusal |

When the source changes and when `enabled = false`, the levels are reset:
`levelsChange` receives an empty array, and `levelChange` — `null` (if there were
levels). Nothing is emitted when the directive is destroyed.

`levelChange` arrives on `QUALITY_CHANGE_RENDERED`, that is, it reports the
already rendered level. On a manual switch, dash.js first finishes playing the
buffered segments, so the actual level may lag behind the one selected in the
interface. This is dash.js behavior, not directive latency.

## MSE only

Initialization order:

1. If the browser has no `MediaSource`, `dashjs` is not even loaded: `error` is
   emitted with the code `source-not-supported`.
2. Otherwise `dashjs` is imported dynamically. If
   `dashjs.supportsMediaSource()` returns `false` — the same error code.
3. After that a player is created and
   `player.initialize(video, url, false)` is called: `autoplay` in dash.js is
   turned off, because only the directive controls playback start.

No native fallback is done for DASH: browsers cannot handle DASH natively. Unlike
`HlsSourceDirective`, there is no "set `video.src`" branch here.

## dash.js 5 API

In `dashjs` 5.x, the old methods `getBitrateInfoListFor()`, `setQualityFor()`,
`getQualityFor()`, and `setAutoSwitchQualityFor()` have been removed. The building
block uses the current API:

| Task                  | dash.js method                                                                    |
| --------------------- | --------------------------------------------------------------------------------- |
| Level list            | `getRepresentationsByType('video')`                                               |
| Manual level choice   | `setRepresentationForTypeByIndex('video', qualityIndex)`                          |
| Automatic choice      | `updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: true } } } })`  |
| Manual mode (ABR off) | `updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: false } } } })` |
| Actual level          | `QUALITY_CHANGE_RENDERED` event, `newRepresentation` field                        |

The order matters for manual selection: first ABR is turned off, then
`setRepresentationForTypeByIndex()` is called, otherwise ABR will override the
choice on the next segment.

## Level mapping

Levels are mapped from `getRepresentationsByType('video')` after
`STREAM_INITIALIZED`:

| Field     | Value                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| `id`      | representation `id`, otherwise `<height>p`, otherwise `level-<index>`; on a collision `-<index>` is appended |
| `label`   | `<height>p`, otherwise the representation `id`, otherwise `Level N`                                          |
| `width`   | Frame width, if known                                                                                        |
| `height`  | Frame height, if known                                                                                       |
| `bitrate` | `bandwidth` in bits per second, otherwise `bitrateInKbit * 1000`                                             |

There is no "auto" level in the list: automatic selection is `null` in the `level`
input and in the `levelChange` output.

Inside the directive, levels are stored as view models
`{ quality, qualityIndex, representationId }` rather than parallel arrays.
`qualityIndex` is the position in the `getRepresentationsByType('video')` list,
which `setRepresentationForTypeByIndex()` accepts; `representationId` is the
original representation `id`, used to match the `QUALITY_CHANGE_RENDERED` event to
a level.

The `level` input finds the level by its public `id`, turns ABR off, and sets
`qualityIndex`; `null` turns ABR on; an unknown `id` is ignored.

## Error mapping

Terminal dash.js errors are converted to `VideoError` by the numeric `error.code`:

| dash.js codes                                                        | `code`                 |
| -------------------------------------------------------------------- | ---------------------- |
| 11, 12, 15–19, 25–29 — loading, timeouts, fragments, sync            | `network`              |
| 10, 23, 24, 31, 32, 34, 35 — manifest parsing, MSE/EME, SourceBuffer | `source-not-supported` |
| 20, 21, 22 — SourceBuffer append/remove, data update                 | `decode`               |
| Everything else (DRM, offline, MSS)                                  | `unknown`              |

`cause` is the original dash.js data, unchanged. A subtitle parsing error (code 33)
is ignored: video keeps playing. No automatic `recover` is performed: the consumer
decides whether to retry.

Separately, without the `ERROR` event, the following are emitted:

- `source-not-supported` — no `MediaSource`, `dashjs.supportsMediaSource()`
  returned `false`, or the `dashjs` module itself failed to load;
- `playback-blocked` — the browser blocked `video.play()` after `autoplay`
  (`NotAllowedError`), or dash.js emitted `PLAYBACK_NOT_ALLOWED`;
- `unknown` — another `video.play()` refusal or a player initialization error.

`PLAYBACK_NOT_ALLOWED` and a `video.play()` refusal are not duplicated: the
directive emits `playback-blocked` once per source.

### Collision with the native `error` event

`<video>` has a DOM `error` event, and Angular subscribes `(error)` both to the
directive output and to that event. So the handler receives either a `VideoError`
(it has `code` and `message`) or a native `Event` (no fields). Native media errors
are already handled by `VideoService` via `VideoService.error`, so in the handler it
is enough to filter out values without `code`:

```ts
protected onError(error: VideoError | Event): void {
  if (!('code' in error) || typeof error.code !== 'string') {
    return;
  }

  this.error.set(error);
}
```

This is a limitation of the output's name, not of the directive's behavior: in MSE
mode `<video>` is managed by dash.js, but native `error` events are still possible
when the source is cleared and on media errors.

## Cleanup and source changes

- Changing `ngxDashSource` fully recreates the source: listeners are removed from
  the old player, `reset()` and `destroy()` are called, `src` is removed, and then
  the new manifest is loaded.
- `enabled = false` stops the stream: removing listeners, `player.reset()`,
  `player.destroy()`, `removeAttribute('src')`, and `video.load()`. Re-enabling
  initializes the source again.
- Rapid changes of the URL and `enabled` are guarded by a generation token:
  results of stale asynchronous steps are discarded, and after the directive is
  destroyed there are neither emissions nor DOM access.
- Cleanup runs in `DestroyRef`: `player.destroy()`, removing listeners, nulling
  references. Angular itself removes the `<video>` from the DOM.

## SSR

The directive does not use `window`, `document`, or `dashjs` at module top level. On
the server, effects do not touch the DOM and do not start manifest loading; the
dynamic import of `dashjs` runs only in the browser after the `isPlatformBrowser`
check. Levels, errors, and `autoplay` are not emitted on the server.

## Accessibility

The directive does not manage the interface, focus, or ARIA: `<video>` and quality
controls remain the consumer's responsibility. The quality select should have a
label (`label` or `aria-label`), and the error message should have `role="alert"` if
it appears dynamically.

---

[Package README](../../../../README.md)
