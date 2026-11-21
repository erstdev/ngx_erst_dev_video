# SubtitleRendererComponent

WebVTT subtitle layer on top of video: accepts already loaded track content and
the current time, selects active cues and renders them as plain text. The
component does not download VTT, does not manage tracks and knows nothing about
`VideoService` — all of that stays on the parent side.

Selector: `ngx-subtitle-renderer`.

## Purpose and responsibilities

**Does:**

- parses WebVTT content into cues when `vtt` changes;
- selects active cues by the rule `start <= currentTime < end`;
- renders all active cues in file order, one below another;
- displays multiline text via `white-space: pre-line`, without `innerHTML`;
- supports `enabled`, `customClass` and the `--ngx-subtitle-*` CSS variables.

**Does not:**

- load VTT by URL: `vtt` is content, not a link;
- use `fetch`, `HttpClient` or `src`, and does not handle CORS and caching;
- manage selecting, enabling and disabling tracks;
- call media methods and knows nothing about `VideoService`;
- parse WebVTT inline tags as markup: the tags are stripped, the text stays
  plain text;
- manage focus, add `tabindex`, `role` or `aria-live`.

## Import

```ts
import { SubtitleRendererComponent } from '@erst_dev/ngx-video-extras';
```

## Usage

```html
<div class="player">
  <video ngxVideo [src]="src" playsinline></video>

  <ngx-subtitle-renderer [vtt]="vtt()" [currentTime]="video.time()" [enabled]="subtitlesEnabled()" [customClass]="subtitleClass()" />
</div>
```

```scss
.player {
  position: relative;
  overflow: hidden;
}
```

```ts
import { Component, inject, signal } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { SubtitleRendererComponent } from '@erst_dev/ngx-video-extras';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, SubtitleRendererComponent],
  templateUrl: './player.component.html',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly vtt = signal('');

  protected async loadVtt(): Promise<void> {
    const response = await fetch('/subtitles/sintel.vtt');
    this.vtt.set(await response.text());
  }
}
```

The component is rendered absolutely over the nearest positioned ancestor, so
the player container must have `position: relative`. Loading the VTT string is
the parent's responsibility: the component receives ready-made text.

## Inputs

| Input         | Type      | Default      | Description                                                  |
| ------------- | --------- | ------------ | ------------------------------------------------------------ |
| `vtt`         | `string`  | `''`         | WebVTT content, not a URL. Empty string means no subtitles   |
| `currentTime` | `number`  | — (required) | Current position in seconds                                  |
| `enabled`     | `boolean` | `true`       | Whether to show subtitles; `false` removes cues from the DOM |
| `customClass` | `string`  | `''`         | Additional CSS class for the host element                    |

There are no outputs. There is no `ng-template` either: subtitle text is plain,
and customization is limited to CSS variables and `customClass`.

## CSS variables

All values are defined in `:host`, so the component works out of the box and
can be overridden without editing the sources.

| Variable                       | Default                        | Description                                    |
| ------------------------------ | ------------------------------ | ---------------------------------------------- |
| `--ngx-subtitle-color`         | `#ffffff`                      | Text color                                     |
| `--ngx-subtitle-bg`            | `rgba(0, 0, 0, 0.65)`          | Background of the cue plate                    |
| `--ngx-subtitle-font-family`   | `inherit`                      | Font                                           |
| `--ngx-subtitle-font-size`     | `1rem`                         | Font size                                      |
| `--ngx-subtitle-font-weight`   | `500`                          | Font weight                                    |
| `--ngx-subtitle-line-height`   | `1.35`                         | Line height                                    |
| `--ngx-subtitle-padding`       | `0.25rem 0.5rem`               | Inner padding of the plate                     |
| `--ngx-subtitle-border-radius` | `0.25rem`                      | Plate corner radius                            |
| `--ngx-subtitle-gap`           | `0.25rem`                      | Spacing between simultaneous cues              |
| `--ngx-subtitle-bottom`        | `1rem`                         | Layer offset from the bottom edge of the video |
| `--ngx-subtitle-max-width`     | `90%`                          | Maximum plate width                            |
| `--ngx-subtitle-text-shadow`   | `0 1px 2px rgba(0, 0, 0, 0.9)` | Text shadow                                    |
| `--ngx-subtitle-z-index`       | `2`                            | Layer above the video                          |

