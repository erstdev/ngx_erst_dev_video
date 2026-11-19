# HlsSourceDirective

Подключение HLS-манифеста к `<video>`: `hls.js` через динамический импорт или
нативный HLS в Safari. Директива доставляет поток в медиа-элемент и отдаёт
уровни качества, но не управляет интерфейсом и не подменяет `VideoService`.

Селектор: `[ngxHlsSource]`.

## Назначение и границы ответственности

**Делает:**

- загружает HLS-манифест по URL из входа `ngxHlsSource`;
- в браузере с MSE динамически импортирует `hls.js`, создаёт экземпляр,
  привязывает его к `<video>` и загружает манифест;
- если MSE нет (iOS Safari) или `Hls.isSupported()` вернул `false`, не грузит
  `hls.js`, а выставляет `video.src` — браузер играет HLS сам;
- эмитит `levelsChange` со списком уровней после `MANIFEST_PARSED`;
- эмитит `levelChange` с фактически выбранным уровнем на `LEVEL_SWITCHED`;
- применяет `level` (`id` из `QualityInterface`) и запускает воспроизведение
  при `autoplay`;
- переводит фатальные ошибки hls.js, неподдерживаемый браузер и заблокированный
  autoplay в `VideoError` с кодом из `core`;
- полностью пересоздаёт источник при смене `ngxHlsSource` и очищает его при
  `enabled = false`;
- освобождает ресурсы при уничтожении директивы.

**Не делает:**

- не рисует интерфейс: селект качества, кнопки и сообщения об ошибке — задача
  потребителя;
- не вызывает `VideoService.play()`, `pause()`, `seek()` и другие команды;
  состояние видео ведёт сервис;
- не загружает манифест через `fetch`/`HttpClient` — это делает `hls.js`;
- не восстанавливается после фатальных ошибок автоматически (`recover` нет);
- не поддерживает DASH (это `DashSourceDirective`), не содержит CSS-переменных,
  `customClass` и `ng-template`;
- не управляет нативными `controls`, фокусом и ARIA;
- не трогает DOM на сервере.

## Импорт

```ts
import { HlsSourceDirective } from '@erst_dev/ngx-video-sources';
```

## Установка `hls.js`

`hls.js` — peer-зависимость пакета и не попадает в сборку:

```sh
npm install hls.js
```

Версия — актуальная `1.x` (`^1.7.4`). Библиотека импортируется динамически
только в браузере, поэтому в серверный бандл и в начальный чанк демо она не
попадает.

## Использование

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
плеере их обычно используют вместе. Поток и уровень директива применяет сама,
команды воспроизведения — через сервис.

Не выставляйте `src` на этом `<video>` параллельно: источником управляет
директива, и её `removeAttribute('src')`/`attachMedia()` будут конфликтовать с
биндингом.

## Входы

| Вход           | Тип              | По умолчанию | Описание                                                           |
| -------------- | ---------------- | ------------ | ------------------------------------------------------------------ |
| `ngxHlsSource` | `string \| null` | `null`       | URL HLS-манифеста; `null` и пустая строка выгружают поток          |
| `autoplay`     | `boolean`        | `false`      | Запуск воспроизведения после успешного разбора манифеста           |
| `enabled`      | `boolean`        | `true`       | `false` уничтожает hls.js, убирает `src` и вызывает `video.load()` |
| `level`        | `string \| null` | `null`       | `id` уровня из `QualityInterface`; `null` — автоматический выбор   |

URL — строка, а не объект: конфигурация `hls.js` в этот кирпич не входит.
Пробелы по краям строки обрезаются, строка из одних пробелов считается пустой.

## Выходы

| Выход          | Тип                           | Когда эмитится                                                    |
| -------------- | ----------------------------- | ----------------------------------------------------------------- |
| `levelsChange` | `readonly QualityInterface[]` | После `MANIFEST_PARSED`; без «auto»                               |
| `levelChange`  | `QualityInterface \| null`    | На `LEVEL_SWITCHED`; `null` — автоматический выбор                |
| `error`        | `VideoError`                  | Фатальная ошибка hls.js, неподдерживаемый браузер, отказ autoplay |

При смене источника и при `enabled = false` уровни сбрасываются:
`levelsChange` получает пустой массив, а `levelChange` — `null` (если уровни
были). При уничтожении директивы эмитов нет.

## Native HLS fallback

Порядок выбора проигрывателя:

