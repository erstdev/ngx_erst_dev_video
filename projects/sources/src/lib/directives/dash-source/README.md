# DashSourceDirective

Подключение DASH-манифеста к `<video>` через `dash.js`. Директива доставляет
поток в медиа-элемент и отдаёт уровни качества, но не управляет интерфейсом и не
подменяет `VideoService`.

Селектор: `[ngxDashSource]`.

## Назначение и границы ответственности

**Делает:**

- загружает DASH-манифест по URL из входа `ngxDashSource`;
- в браузере динамически импортирует `dashjs`, создаёт player, инициализирует его
  на `<video>` с `autoplay = false` и загружает манифест;
- после `STREAM_INITIALIZED` мапит представления видео в `QualityInterface[]` и
  эмитит `levelsChange`;
- применяет вход `level` (`id` уровня, `null` — автоматический выбор ABR);
- эмитит `levelChange` с фактически отрисованным уровнем на
  `QUALITY_CHANGE_RENDERED`;
- при `autoplay` вызывает `video.play()` и переводит отказ браузера в
  `playback-blocked`;
- переводит терминальные ошибки dash.js, неподдерживаемый браузер и
  заблокированный autoplay в `VideoError` с кодом из `core`;
- полностью пересоздаёт источник при смене `ngxDashSource` и очищает его при
  `enabled = false`;
- освобождает ресурсы при уничтожении директивы.

**Не делает:**

- не рисует интерфейс: селект качества, кнопки и сообщения об ошибке — задача
  потребителя;
- не вызывает `VideoService.play()`, `pause()`, `seek()` и другие команды;
  состояние видео ведёт сервис;
- не загружает манифест через `fetch`/`HttpClient` — это делает `dash.js`;
- не восстанавливается после терминальных ошибок автоматически;
- не поддерживает HLS (это `HlsSourceDirective`), не содержит CSS-переменных,
  `customClass` и `ng-template`;
- не управляет нативными `controls`, фокусом и ARIA;
- не трогает DOM на сервере;
- не делает native fallback: нативного DASH в браузерах нет.

## Импорт

```ts
import { DashSourceDirective } from '@erst_dev/ngx-video-sources';
```

## Установка `dashjs`

`dashjs` — peer-зависимость пакета и не попадает в сборку:

```sh
npm install dashjs
```

Версия — актуальная `5.x` (`^5.3.0`). Библиотека импортируется динамически
только в браузере, поэтому в серверный бандл и в начальный чанк демо она не
попадает.