## Parsing rules

Parsing runs only when `vtt` changes — `currentTime` does not rebuild the track,
it only selects from already parsed cues.

Supported:

- the `WEBVTT` header (including with a description after it);
- `NOTE`, `STYLE` and `REGION` blocks are skipped;
- a cue with an optional identifier on a separate line;
- `mm:ss.mmm` and `hh:mm:ss.mmm` timestamps;
- settings after the timestamp (`align:start`, `position:10%`, etc.) are
  ignored;
- text lines are joined with `\n`;
- HTML tags are stripped, the basic entities `&amp;`, `&lt;`, `&gt;`, `&nbsp;`,
  `&quot;`, `&#39;` are decoded; other entities stay as is.

Invalid blocks are silently skipped: a block without `-->`, with bad timestamps,
with `start >= end` or with empty text. The parser does not throw exceptions.

## Behavior

- A cue is active when `start <= currentTime < end`. If `currentTime` is not a
  finite number, there are no active cues.
- Several cues can be active at once: all are rendered, in file order, one
  below another with the `--ngx-subtitle-gap` spacing.
- With `enabled = false` the layer contains no cues: the elements are removed
  from the DOM. The host stays empty and does not intercept events.
- The host always has `pointer-events: none`: subtitles do not intercept
  clicks, gestures or player controls.
- `customClass` is applied to the host via `classList` in `effect()`. Classes
  set manually by the consumer via `class="..."` are not affected.
- The component keeps no state, calls no media methods and does not manage
  tracks.
- When `vtt` changes, parsing runs again; when `currentTime` changes, the
  already parsed array is used.

## Styling

Override on the component itself:

```scss
ngx-subtitle-renderer {
  --ngx-subtitle-bottom: 2rem;
  --ngx-subtitle-font-size: 1.125rem;
}
```

Via `customClass` — the class is applied to the **host element**
`<ngx-subtitle-renderer>`:

```html
<ngx-subtitle-renderer customClass="my-subtitles" [vtt]="vtt()" [currentTime]="video.time()" />
```

```scss
/* player.component.scss — regular scoped styles, no ::ng-deep */
.my-subtitles {
  --ngx-subtitle-color: #fef3c7;
  --ngx-subtitle-bg: rgba(17, 24, 39, 0.85);
  --ngx-subtitle-font-size: 1.5rem;
  --ngx-subtitle-border-radius: 0.5rem;
  --ngx-subtitle-bottom: 1.5rem;
}
```

`customClass` does not affect classes set on the element manually:
`<ngx-subtitle-renderer class="layout-wide" customClass="my-subtitles">` keeps
both classes.

## Accessibility

- The component does not manage focus and does not add `tabindex`, `role` or
  `aria-live`: a cue change must not be announced automatically by a screen
  reader.
- Subtitles are decorative for interaction: `pointer-events: none` on the host
  ensures clicks and gestures reach the video and the controls.
- All text styling is inherited from CSS variables, so contrast and size can
  be adjusted to the consumer's interface.
- `white-space: pre-line` preserves WebVTT line breaks without turning the text
  into HTML.

## SSR

The component does not use `window`, `document`, `fetch` or media APIs. The
parser is pure TypeScript, no geometry or DOM is needed for parsing. The only
DOM access is synchronizing the host classes via `ElementRef` in `effect()`; on
the server Angular provides the element in the same way as in the browser. The
markup is safely rendered on the server, and `currentTime` changes only in the
browser.

---

[Package README](../../../../README.md)
