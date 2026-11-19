# KeyboardShortcutsDirective

Горячие клавиши плеера: Space, стрелки, F и M. Директива переводит клавиши в
выходы и не содержит логики воспроизведения — команды применяет родитель, обычно
через `VideoService`.

Селектор: `[ngxKeyboardShortcuts]`.

## Назначение и границы ответственности

**Делает:**

- слушает `keydown` на хост-элементе;
- переводит распознанные клавиши в выходы `togglePlay`, `seekBy`,
  `volumeChange`, `toggleMute`, `toggleFullscreen`;
- вызывает `preventDefault()` для распознанных клавиш, чтобы Space и стрелки не
  прокручивали страницу;
- выставляет на хост `aria-keyshortcuts`, пока директива включена;
- игнорирует события внутри полей ввода, селектов, кнопок, ссылок и
  редактируемых областей.

**Не делает:**

- не хранит состояние и не запоминает нажатия;
- не вызывает `play()`, `pause()`, `seek()`, `setVolume()`, `toggleMute()`,
  `toggleFullscreen()` и другие методы медиа-элемента;
- не знает о `VideoService` и не читает состояние плеера;
- не управляет фокусом и не добавляет `tabindex`;
- не переводит подписи и не управляет i18n;
- не содержит стилей и CSS-переменных.

## Импорт

```ts
import { KeyboardShortcutsDirective } from '@erst_dev/ngx-video-extras';
```

## Использование

```html
<div class="player" ngxKeyboardShortcuts tabindex="0" [enabled]="shortcutsEnabled()" [seekStep]="seekStep()" [volumeStep]="volumeStep()" (togglePlay)="video.toggle()" (seekBy)="onSeekBy($event)" (volumeChange)="onVolumeChange($event)" (toggleMute)="video.toggleMute()" (toggleFullscreen)="video.toggleFullscreen()">
  <video ngxVideo [src]="src" playsinline></video>
</div>
```

```ts
import { Component, computed, inject, signal } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { KeyboardShortcutsDirective } from '@erst_dev/ngx-video-extras';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, KeyboardShortcutsDirective],
  templateUrl: './player.component.html',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';

  readonly shortcutsEnabled = signal(true);
  readonly seekStep = signal(5);
  readonly volumeStep = signal(0.1);

  protected onSeekBy(delta: number): void {
    this.video.seekBy(delta);
  }

  protected onVolumeChange(delta: number): void {
    this.video.setVolume(this.video.volume() + delta);
  }
}
```

Хост должен быть фокусируемым: `tabindex="0"` ставит потребитель. Директива
намеренно не добавляет его сама — контейнер плеера может быть любым элементом,
а решение о фокусируемости остаётся за разметкой приложения.

## Входы

| Вход         | Тип       | По умолчанию | Описание                                         |
| ------------ | --------- | ------------ | ------------------------------------------------ |
| `seekStep`   | `number`  | `5`          | Шаг перемотки стрелками в секундах               |
| `volumeStep` | `number`  | `0.1`        | Шаг громкости стрелками вверх/вниз               |
| `enabled`    | `boolean` | `true`       | Выключает обработку клавиш и `aria-keyshortcuts` |

## Выходы

| Выход              | Тип      | Когда эмитится                                    |
| ------------------ | -------- | ------------------------------------------------- |
| `togglePlay`       | `void`   | Space                                             |
| `seekBy`           | `number` | Стрелки влево/вправо: `-seekStep` / `+seekStep`   |
| `volumeChange`     | `number` | Стрелки вниз/вверх: `-volumeStep` / `+volumeStep` |
| `toggleMute`       | `void`   | M                                                 |
| `toggleFullscreen` | `void`   | F                                                 |

## Клавиши

| Клавиша      | Выход                       |
| ------------ | --------------------------- |
| `Space`      | `togglePlay`                |
| `ArrowRight` | `seekBy(+seekStep)`         |
| `ArrowLeft`  | `seekBy(-seekStep)`         |
| `ArrowUp`    | `volumeChange(+volumeStep)` |
| `ArrowDown`  | `volumeChange(-volumeStep)` |
| `F` / `f`    | `toggleFullscreen`          |
| `M` / `m`    | `toggleMute`                |

Клавиши определяются по `event.code`, а не по `event.key`: `KeyF` и `KeyM`
срабатывают и на русской раскладке, а `Space` и стрелки не зависят от символа,
который получился бы при модификаторах.

## Поведение

- Для распознанных клавиш вызывается `preventDefault()`: Space и стрелки не
  прокручивают страницу. Нераспознанные клавиши не отменяются и не мешают
  остальной разметке.
- Событие игнорируется, если:
  - `enabled` равно `false`;
  - нажат Ctrl, Meta или Alt;
  - `event.defaultPrevented` уже равно `true` — другой обработчик успел
    обработать клавишу;
  - цель события — `input`, `textarea`, `select`, `button`, `a` или
    `contenteditable` (в том числе вложенный в них элемент). Это защищает
    управление внутри плеера: фокус в селекте скорости или кнопке не
    перехватывается.
- Для `togglePlay`, `toggleMute` и `toggleFullscreen` удержание клавиши
  игнорируется (`event.repeat === true`): воспроизведение, mute и фуллскрин не
  переключаются серией повторов. Для стрелок повтор разрешён — удержание
  перематывает или меняет громкость шагами.
- Директива только эмитит выходы. Родитель сам решает, применять ли команду и
  как обрабатывать границы (например, громкость вне диапазона ограничивает
  `VideoService`).
- Состояние не хранится: повторное нажатие той же клавиши снова эмитит выход,
  а результат переключения приходит из состояния плеера.

## Фокус и доступность

- Хост должен быть фокусируемым: потребитель ставит `tabindex="0"`. Директива
  не добавляет `tabindex` и не вызывает `focus()`.
- Пока директива включена, на хосте есть
  `aria-keyshortcuts="Space ArrowRight ArrowLeft ArrowUp ArrowDown F M"`.
  При `enabled = false` атрибут снимается, чтобы подсказка не обещала
  неработающие клавиши.
- Визуальный `:focus-visible` на контейнере — ответственность потребителя.
  Рекомендуется явный outline с контрастным цветом.
- Клавиши внутри интерактивных контролов игнорируются, поэтому нативные
  `<select>`, `<input>`, `<button>` и ссылки продолжают работать штатно.
- Обработка клавиш не зависит от положения фокуса внутри контейнера: событие
  всплывает от дочерних элементов к хосту, а цель проверяется отдельно.
- В полноэкранном режиме фокус может уйти на `<video>` или `body`. Если по F
  нужно выходить из fullscreen, потребитель сам возвращает фокус внутрь
  контейнера — например, ставит `tabindex="-1"` на `<video>` и вызывает
  `focus()` по `fullscreenchange`. Директива фокусом не управляет.

## SSR

Директива не использует `window`, `document` и медиа-API. На сервере нет
`keydown`, поэтому обработчик не выполняется; хост-биндинг `aria-keyshortcuts`
безопасно рендерится в разметку. Вся логика начинается с host-listener и не
требует инициализации в браузере.

---

[README пакета](../../../../README.md)
