# BufferingIndicatorComponent

Индикатор загрузки (спиннер). Показывается, когда переданное состояние равно
`buffering`. Момент включения буферизации определяет `VideoService`, а не
компонент: он только отражает состояние.

Селектор: `ngx-buffering-indicator`.

## Назначение и границы ответственности

**Делает:**

- показывает индикатор только при `state === 'buffering'`;
- умеет задерживать появление через `delay`, чтобы короткие провалы не мигали;
- отдаёт `role="status"` и скрытый текст «Загрузка…» для скринридеров;
- позволяет заменить визуальный спиннер через `indicatorTemplate`.

**Не делает:**

- не решает, когда включать и выключать буферизацию;
- не хранит состояние плеера;
- не управляет воспроизведением.

## Импорт

```ts
import { BufferingIndicatorComponent } from '@erst_dev/ngx-video-controls';
```

## Использование

```html
<div class="player">
  <video ngxVideo [src]="src"></video>

  <ngx-buffering-indicator [state]="video.state()" />
</div>
```

```scss
.player {
  position: relative;
}

ngx-buffering-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

## Входы

| Вход                | Тип                         | По умолчанию | Описание                                                                         |
| ------------------- | --------------------------- | ------------ | -------------------------------------------------------------------------------- |
| `state`             | `VideoState`                | — (required) | Текущее состояние плеера; индикатор виден только при `buffering`                 |
| `delay`             | `number`                    | `0`          | Задержка появления в миллисекундах; защищает от мигания при короткой буферизации |
| `customClass`       | `string`                    | `''`         | Дополнительный CSS-класс для хост-элемента `<ngx-buffering-indicator>`           |
| `indicatorTemplate` | `TemplateRef<void> \| null` | `null`       | Пользовательский визуальный индикатор вместо стандартного спиннера               |

## Выходы

Выходов нет: компонент только отображает переданное состояние.

## Поведение

- Индикатор рендерится только при `state === 'buffering'`; в остальных состояниях
  в DOM ничего нет.
- `delay` задерживает появление: если буферизация закончилась раньше, спиннер не
  мелькнёт. Отрицательные и некорректные значения считаются нулём.
- `indicatorTemplate` заменяет только визуальную часть. Обёртка с
  `role="status"` и скрытым текстом «Загрузка…» остаётся за компонентом;
  содержимое пользовательского шаблона помечается `aria-hidden="true"`.
- Контекст в `indicatorTemplate` не передаётся: шаблон рендерится только в
  состоянии `buffering`.

## CSS-переменные

| Переменная                        | По умолчанию                | Описание                                           |
| --------------------------------- | --------------------------- | -------------------------------------------------- |
| `--ngx-buffering-size`            | `32px`                      | Размер спиннера                                    |
| `--ngx-buffering-thickness`       | `3px`                       | Толщина кольца                                     |
| `--ngx-buffering-color`           | `#ffffff`                   | Цвет активной части кольца                         |
| `--ngx-buffering-track-color`     | `rgba(255, 255, 255, 0.25)` | Цвет трека кольца                                  |
| `--ngx-buffering-speed`           | `0.8s`                      | Длительность одного оборота (`animation-duration`) |
| `--ngx-buffering-easing`          | `linear`                    | Функция сглаживания (`animation-timing-function`)  |
| `--ngx-buffering-delay`           | `0s`                        | Задержка старта (`animation-delay`)                |
| `--ngx-buffering-iteration-count` | `infinite`                  | Количество повторов (`animation-iteration-count`)  |
| `--ngx-buffering-direction`       | `normal`                    | Направление (`animation-direction`)                |
| `--ngx-buffering-fill-mode`       | `none`                      | Режим заполнения (`animation-fill-mode`)           |
| `--ngx-buffering-play-state`      | `running`                   | `running` / `paused` (`animation-play-state`)      |

Набор повторяет свойства CSS-анимации: скорость, сглаживание, направление,
количество повторов, задержку и паузу можно менять независимо. Например,
`--ngx-buffering-direction: alternate` заставит спиннер крутиться сначала в одну
сторону, затем в другую.

`--ngx-buffering-easing` принимает любое значение CSS-свойства
`animation-timing-function`: `linear`, `ease-in`, `ease-in-out`,
`cubic-bezier(...)` и т.д.

Имя keyframes фиксировано (`ngx-buffering-spin`): Angular скоупит `@keyframes`
компонента, поэтому подменить его CSS-переменной нельзя. Если нужны собственные
`@keyframes`, используйте `indicatorTemplate` — см. ниже.

## Стилизация

Переопределение на самом компоненте:

```scss
ngx-buffering-indicator {
  --ngx-buffering-size: 48px;
  --ngx-buffering-thickness: 4px;
  --ngx-buffering-color: #34d399;
  --ngx-buffering-track-color: rgba(52, 211, 153, 0.25);
  --ngx-buffering-speed: 0.6s;
  --ngx-buffering-easing: ease-in;
  --ngx-buffering-direction: alternate;
}
```

Через `customClass` — класс вешается на **хост-элемент** `<ngx-buffering-indicator>`:

```html
<ngx-buffering-indicator customClass="my-buffering" [state]="video.state()" />
```

```scss
/* player.component.scss — обычные scoped-стили, без ::ng-deep */
.my-buffering {
  --ngx-buffering-size: 48px;
  --ngx-buffering-color: #34d399;
  --ngx-buffering-track-color: rgba(52, 211, 153, 0.25);
}
```

`customClass` не затрагивает классы, заданные на элементе вручную:
`<ngx-buffering-indicator class="layout-wide" customClass="my-buffering">`
сохранит оба.

## Свой индикатор и свои `@keyframes`

`indicatorTemplate` заменяет стандартный спиннер. Стили и `@keyframes` шаблона
объявляются в компоненте-потребителе: Angular скоупит их вместе с шаблоном,
поэтому имя анимации можно писать литералом.

```html
<ngx-buffering-indicator [state]="video.state()" [indicatorTemplate]="myIndicator" />

<ng-template #myIndicator>
  <span class="my-indicator"></span>
</ng-template>
```

```scss
/* player.component.scss */
.my-indicator {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(#34d399 0 30%, rgba(52, 211, 153, 0.2) 0);
  animation: my-indicator-pulse 0.8s ease-in-out infinite alternate;
}

@keyframes my-indicator-pulse {
  from {
    transform: scale(0.7);
    opacity: 0.5;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

Размер контейнера по умолчанию равен `--ngx-buffering-size`; содержимое шаблона
может занимать его целиком (`width/height: 100%`).

## Доступность

- Обёртка рендерится с `role="status"`: появление индикатора объявляется
  скринридером.
- Видимый спиннер (или пользовательский шаблон) помечен `aria-hidden="true"`,
  рядом лежит визуально скрытый текст «Загрузка…».
- При `prefers-reduced-motion: reduce` вращение стандартного спиннера
  отключается — остаётся статичное кольцо. За анимацию пользовательского
  шаблона отвечает потребитель.

## SSR

Таймер задержки создаётся только в браузере (`isPlatformBrowser`); на сервере
индикатор отдаётся сразу по состоянию. Анимация — чистый CSS, DOM API компонент
не использует.

---

[README пакета](../../../../README.md)