1. Если в браузере нет `MediaSource` (iOS Safari), `hls.js` не загружается:
   URL выставляется в `video.src`, воспроизведением занимается браузер.
2. Иначе динамически импортируется `hls.js`. Если `Hls.isSupported()`, поток
   грузит библиотека — так доступны уровни качества.
3. Если `Hls.isSupported()` вернул `false`, но
   `video.canPlayType('application/vnd.apple.mpegurl')` не пуст, — снова
   native-режим: `video.src`.
4. Если не работает ни то, ни другое — эмитится `error` с кодом
   `source-not-supported`.

MSE-путь приоритетнее намеренно: браузеры вроде Edge формально умеют HLS
нативно (`canPlayType` возвращает `maybe`), но без `hls.js` не отдают уровни
качества и хуже восстанавливаются после ошибок. Поэтому native-режим — именно
фолбэк, а не основной путь.

В native-режиме уровней качества нет: `hls.js` не участвует в разборе
манифеста, поэтому `levelsChange` не эмитится, а `level` игнорируется.

## Маппинг уровней

Уровни мапятся из `hls.levels` после `MANIFEST_PARSED`:

| Поле      | Значение                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `id`      | `name` из манифеста, иначе `<height>p`, иначе `level-<index>`; при совпадении добавляется `-<index>` |
| `label`   | `<height>p`, иначе `name`, иначе `Уровень N`                                                         |
| `width`   | Ширина кадра, если известна                                                                          |
| `height`  | Высота кадра, если известна                                                                          |
| `bitrate` | Битрейт в битах в секунду, если известен                                                             |

Уровня «auto» в списке нет: автоматический выбор — это `null` во входе `level` и
в выходе `levelChange`. Вход `level` находит уровень по `id` и выставляет
`hls.currentLevel`; `null` — `hls.currentLevel = -1`; неизвестный `id`
игнорируется.

## Маппинг ошибок

Фатальные ошибки hls.js (`fatal: true`) переводятся в `VideoError`:

| Условие                                         | `code`                 |
| ----------------------------------------------- | ---------------------- |
| `details === 'manifestIncompatibleCodecsError'` | `source-not-supported` |
| `type === 'networkError'`                       | `network`              |
| `type === 'mediaError'`                         | `decode`               |
| Всё остальное                                   | `unknown`              |

`cause` — исходные данные hls.js без изменений. Нефатальные ошибки
игнорируются: это штатные переключения уровня и повторные загрузки сегментов.
Автоматический `recover` не выполняется: решение о повторе принимает
потребитель.

Отдельно, без участия hls.js, эмитятся:

- `source-not-supported` — ни `hls.js`, ни native HLS не поддерживаются, или
  не удалось загрузить сам модуль `hls.js`;
- `playback-blocked` — браузер заблокировал `video.play()` после `autoplay`
  (`NotAllowedError`);
- `unknown` — прочий отказ `video.play()`.

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

Это ограничение имени выхода, а не поведения директивы: в hls.js-режиме
`<video>` управляется MSE, и нативных событий `error` обычно нет, но в
native-режиме и при очистке источника они возможны.

## Очистка и смена источника

- Смена `ngxHlsSource` полностью пересоздаёт источник: старый экземпляр
  `hls.js` уничтожается, `src` убирается, загружается новый манифест.
- `enabled = false` останавливает поток: `hls.destroy()`, снятие слушателей,
  `removeAttribute('src')` и `video.load()`. Повторное включение инициализирует
  источник заново.
- Быстрые переключения URL и `enabled` защищены токеном поколения: результаты
  устаревших асинхронных шагов отбрасываются, после уничтожения директивы нет
  ни эмитов, ни обращений к DOM.
- Очистка выполняется в `DestroyRef`: `hls.destroy()`, снятие слушателей,
  обнуление ссылок. Сам `<video>` из DOM удаляет Angular.

## SSR

Директива не использует `window`, `document` и `hls.js` на верхнем уровне
модуля. На сервере эффекты не трогают DOM и не запускают загрузку манифеста;
динамический импорт `hls.js` выполняется только в браузере после проверки
`isPlatformBrowser`. Уровни, ошибки и `autoplay` на сервере не эмитятся.

## Доступность

Директива не управляет интерфейсом, фокусом и ARIA: `<video>` и элементы
управления качеством остаются ответственностью потребителя. Селект качества
должен иметь подпись (`label` или `aria-label`), а сообщение об ошибке —
`role="alert"`, если оно появляется динамически.

---

[README пакета](../../../../README.md)