## Использование

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
    // Например, отрисовать <select> качества.
  }

  protected onLevelChange(level: QualityInterface | null): void {
    // null — автоматический выбор.
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

`ngxVideo` не обязателен: директива работает с любым `<video>`. Но состояние
плеера (время, пауза, громкость) отдаёт только `VideoService`, поэтому в реальном
плеере их обычно используют вместе.

Не выставляйте `src` на этом `<video>` параллельно: источником управляет
директива, и её `removeAttribute('src')` будет конфликтовать с биндингом.

## Входы

| Вход            | Тип              | По умолчанию | Описание                                                           |
| --------------- | ---------------- | ------------ | ------------------------------------------------------------------ |
| `ngxDashSource` | `string \| null` | `null`       | URL DASH-манифеста; `null` и пустая строка выгружают поток         |
| `autoplay`      | `boolean`        | `false`      | Запуск воспроизведения после `STREAM_INITIALIZED`                  |
| `enabled`       | `boolean`        | `true`       | `false` уничтожает player, убирает `src` и вызывает `video.load()` |
| `level`         | `string \| null` | `null`       | `id` уровня из `QualityInterface`; `null` — автоматический выбор   |

URL — строка, а не объект: конфигурация `dash.js` в этот кирпич не входит.
Пробелы по краям строки обрезаются, строка из одних пробелов считается пустой.

## Выходы

| Выход          | Тип                           | Когда эмитится                                                        |
| -------------- | ----------------------------- | --------------------------------------------------------------------- |
| `levelsChange` | `readonly QualityInterface[]` | После `STREAM_INITIALIZED`; без «auto»                                |
| `levelChange`  | `QualityInterface \| null`    | На `QUALITY_CHANGE_RENDERED`; `null` — автоматический выбор           |
| `error`        | `VideoError`                  | Терминальная ошибка dash.js, неподдерживаемый браузер, отказ autoplay |

При смене источника и при `enabled = false` уровни сбрасываются:
`levelsChange` получает пустой массив, а `levelChange` — `null` (если уровни
были). При уничтожении директивы эмитов нет.

`levelChange` приходит на `QUALITY_CHANGE_RENDERED`, то есть сообщает уже
отрисованный уровень. При ручном переключении dash.js сначала доигрывает
буферизованные сегменты, поэтому фактический уровень может отставать от
выбранного в интерфейсе. Это поведение dash.js, а не задержка директивы.

## Только MSE

Порядок инициализации:

1. Если в браузере нет `MediaSource`, `dashjs` даже не загружается: эмитится
   `error` с кодом `source-not-supported`.
2. Иначе динамически импортируется `dashjs`. Если
   `dashjs.supportsMediaSource()` вернул `false` — тот же код ошибки.
3. После этого создаётся player и вызывается
   `player.initialize(video, url, false)`: `autoplay` у dash.js выключен, потому
   что запуском управляет только директива.

Native fallback для DASH не делается: браузеры не умеют DASH нативно. В отличие
от `HlsSourceDirective`, ветки «выставить `video.src`» здесь нет.

## API dash.js 5

В `dashjs` 5.x старые методы `getBitrateInfoListFor()`, `setQualityFor()`,
`getQualityFor()` и `setAutoSwitchQualityFor()` удалены. Кирпич использует
актуальный API:

| Задача                 | Метод dash.js                                                                     |
| ---------------------- | --------------------------------------------------------------------------------- |
| Список уровней         | `getRepresentationsByType('video')`                                               |
| Ручной выбор уровня    | `setRepresentationForTypeByIndex('video', qualityIndex)`                          |
| Автоматический выбор   | `updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: true } } } })`  |
| Ручной режим (ABR off) | `updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: false } } } })` |
| Фактический уровень    | событие `QUALITY_CHANGE_RENDERED`, поле `newRepresentation`                       |

Порядок при ручном выборе важен: сначала выключается ABR, затем вызывается
`setRepresentationForTypeByIndex()`, иначе ABR перебьёт выбор на следующем
сегменте.

## Маппинг уровней

Уровни мапятся из `getRepresentationsByType('video')` после
`STREAM_INITIALIZED`:

| Поле      | Значение                                                                                            |
| --------- | --------------------------------------------------------------------------------------------------- |
| `id`      | `id` представления, иначе `<height>p`, иначе `level-<index>`; при совпадении добавляется `-<index>` |
| `label`   | `<height>p`, иначе `id` представления, иначе `Уровень N`                                            |
| `width`   | Ширина кадра, если известна                                                                         |
| `height`  | Высота кадра, если известна                                                                         |
| `bitrate` | `bandwidth` в битах в секунду, иначе `bitrateInKbit * 1000`                                         |

Уровня «auto» в списке нет: автоматический выбор — это `null` во входе `level` и
в выходе `levelChange`.

Внутри директивы уровни хранятся как view-модели
`{ quality, qualityIndex, representationId }`, а не как параллельные массивы.
`qualityIndex` — позиция в списке `getRepresentationsByType('video')`, её
принимает `setRepresentationForTypeByIndex()`; `representationId` — исходный `id`
представления, по нему событие `QUALITY_CHANGE_RENDERED` сопоставляется с
уровнем.

Вход `level` находит уровень по публичному `id`, выключает ABR и выставляет
`qualityIndex`; `null` включает ABR; неизвестный `id` игнорируется.

## Маппинг ошибок

Терминальные ошибки dash.js переводятся в `VideoError` по числовому
`error.code`:

| Коды dash.js                                                         | `code`                 |
| -------------------------------------------------------------------- | ---------------------- |
| 11, 12, 15–19, 25–29 — загрузка, таймауты, фрагменты, синхронизация  | `network`              |
| 10, 23, 24, 31, 32, 34, 35 — разбор манифеста, MSE/EME, SourceBuffer | `source-not-supported` |
| 20, 21, 22 — SourceBuffer append/remove, обновление данных           | `decode`               |
| Всё остальное (DRM, offline, MSS)                                    | `unknown`              |

`cause` — исходные данные dash.js без изменений. Ошибка разбора субтитров
(код 33) игнорируется: видео при этом продолжает воспроизводиться.
Автоматический `recover` не выполняется: решение о повторе принимает
потребитель.

Отдельно, без участия события `ERROR`, эмитятся:

- `source-not-supported` — нет `MediaSource`, `dashjs.supportsMediaSource()`
  вернул `false` или не удалось загрузить сам модуль `dashjs`;
- `playback-blocked` — браузер заблокировал `video.play()` после `autoplay`
  (`NotAllowedError`) или dash.js эмитил `PLAYBACK_NOT_ALLOWED`;
- `unknown` — прочий отказ `video.play()` или ошибка инициализации player.

`PLAYBACK_NOT_ALLOWED` и отказ `video.play()` не дублируются: директива эмитит
`playback-blocked` один раз на источник.

### Коллизия с нативным событием `error`

У `<video>` есть DOM-событие `error`, и Angular подписывает `(error)` и на выход
директивы, и на это событие. Поэтому обработчик получает либо `VideoError`
(есть `code` и `message`), либо нативный `Event` (полей нет). Нативные ошибки
медиа уже ведёт `VideoService` через `VideoService.error`, поэтому в обработчике
достаточно отфильтровать значения без `code`:

```ts
protected onError(error: VideoError | Event): void {
  if (!('code' in error) || typeof error.code !== 'string') {
    return;
  }

  this.error.set(error);
}
```

Это ограничение имени выхода, а не поведения директивы: в MSE-режиме `<video>`
управляется dash.js, но нативные события `error` при очистке источника и
ошибках медиа возможны.

## Очистка и смена источника

- Смена `ngxDashSource` полностью пересоздаёт источник: у старого player'а
  снимаются слушатели, вызываются `reset()` и `destroy()`, `src` убирается,
  после чего загружается новый манифест.
- `enabled = false` останавливает поток: снятие слушателей, `player.reset()`,
  `player.destroy()`, `removeAttribute('src')` и `video.load()`. Повторное
  включение инициализирует источник заново.
- Быстрые переключения URL и `enabled` защищены токеном поколения: результаты
  устаревших асинхронных шагов отбрасываются, после уничтожения директивы нет
  ни эмитов, ни обращений к DOM.
- Очистка выполняется в `DestroyRef`: `player.destroy()`, снятие слушателей,
  обнуление ссылок. Сам `<video>` из DOM удаляет Angular.

## SSR

Директива не использует `window`, `document` и `dashjs` на верхнем уровне
модуля. На сервере эффекты не трогают DOM и не запускают загрузку манифеста;
динамический импорт `dashjs` выполняется только в браузере после проверки
`isPlatformBrowser`. Уровни, ошибки и `autoplay` на сервере не эмитятся.

## Доступность

Директива не управляет интерфейсом, фокусом и ARIA: `<video>` и элементы
управления качеством остаются ответственностью потребителя. Селект качества
должен иметь подпись (`label` или `aria-label`), а сообщение об ошибке —
`role="alert"`, если оно появляется динамически.

---

[README пакета](../../../../README.md)
