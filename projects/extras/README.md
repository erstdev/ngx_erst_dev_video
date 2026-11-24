# @erst_dev/ngx-video-extras

Дополнительные кирпичи для плеера `ngx-video`: оверлей первого запуска, ошибки,
скорость, клавиатура, жесты и субтитры. Каждый кирпич — самостоятельный
компонент или директива, который не управляет медиа и не знает о `VideoService`:
состояние приходит через входы, действия уходят через выходы.

## Кирпичи

Подробная документация каждого готового кирпича лежит рядом с исходниками. На
сайте она открывается в разделе `/docs`.

| Кирпич                        | Селектор                    | Статус   | Что решает                                  | Документация                                                 |
| ----------------------------- | --------------------------- | -------- | ------------------------------------------- | ------------------------------------------------------------ |
| `ClickToPlayOverlayComponent` | `ngx-click-to-play-overlay` | ✅ готов | Оверлей с кнопкой Play для запуска по жесту | [README](src/lib/components/click-to-play-overlay/README.md) |
| `ErrorDisplayComponent`       | `ngx-error-display`         | ✅ готов | Сообщение об ошибке и кнопка «Повторить»    | [README](src/lib/components/error-display/README.md)         |
| `SpeedControlComponent`       | `ngx-speed-control`         | ✅ готов | Выбор скорости воспроизведения              | [README](src/lib/components/speed-control/README.md)         |
| `KeyboardShortcutsDirective`  | `ngxKeyboardShortcuts`      | ✅ готов | Управление плеером с клавиатуры             | [README](src/lib/directives/keyboard-shortcuts/README.md)    |
| `GestureDirective`            | `ngxGesture`                | ✅ готов | Свайпы: перемотка, громкость, яркость       | [README](src/lib/directives/gesture/README.md)               |
| `SubtitleRendererComponent`   | `ngx-subtitle-renderer`     | ✅ готов | Рендер WebVTT-субтитров                     | [README](src/lib/components/subtitle-renderer/README.md)     |

## Требования

- Angular 22+
- `@erst_dev/ngx-video-core` (peer-зависимость)

Пакет пока не опубликован в npm (готовится версия `1.0.0`). Внутри монорепо
подключается через `paths` в `tsconfig.base.json`.

## Установка

```sh
npm install @erst_dev/ngx-video-extras
```

## Быстрый старт

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

Оверлей существует в DOM только в состояниях `idle` и `paused`. Клик по нему
эмитит `play`, а воспроизведение запускает родитель.

## Стилизация

У кирпичей есть CSS-переменные с дефолтами в `:host` и вход `customClass`,
который вешается на хост-элемент. Это позволяет переопределять оформление
обычными scoped-стилями компонента — без `::ng-deep`.

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

Подробная таблица переменных — в README кирпича.

## Совместимость

Селекторы, входы, выходы и CSS-переменные — публичный контракт. Пока версия
`0.x`, API может меняться в минорных релизах; ломающие изменения — только в
мажорной версии.

## Лицензия

MIT

---

Документация ядра: [@erst_dev/ngx-video-core](../core/README.md).
