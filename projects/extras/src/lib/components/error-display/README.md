# ErrorDisplayComponent

Карточка с сообщением об ошибке плеера и кнопкой «Повторить». Показывает
понятный пользователю текст вместо технических деталей, но ничего не исправляет:
решение о повторе принимает родитель.

Селектор: `ngx-error-display`.

## Назначение и границы ответственности

**Делает:**

- рендерит карточку только при непустом `error`;
- показывает `error.message`, подставляя нейтральный fallback для пустого текста;
- рисует кнопку «Повторить» и сообщает о клике выходом `retry`;
- поддерживает `customClass` и CSS-переменные `--ngx-error-*`.

**Не делает:**

- не вызывает `play()`, `seek()` и другие методы медиа-элемента;
- не знает о `VideoService` и не хранит состояние плеера;
- не загружает источник заново и не исправляет ошибку;
- не показывает `cause` и другие технические детали;
- не управляет разметкой контейнера — родитель должен задать ему
  `position: relative`.

## Импорт

```ts
import { ErrorDisplayComponent } from '@erst_dev/ngx-video-extras';
```

## Использование

```html
<div class="player">
  <video ngxVideo [src]="src" playsinline></video>

  <ngx-error-display [error]="video.error()" (retry)="onRetry()" />
</div>
```

```scss
.player {
  position: relative;
  background: #000;
}
```

```ts
import { Component, inject } from '@angular/core';
import { VideoDirective, VideoService } from '@erst_dev/ngx-video-core';
import { ErrorDisplayComponent } from '@erst_dev/ngx-video-extras';

@Component({
  selector: 'app-player',
  imports: [VideoDirective, ErrorDisplayComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  readonly video = inject(VideoService);
  readonly src = 'https://example.com/video.mp4';

  protected onRetry(): void {
    // Родитель решает, что значит «повторить»: перезагрузить источник,
    // повторить запрос или просто запустить воспроизведение.
    void this.video.play();
  }
}
```

Состояние ошибки приходит снаружи. Это может быть сигнал `VideoService.error()`
или собственный сигнал приложения — компоненту важен только сам объект
`VideoError`.

## Входы

| Вход          | Тип                  | По умолчанию | Описание                                   |
| ------------- | -------------------- | ------------ | ------------------------------------------ |
| `error`       | `VideoError \| null` | — (required) | Ошибка плеера; `null` — карточки нет в DOM |
| `customClass` | `string`             | `''`         | Дополнительный CSS-класс для хост-элемента |

## Выходы

| Выход   | Тип    | Описание                                              |
| ------- | ------ | ----------------------------------------------------- |
| `retry` | `void` | Клик по кнопке «Повторить». Повтор выполняет родитель |

## Поведение

- При `error === null` карточка не рендерится: её нет не только визуально, но и
  в DOM, поэтому она не попадает в дерево доступности. Хост-элемент
  `<ngx-error-display>` остаётся в разметке — его создаёт родитель, — но пустой
  хост не мешает кликам по видео: на `:host` стоит `pointer-events: none`, а на
  карточке — `auto`.
- Текст берётся из `error.message`. Если строка пустая или состоит из пробелов,
  показывается fallback «Не удалось воспроизвести видео».
- Поле `cause` и технические детали не показываются: сообщение уже
  нормализовано в core.
- Кнопка имеет `type="button"` и текст «Повторить». Клик только эмитит `retry`.
- `error.code` компонент не использует — это машинный контракт для логики
  потребителя.

## CSS-переменные

Все значения заданы в `:host`, поэтому компонент работает из коробки и
переопределяется без правки исходников.

| Переменная                    | По умолчанию         | Описание                             |
| ----------------------------- | -------------------- | ------------------------------------ |
| `--ngx-error-bg`              | `rgba(0, 0, 0, 0.8)` | Фон карточки                         |
| `--ngx-error-color`           | `#f9fafb`            | Цвет текста                          |
| `--ngx-error-border-radius`   | `0.75rem`            | Скругление карточки                  |
| `--ngx-error-padding`         | `1.25rem`            | Внутренние отступы карточки          |
| `--ngx-error-gap`             | `0.75rem`            | Расстояние между текстом и кнопкой   |
| `--ngx-error-max-width`       | `320px`              | Максимальная ширина карточки         |
| `--ngx-error-button-bg`       | `#ffffff`            | Фон кнопки                           |
| `--ngx-error-button-color`    | `#111827`            | Цвет текста кнопки                   |
| `--ngx-error-button-hover-bg` | `#e5e7eb`            | Фон кнопки при наведении             |
| `--ngx-error-focus-color`     | `#60a5fa`            | Цвет outline при фокусе с клавиатуры |
| `--ngx-error-transition`      | `0.15s ease`         | Переход фона кнопки                  |

## Стилизация

Переопределение на самом компоненте:

```scss
ngx-error-display {
  --ngx-error-bg: rgba(17, 24, 39, 0.92);
  --ngx-error-max-width: 400px;
}
```

Через `customClass` — класс вешается на **хост-элемент**
`<ngx-error-display>`:

```html
<ngx-error-display customClass="my-error" [error]="error()" (retry)="onRetry()" />
```

```scss
/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-error {
  --ngx-error-bg: #7f1d1d;
  --ngx-error-color: #fef2f2;
  --ngx-error-border-radius: 16px;
  --ngx-error-button-bg: #fecaca;
  --ngx-error-button-hover-bg: #fca5a5;
  --ngx-error-button-color: #7f1d1d;
  --ngx-error-focus-color: #fca5a5;
}
```

`customClass` не затрагивает классы, заданные на элементе вручную:
`<ngx-error-display class="layout-wide" customClass="my-error">` сохранит оба
класса. Сама карточка и её внутренние классы остаются приватными.

## i18n

Отдельного i18n-слоя нет — это осознанное решение Спринта 4:

- `VideoError.message` уже содержит готовый русский текст из core;
- потребитель может передать свой `VideoError` с локализованным `message`,
  `code` остаётся машинным контрактом;
- текст кнопки «Повторить» пока русский, без отдельного токена.

Компонент не переводит сообщение и не подменяет его по `code`: он показывает
ровно то, что пришло во входе `error`.

## Доступность

- Карточка помечена `role="alert"`: при появлении в DOM скринридер озвучивает
  сообщение об ошибке.
- Кнопка — нативный `<button type="button">`: Enter/Space, фокус и семантика
  работают без дополнительного кода.
- Видимый `:focus-visible` outline на кнопке.
- При `prefers-reduced-motion: reduce` переход фона отключается.
- В отсутствие ошибки карточки нет в DOM, а пустой хост не перехватывает клики
  и не мешает управлению видео.

## SSR

Компонент не использует `window`, `document` и медиа-API. Единственное
обращение к DOM — синхронизация классов хоста через `ElementRef` в `effect()`;
на сервере Angular предоставляет элемент так же, как в браузере. Шаблон
безопасно рендерится на сервере.

---

[README пакета](../../../../README.md)
