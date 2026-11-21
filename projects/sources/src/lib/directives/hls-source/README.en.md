# HlsSourceDirective

Attaching an HLS manifest to `<video>`: `hls.js` through a dynamic import, or
native HLS in Safari. The directive delivers the stream into the media element
and reports quality levels, but does not manage the interface and does not
replace `VideoService`.

Selector: `[ngxHlsSource]`.

## Purpose and responsibilities

**Does:**

- loads the HLS manifest from the URL in the `ngxHlsSource` input;
- in a browser with MSE, dynamically imports `hls.js`, creates an instance,
  attaches it to `<video>` and loads the manifest;
- if there is no MSE (iOS Safari) or `Hls.isSupported()` returned `false`, does
  not load `hls.js` and sets `video.src` instead — the browser plays HLS itself;
- emits `levelsChange` with the list of levels after `MANIFEST_PARSED`;
- emits `levelChange` with the level actually selected on `LEVEL_SWITCHED`;
- applies `level` (`id` from `QualityInterface`) and starts playback on
  `autoplay`;
- maps fatal hls.js errors, an unsupported browser and blocked autoplay to
  `VideoError` with a code from `core`;
- fully recreates the source when `ngxHlsSource` changes and clears it on
  `enabled = false`;
- releases resources when the directive is destroyed.

**Does not:**

- render an interface: the quality select, buttons and error messages are the
  consumer's job;
- call `VideoService.play()`, `pause()`, `seek()` or other commands; the video
  state is kept by the service;
- load the manifest through `fetch`/`HttpClient` — `hls.js` does that;
- recover after fatal errors automatically (there is no `recover`);
- support DASH (that is `DashSourceDirective`) or contain CSS variables,
  `customClass` and `ng-template`;
- manage native `controls`, focus and ARIA;
- touch the DOM on the server.

## Import

```ts
import { HlsSourceDirective } from '@erst_dev/ngx-video-sources';
```

## Installing hls.js

`hls.js` is a peer dependency of the package and does not end up in the build:

```sh
npm install hls.js
```

The version is the current `1.x` (`^1.7.4`). The library is imported dynamically
in the browser only, so it does not end up in the server bundle or in the demo's
initial chunk.

## Usage

```html
<video ngxVideo [ngxHlsSource]="src" [autoplay]="false" [enabled]="true" [level]="level()" [attr.playsinline]="true" (levelsChange)="onLevelsChange($event)" (levelChange)="onLevelChange($event)" (error)="onError($event)"></video>
```

