# @erst_dev/ngx-video-timeline

A timeline for the `ngx-video` player: a seek bar, a frame preview, and chapter
markers. Each component is a self-contained building block that does not control
the media and knows nothing about `VideoService`: state comes in through inputs,
actions go out through outputs.

## Building blocks

Detailed documentation for each building block lives next to its component. npm
shows only the package README, so the links point to GitHub.

| Component                  | Selector               | What it solves                                       | Documentation                                                                                                                       |
| -------------------------- | ---------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `TimelineComponent`        | `ngx-timeline`         | Progress, buffer, click/drag/keyboard, `seek`        | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/timeline/src/lib/components/timeline/README.md)         |
| `TimelinePreviewComponent` | `ngx-timeline-preview` | Frame under the cursor via a hidden video and canvas | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/timeline/src/lib/components/timeline-preview/README.md) |
| `ChapterMarkersComponent`  | `ngx-chapter-markers`  | Chapter markers, active chapter, `chapterSelect`     | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/timeline/src/lib/components/chapter-markers/README.md)  |

## Requirements

- Angular 22+
- `@erst_dev/ngx-video-core` (peer dependency)

The package is not yet published to npm (working version `0.0.1`). Inside the
monorepo it is wired up through `paths` in `tsconfig.base.json`.

## Installation

```sh
npm install @erst_dev/ngx-video-timeline
```

## Quick start

```typescript
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { TimelineComponent } from '@erst_dev/ngx-video-timeline';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, TimelineComponent],
  template: `
    <video ngxVideo [src]="src" (click)="video.toggle()"></video>

    <ngx-timeline [currentTime]="video.time()" [duration]="video.duration()" [buffered]="video.buffered()" (seek)="video.seek($event)" />
  `,
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';
}
```

The timeline only renders state and reports gestures. The parent applies the
seek.

## Full example: timeline, preview, and chapters

```html
<div class="player">
  <video ngxVideo [src]="src" playsinline (click)="video.toggle()"></video>

  <div class="player__timeline">
    <div class="player__timeline-track">
      <ngx-timeline [currentTime]="video.time()" [duration]="video.duration()" [buffered]="video.buffered()" [previewTemplate]="preview" (seek)="video.seek($event)" />

      <ngx-chapter-markers [chapters]="chapters" [duration]="video.duration()" [currentTime]="video.time()" (chapterSelect)="video.seek($event.time)" />
    </div>
  </div>
</div>

<ng-template #preview let-time="time">
  <ngx-timeline-preview [time]="time" [src]="src" />
</ng-template>
```

```scss
.player {
  position: relative;
  background: #000;
}

.player__timeline {
  padding: 0 0.75rem 0.5rem;
}

.player__timeline-track {
  position: relative;
}
```

```typescript
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { ChapterMarkersComponent, TimelineComponent, TimelinePreviewComponent, type ChapterInterface } from '@erst_dev/ngx-video-timeline';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, TimelineComponent, TimelinePreviewComponent, ChapterMarkersComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';

  readonly chapters: readonly ChapterInterface[] = [
    { id: 'intro', time: 0, title: 'Introduction' },
    { id: 'main', time: 120, title: 'Main part' },
    { id: 'finale', time: 300, title: 'Finale' },
  ];
}
```

A live example is the `/timeline/timeline`, `/timeline/timeline-preview`, and
`/timeline/chapter-markers` pages in the demo app. Sources:
[timeline-demo.ts](https://github.com/erstdev/ngx_erst_dev_video/blob/master/apps/demo/src/app/demos/timeline/timeline/timeline-demo.ts).

## Timeline behavior

The base version uses option A:

- during a drag, only the local `dragTime` moves;
- `seek` is emitted once — on release;
- `scrubStart` and `scrubEnd` mark the gesture boundaries and let the parent
  pause and resume playback.

Live-scrub (continuous `seek` during drag) will arrive later as a separate step.

## Frame preview

`TimelinePreviewComponent` creates a separate hidden `<video>`, seeks only that
element, and draws the frame into a canvas. The main player is not affected.

- `enabled = false` disables the preview entirely: no hidden video is created;
- `previewSrc` lets you pass a lightweight source for the preview;
- the canvas is used only for display, so CORS is needed only for reading pixels
  and caching data URLs;
- on error, a placeholder with the time remains.

Sprint 3 limitations: progressive MP4/WebM; HLS/DASH require the `sources`
package.

## Chapters

Markers are a separate absolute layer above the timeline. The parent container
must be `position: relative` and match the timeline in height.

`chapterSelect` emits the full `ChapterInterface`, so the parent immediately gets
`time`, `title`, and `id`:

```html
<ngx-chapter-markers [chapters]="chapters" [duration]="video.duration()" [currentTime]="video.time()" (chapterSelect)="video.seek($event.time)" />
```

## Styling

All components have CSS variables with defaults in `:host` and a `customClass`
input that is applied to the host element. Detailed tables are in the building
blocks' READMEs.

```scss
ngx-timeline {
  --ngx-timeline-height: 6px;
  --ngx-timeline-progress-color: #34d399;
  --ngx-timeline-thumb-color: #34d399;
}

ngx-chapter-markers {
  --ngx-timeline-chapter-color: #34d399;
  --ngx-timeline-chapter-active-color: #6ee7b7;
}

ngx-timeline-preview {
  --ngx-timeline-preview-width: 200px;
}
```

## Compatibility

Selectors, inputs, outputs, and CSS variables are the public contract. While the
version is `0.x`, the API may change in minor releases; breaking changes only in
a major version.

## License

MIT

---

Core documentation: [@erst_dev/ngx-video-core](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/core/README.md).
