# @erst_dev/ngx-video-sources

Источники потокового видео для плеера `ngx-video`: HLS-манифест в `<video>`
через `hls.js` или нативный HLS, DASH-манифест через `dash.js`. Директива не
управляет интерфейсом и не подменяет `VideoService`: она доставляет поток,
отдаёт уровни качества и ошибки, а состояние плеера остаётся за сервисом.

## Кирпичи

Подробная документация каждого готового кирпича лежит рядом с исходниками. На npm
показывается только README пакета, поэтому ссылки ведут на GitHub.

| Кирпич                     | Селектор               | Статус   | Что решает                            | Документация                                                                                                                  |
| -------------------------- | ---------------------- | -------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `HlsSourceDirective`       | `ngxHlsSource`         | ✅ готов | HLS-поток через hls.js или native HLS | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/sources/src/lib/directives/hls-source/README.md)  |
| `DashSourceDirective`      | `ngxDashSource`        | ✅ готов | DASH-поток через dash.js (MSE-only)   | [README](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/sources/src/lib/directives/dash-source/README.md) |
| `QualitySwitcherComponent` | `ngx-quality-switcher` | ⏳ план  | Выбор качества видео                  | —                                                                                                                             |

Следующим шагом Спринта 6 идёт `QualitySwitcherComponent`: публичный API
`HlsSourceDirective` и `DashSourceDirective` (`QualityInterface`, `id` уровня,
`levelsChange`/`levelChange`) под него уже рассчитан.

## Требования

- Angular 22+
- `@erst_dev/ngx-video-core` (peer-зависимость)
- `hls.js` 1.x (peer-зависимость; нужен только для `HlsSourceDirective`)
- `dashjs` 5.x (peer-зависимость; нужен только для `DashSourceDirective`)

Пакет пока не опубликован в npm (рабочая версия `0.0.1`). Внутри монорепо
подключается через `paths` в `tsconfig.base.json`.

## Установка

```sh
npm install @erst_dev/ngx-video-sources hls.js dashjs
```

## Быстрый старт

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
    // Отрисовать селект качества: value — level.id, «Auto» — пустое значение.
  }

  protected onError(error: VideoError | Event): void {
    // `(error)` на <video> ловит и нативное событие: у VideoError есть code.
    if (!('code' in error) || typeof error.code !== 'string') {
      return;
    }

    // error.code — машинный контракт, error.message — готовый текст.
  }
}
```

Если в браузере есть MSE, поток ведёт `hls.js` — так доступны уровни качества.
Без MSE (iOS Safari) или при `Hls.isSupported() === false` библиотека не
загружается: URL выставляется в `video.src`, а уровни качества недоступны.

Для DASH используется `DashSourceDirective` (`[ngxDashSource]`) и `dashjs`:
манифест грузится только через MSE, нативного fallback нет. Уровни, вход `level`
и ошибки устроены так же, как у HLS:

```html
<video ngxVideo [ngxDashSource]="dashSrc" [level]="level()" (levelsChange)="onLevelsChange($event)" (levelChange)="onLevelChange($event)" playsinline></video>
```

## Совместимость

Селекторы, входы, выходы и формат `QualityInterface` — публичный контракт. Пока
версия `0.x`, API может меняться в минорных релизах; ломающие изменения — только
в мажорной версии. Публичный API `core` пакет не меняет.

## Лицензия

MIT

---

Документация ядра: [@erst_dev/ngx-video-core](https://github.com/erstdev/ngx_erst_dev_video/blob/master/projects/core/README.md).