```ts
import { Component, inject, signal } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import type { QualityInterface, VideoError } from '@erst_dev/ngx-video-core';
import { HlsSourceDirective } from '@erst_dev/ngx-video-sources';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, HlsSourceDirective],
  providers: [VideoService],
  templateUrl: './player.component.html',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  readonly level = signal<string | null>(null);

  protected onLevelsChange(levels: readonly QualityInterface[]): void {
    // For example, render a quality <select>.
  }

  protected onLevelChange(level: QualityInterface | null): void {
    // null means automatic selection.
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

`ngxVideo` is optional: the directive works with any `<video>`. But the player
state (time, pause, volume) is reported only by `VideoService`, so a real player
usually uses them together. The directive applies the stream and the level
itself; playback commands go through the service.

Do not set `src` on this `<video>` at the same time: the source is managed by the
directive, and its `removeAttribute('src')`/`attachMedia()` will conflict with
the binding.

## Inputs

| Input          | Type             | Default | Description                                                          |
| -------------- | ---------------- | ------- | -------------------------------------------------------------------- |
| `ngxHlsSource` | `string \| null` | `null`  | HLS manifest URL; `null` and an empty string unload the stream       |
| `autoplay`     | `boolean`        | `false` | Starts playback after the manifest is successfully parsed            |
| `enabled`      | `boolean`        | `true`  | `false` destroys hls.js, removes `src` and calls `video.load()`      |
| `level`        | `string \| null` | `null`  | Level `id` from `QualityInterface`; `null` means automatic selection |

The URL is a string, not an object: the `hls.js` configuration is not part of
this building block. Leading and trailing spaces are trimmed; a string of only
spaces is treated as empty.

## Outputs

| Output         | Type                          | Emitted when                                             |
| -------------- | ----------------------------- | -------------------------------------------------------- |
| `levelsChange` | `readonly QualityInterface[]` | After `MANIFEST_PARSED`; no "auto"                       |
| `levelChange`  | `QualityInterface \| null`    | On `LEVEL_SWITCHED`; `null` means automatic selection    |
| `error`        | `VideoError`                  | Fatal hls.js error, unsupported browser, autoplay denied |

When the source changes and on `enabled = false`, the levels are reset:
`levelsChange` receives an empty array, and `levelChange` receives `null` (if
there were levels). No outputs are emitted when the directive is destroyed.

## Native HLS fallback

Player selection order:

1. If the browser has no `MediaSource` (iOS Safari), `hls.js` is not loaded: the
   URL is set on `video.src`, and the browser handles playback.
2. Otherwise `hls.js` is imported dynamically. If `Hls.isSupported()`, the
   library loads the stream — that is how quality levels become available.
3. If `Hls.isSupported()` returned `false`, but
   `video.canPlayType('application/vnd.apple.mpegurl')` is not empty, native
   mode is used again: `video.src`.
4. If neither works, an `error` is emitted with the code
   `source-not-supported`.

The MSE path takes priority on purpose: browsers like Edge formally support HLS
natively (`canPlayType` returns `maybe`), but without `hls.js` they do not report
quality levels and recover from errors worse. That is why native mode is exactly
a fallback, not the main path.

In native mode there are no quality levels: `hls.js` does not take part in
parsing the manifest, so `levelsChange` is not emitted and `level` is ignored.

## Level mapping

Levels are mapped from `hls.levels` after `MANIFEST_PARSED`:

| Field     | Value                                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| `id`      | `name` from the manifest, otherwise `<height>p`, otherwise `level-<index>`; on a collision `-<index>` is appended |
| `label`   | `<height>p`, otherwise `name`, otherwise `Level N`                                                                |
| `width`   | Frame width, if known                                                                                             |
| `height`  | Frame height, if known                                                                                            |
| `bitrate` | Bitrate in bits per second, if known                                                                              |

There is no "auto" level in the list: automatic selection is `null` in the
`level` input and in the `levelChange` output. The `level` input finds a level by
`id` and sets `hls.currentLevel`; `null` sets `hls.currentLevel = -1`; an unknown
`id` is ignored.

## Error mapping

Fatal hls.js errors (`fatal: true`) are mapped to `VideoError`:

| Condition                                       | `code`                 |
| ----------------------------------------------- | ---------------------- |
| `details === 'manifestIncompatibleCodecsError'` | `source-not-supported` |
| `type === 'networkError'`                       | `network`              |
| `type === 'mediaError'`                         | `decode`               |
| Anything else                                   | `unknown`              |

`cause` is the original hls.js data, unchanged. Non-fatal errors are ignored:
they are regular level switches and segment reloads. No automatic `recover` is
performed: the consumer decides whether to retry.

Separately, without the involvement of hls.js, these are emitted:

- `source-not-supported` — neither `hls.js` nor native HLS is supported, or the
  `hls.js` module itself failed to load;
- `playback-blocked` — the browser blocked `video.play()` after `autoplay`
  (`NotAllowedError`);
- `unknown` — any other `video.play()` failure.

### Collision with the native `error` event

`<video>` has a DOM `error` event, and Angular subscribes `(error)` both to the
directive output and to that event. So the handler receives either a `VideoError`
(with `code` and `message`) or a native `Event` (no such fields). Native media
errors are already handled by `VideoService` through `VideoService.error`, so in
the handler it is enough to filter out values without `code`:

```ts
protected onError(error: VideoError | Event): void {
  if (!('code' in error) || typeof error.code !== 'string') {
    return;
  }

  this.error.set(error);
}
```

This is a limitation of the output name, not of the directive behavior: in
hls.js mode `<video>` is driven by MSE, and native `error` events are usually
absent, but in native mode and when the source is cleared they are possible.

## Cleanup and source switching

- Changing `ngxHlsSource` fully recreates the source: the old `hls.js` instance
  is destroyed, `src` is removed, and a new manifest is loaded.
- `enabled = false` stops the stream: `hls.destroy()`, listeners removed,
  `removeAttribute('src')` and `video.load()`. Re-enabling initializes the source
  again.
- Fast URL and `enabled` switches are protected by a generation token: results of
  stale asynchronous steps are discarded, and after the directive is destroyed
  there are no outputs and no DOM access.
- Cleanup happens in `DestroyRef`: `hls.destroy()`, listeners removed, references
  cleared. Angular removes the `<video>` itself from the DOM.

## SSR

The directive does not use `window`, `document` or `hls.js` at module top level.
On the server the effects do not touch the DOM and do not start loading the
manifest; the dynamic import of `hls.js` runs in the browser only, after the
`isPlatformBrowser` check. Levels, errors and `autoplay` are not emitted on the
server.

## Accessibility

The directive does not manage the interface, focus or ARIA: `<video>` and the
quality control elements remain the consumer's responsibility. The quality select
must have a label (`label` or `aria-label`), and an error message needs
`role="alert"` if it appears dynamically.

---

[Package README](../../../../README.md)
