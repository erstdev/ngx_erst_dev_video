# Архитектура проекта

> Справочник. Точка входа — `CONTEXT.md`. Читать при проектировании структуры, нового пакета или кирпича.

## 1. О проекте

Экосистема Angular-библиотек для видео-плеера под брендом `@erst_dev/ngx-video-*`.

**Философия:** набор переиспользуемых «кирпичей» (компонентов, директив, сервисов),
из которых разработчик собирает кастомный плеер любой сложности.

**Целевая аудитория:** Angular-разработчики, которые строят:

- стриминговые сервисы,
- LMS и образовательные платформы,
- приложения с обработкой видео,
- кастомные плееры со своим дизайном.

**Отличие от конкурентов:** в Angular-экосистеме нет качественных headless-решений
для видео. Video.js и Shaka Player — это React/jQuery-наследие с кривой типизацией.
Мы занимаем пустую нишу нативными Angular-кирпичами.

**Принципы:**

1. Каждая категория кирпичей (`core`, `controls`, `timeline`, …) — отдельный
   npm-пакет; внутри пакета — независимые кирпичи.
2. Каждый кирпич стилизуется через CSS-переменные + `customClass` (+ `ng-template`,
   где уместно).
3. Никаких жёстких стилей, никаких навязанных макетов.
4. Standalone components, signals + RxJS, современный Angular.

---

## 2. Стек и инструменты

- **Angular 22.3+** (standalone components, signals, `input()`/`output()`)
- **TypeScript 6+** (в репозитории `~6.0.3`)
- **RxJS 7+** (для потоков событий и операторов)
- **Nx 24+** монорепозиторий
- **SCSS** для стилей
- **npm** для публикации (scope: `@erst_dev`)
- **ESLint** для линтинга (уже настроен Nx)

---

## 3. Архитектура монорепо

```
ngx-erst-dev-video/               ← корень (имя папки на компе)
├── CONTEXT.md                    ← локальная точка входа
├── package.json                  ← корневой (name: ngx-erst-dev-video)
├── nx.json
├── tsconfig.base.json
├── projects/
│   ├── core/                     → @erst_dev/ngx-video-core
│   ├── controls/                 → @erst_dev/ngx-video-controls
│   ├── timeline/                 → @erst_dev/ngx-video-timeline
│   ├── extras/                   → @erst_dev/ngx-video-extras
│   ├── sources/                  → @erst_dev/ngx-video-sources
│   └── capture/                  → @erst_dev/ngx-video-capture (PRO)
└── apps/
    └── demo/                     ← демо-сайт + песочница
```

### Граф зависимостей пакетов

```
core (фундамент, ничего не зависит)
  ↓
controls (зависит от core)
  ↓
timeline (зависит от core)
  ↓
extras (зависит от core)
  ↓
sources (зависит от core)
  ↓
capture (зависит от core) — PRO, платный
```

Каждый пакет **ссылается** на core через peerDependencies, а не включает его код.
Установка пользователем: `npm install @erst_dev/ngx-video-controls` автоматически тянет core.

### Демо-приложение

У каждого кирпича — своя демо-страница. Структура:

- `apps/demo/src/app/pages/home` — главная: группы пакетов, ссылки на все демо, статусы.
- `apps/demo/src/app/demos/<пакет>/<кирпич>/<кирпич>-demo.*` — страница конкретного кирпича.
- `apps/demo/src/app/demos/controls/player/` — сводная страница `/controls/player`:
  полный плеер из кирпичей `controls`, а не отдельный кирпич.
- `apps/demo/src/app/demos/shared/demo-shell` — общий каркас: заголовок, пакет, селектор,
  статус, описание, слот «живого демо» и список ответственностей кирпича.
- `apps/demo/src/app/demos/shared/code-snippet` — раскрывающийся блок «Код примера»,
  общий для всех демо-страниц.
- `apps/demo/src/app/demos/demo-registry.ts` — реестр групп, маршрутов и статусов.

**Статусы:** `ready` — демо работает; `wip` — кирпич в разработке; `planned` — страница-заготовка
с описанием контракта и пустым слотом под живой пример. Сейчас все демо-страницы — `ready`.
Маршруты демо грузятся лениво.

У готовых страниц под каждым примером есть блок «Код примера» с HTML/TS/SCSS, чтобы
пользователь видел не только результат, но и рецепт.

### Структура пакета (пример core)

Внутри `projects/<пакет>/src/lib` — **слои по назначению**, у каждого слоя свой
`index.ts`-баррел. Имя файла: `<сущность>.<назначение>.ts` — `video.service.ts`,
`video.directive.ts`, `video-state.type.ts`, `video-error.interface.ts`,
`format-time.util.ts`, `error-messages.constants.ts`. Компоненты лежат в своих
папках: `<имя>/<имя>.component.ts`.

```
projects/core/src/
├── index.ts                      ← публичный API пакета: export * from './lib'
└── lib/
    ├── index.ts                  ← реэкспорт всех слоёв
    ├── directives/
    │   ├── index.ts
    │   └── video.directive.ts
    ├── interfaces/
    │   ├── index.ts
    │   ├── quality.interface.ts
    │   └── video-error.interface.ts
    ├── services/
    │   ├── index.ts
    │   └── video.service.ts
    ├── types/
    │   ├── index.ts
    │   ├── video-error-code.type.ts
    │   └── video-state.type.ts
    └── utils/
        ├── index.ts
        └── format-time.util.ts
```

### Структура пакета controls

Внутри слоя `components/` каждый кирпич живёт в собственной папке со своим
`index.ts`: слой реэкспортирует папки, а не файлы напрямую.

```
projects/controls/src/
├── index.ts                      ← публичный API пакета: export * from './lib'
└── lib/
    ├── index.ts                  ← реэкспорт слоя components
    └── components/
        ├── index.ts              ← export * from './play-button' и т.д.
        ├── buffering-indicator/
        │   ├── index.ts
        │   ├── buffering-indicator.component.ts
        │   ├── buffering-indicator.component.html
        │   └── buffering-indicator.component.scss
        ├── fullscreen-button/
        │   ├── index.ts
        │   ├── interfaces/
        │   │   ├── index.ts
        │   │   └── full-screen-button-icon.interface.ts
        │   ├── fullscreen-button.component.ts
        │   ├── fullscreen-button.component.html
        │   └── fullscreen-button.component.scss
        ├── play-button/
        │   ├── index.ts
        │   ├── interfaces/
        │   │   ├── index.ts
        │   │   └── play-button-icon.interface.ts
        │   ├── play-button.component.ts
        │   ├── play-button.component.html
        │   └── play-button.component.scss
        ├── time-display/
        │   ├── index.ts
        │   ├── time-display.component.ts
        │   ├── time-display.component.html
        │   └── time-display.component.scss
        └── volume-slider/
            ├── index.ts
            ├── utils/
            │   ├── index.ts
            │   └── clamp.util.ts
            ├── volume-slider.component.ts
            ├── volume-slider.component.html
            └── volume-slider.component.scss
```

Пакеты `timeline` и `extras` устроены так же: `components/timeline`,
`components/timeline-preview`, `components/chapter-markers`; в `extras` —
`components/click-to-play-overlay`. У каждого кирпича свой `index.ts`,
папка `interfaces/` при необходимости и README.

**Правило:** новый кирпич раскладывается по слоям, а не отдельной папкой в корне
`lib`: компоненты — в `components/`, директивы — в `directives/`, сервисы — в
`services/`, типы — в `types/`.

Интерфейсы, константы и чистые функции кладём на **ближайшем общем уровне
использования**:

- нужны одному кирпичу → в его папке: `components/<кирпич>/interfaces/`,
  `components/<кирпич>/constants/`, `components/<кирпич>/utils/`;
- нужны нескольким соседним кирпичам → на уровне их общего родителя:
  `components/interfaces/`, `components/constants/`, `components/utils/`
  (а не в `lib/interfaces`);
- нужны разным слоям пакета (компоненту и сервису/директиве) → на уровне пакета:
  `lib/interfaces/`, `lib/constants/`, `lib/utils/`;
- внутренние помощники сервиса → рядом с сервисом: `services/constants/`,
  `services/utils/`. Они не попадают в публичный баррел пакета.

Например, для `components/component-1` и `components/component-2`: `Interface1`
лежит в `components/component-1/interfaces/`, `Interface2` — в
`components/component-2/interfaces/`, а `Interface3`, нужный обоим, — в
`components/interfaces/`.

У каждого уровня свой `index.ts`-баррел. Если появляется общий слой
`components/interfaces/`, `components/constants/` или `components/utils/`,
`components/index.ts` реэкспортирует и его. Внутри `components/` у каждого компонента своя папка с
локальным `index.ts`-баррелом и файлами `<имя>.component.ts|html|scss`.
Каждый слой имеет непустой `index.ts`-баррел; `lib/index.ts` реэкспортирует слои,
`src/index.ts` — `lib`.

### Документация кирпичей

Каждый кирпич должен иметь свой `README.md` в его папке: назначение,
входы/выходы, CSS-переменные, пример использования. README пакета — точка входа:
краткое описание, таблица кирпичей и ссылки на их README. На npm отображается
только README пакета, поэтому ссылки на README кирпичей делаем абсолютными
(GitHub) или включаем их содержимое в пакетный README.

---

## 5.1. Ответственность кирпичей (все пакеты)

Здесь описаны границы ответственности каждого элемента. Ассистент должен строго следовать этим правилам и не добавлять логику, которая выходит за рамки описания.

### 1. VideoService

**Что делает:** Единственный источник правды о состоянии медиа-элемента. Оборачивает HTMLVideoElement, слушает его нативные события (timeupdate, play, pause и т.д.) и предоставляет реактивное состояние.
**За что отвечает:** Хранение состояния (сигналы + Observable), методы управления (play, pause, seek, setVolume), нормализация ошибок браузера в понятный интерфейс.
**Чего НЕ делает:** Не управляет DOM-структурой плеера, не создает кнопок, не рендерит субтитры. Не знает о CSS и верстке.

### 2. VideoDirective

**Что делает:** Связывает HTML-элемент <video> с VideoService.
**За что отвечает:** Перехват ссылки на DOM-элемент, вызов connect() при инициализации и disconnect() при уничтожении. Предоставляет доступ к методам сервиса через exportAs.
**Чего НЕ делает:** Не содержит бизнес-логики (всё делегирует сервису).

### 3. Утилиты (formatTime в core, clamp в utils кирпича VolumeSlider)

**Что делает:** Чистые функции для форматирования и нормализации данных.
**За что отвечает:** `formatTime` переводит секунды в `мм:сс` или `ч:мм:сс`; `clamp` ограничивает число диапазоном.
**Чего НЕ делает:** Не хранит состояние.

### 4. PlayButtonComponent

**Что делает:** Визуальная кнопка Play/Pause.
**За что отвечает:** Отображение иконки в зависимости от переданного состояния, обработка клика и генерация события toggle. Кастомизация через CSS-переменные и ng-template.
**Чего НЕ делает:** Не вызывает напрямую методы нативного <video>. Он только сообщает наружу "меня нажали", а родительский компонент решает, что делать.

### 5. VolumeSliderComponent

**Что делает:** Ползунок громкости.
**За что отвечает:** Отображение текущего уровня, обработка drag-and-drop и кликов, генерация события изменения громкости.
**Чего НЕ делает:** Не управляет mute (для этого есть отдельная кнопка), не хранит состояние громкости самостоятельно.

### 6. TimeDisplayComponent

**Что делает:** Текстовый вывод текущего времени и длительности.
**За что отвечает:** Принимает два числа (текущее время и общее), форматирует их через утилиту formatTime и выводит в шаблон.
**Чего НЕ делает:** Не следит за видео, не запрашивает данные у сервиса напрямую.

### 7. FullscreenButtonComponent

**Что делает:** Кнопка перехода в полноэкранный режим.
**За что отвечает:** Генерация события для запроса фуллскрина, смена иконки (вход/выход).
**Чего НЕ делает:** Не вызывает Fullscreen API напрямую, это задача сервиса.

### 8. BufferingIndicatorComponent

**Что делает:** Визуальный индикатор загрузки (спиннер).
**За что отвечает:** Показывается, если переданное состояние равно `'buffering'`, с опциональной задержкой появления (`delay`). Анимация настраивается CSS-переменными `--ngx-buffering-*`; `indicatorTemplate` заменяет визуальный спиннер и позволяет подключить собственные `@keyframes` в стилях потребителя (обёртка с `role="status"` и скрытым текстом остаётся за компонентом).
**Чего НЕ делает:** Не решает, когда включать буферизацию (это делает VideoService).

### 9. TimelineComponent

**Что делает:** Базовая полоса перемотки (прогресс-бар).
**За что отвечает:** Отрисовка буфера и текущей позиции, клик, drag и клавиатура. В базовой версии `seek` эмитится один раз на отпускании (вариант A), во время drag двигается локальный `dragTime`. `scrubStart`/`scrubEnd` — границы жеста. `previewTemplate` позиционируется над полосой и получает `{ time }`.
**Чего НЕ делает:** Не рендерит превью кадров (это делает TimelinePreviewComponent), не управляет главами, не вызывает методы `<video>`.

### 10. TimelinePreviewComponent

**Что делает:** Всплывающее превью кадра при наведении на таймлайн.
**За что отвечает:** Скрытое `<video>` + canvas: seek в переданное время, отрисовка кадра, fallback со временем. Ленивое создание, throttle/coalesce, освобождение ресурсов. `enabled = false` полностью отключает превью.
**Чего НЕ делает:** Не управляет воспроизведением, не изменяет время основного видео, не является интерактивным элементом (`aria-hidden`).

### 11. ChapterMarkersComponent

**Что делает:** Визуальные метки глав на таймлайне.
**За что отвечает:** Принимает `ChapterInterface[]` (время + название), рисует кнопки-маркеры поверх полосы, подсвечивает активную главу, обрабатывает клики и эмитит `chapterSelect` с полным объектом главы.
**Чего НЕ делает:** Не парсит метаданные видео, не управляет самими главами, не вызывает `video.seek()`.

### 12. ClickToPlayOverlayComponent

**Что делает:** Прозрачный слой поверх видео с большой кнопкой Play.
**За что отвечает:** Показывается при состоянии 'idle' или 'paused' (особенно важно для обхода ограничений автоплея на мобильных устройствах). Генерирует событие клика.
**Чего НЕ делает:** Не управляет самим воспроизведением, только сообщает о желании пользователя начать просмотр.

### 13. ErrorDisplayComponent

**Что делает:** Отображение ошибок плеера.
**За что отвечает:** Принимает объект VideoError, показывает понятное пользователю сообщение (например, "Видео недоступно"), кнопку "Повторить".
**Чего НЕ делает:** Не пытается автоматически исправить ошибку.

### 14. SpeedControlComponent

**Что делает:** Выбор скорости воспроизведения.
**За что отвечает:** Отображение выпадающего списка (0.5x, 1x, 1.5x, 2x), отправка события изменения скорости.
**Чего НЕ делает:** Не применяет скорость напрямую к видео.

### 15. KeyboardShortcutsDirective

**Что делает:** Обработка горячих клавиш (Space, стрелки, F, M).
**За что отвечает:** Слушает keydown на хост-элементе и эмитит `togglePlay`, `seekBy`, `volumeChange`, `toggleMute`, `toggleFullscreen`. Для распознанных клавиш вызывает `preventDefault()`; игнорирует выключенное состояние, Ctrl/Meta/Alt, уже отменённые события, интерактивные цели и повтор для переключающих команд. Пока директива включена, выставляет на хост `aria-keyshortcuts`.
**Чего НЕ делает:** Не содержит логику плеера, не хранит состояние, не вызывает медиа-методы, не управляет фокусом и не добавляет `tabindex` — только транслирует клавиши в команды.

### 16. GestureDirective

**Что делает:** Обработка свайпов на мобильных устройствах и указателях.
**За что отвечает:** Слушает Pointer Events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`, `lostpointercapture`) на хост-элементе, ждёт превышения `threshold`, фиксирует ось и использует pointer capture. Горизонтальный свайп эмитит `seek`, вертикальный — `volumeChange` (старт в правой половине) или `brightnessChange` (старт в левой). Один жест — один выход на `pointerup`; смещение ограничивается шагом и округляется до сотых.
**Чего НЕ делает:** Не управляет видео напрямую, не хранит состояние, не вызывает медиа-API и `VideoService`, не рендерит DOM, не владеет стилями (`touch-action: none` ставит потребитель), не управляет фокусом и ARIA.

### 17. SubtitleRendererComponent

**Что делает:** Рендеринг субтитров WebVTT поверх видео из уже полученной строки.
**За что отвечает:** Принимает `vtt` (содержимое, не URL), `currentTime`, `enabled` и `customClass`. Разбирает дорожку чистыми функциями в `utils/` только при изменении `vtt`, выбирает активные cues по `start <= currentTime < end` и рисует их plain text поверх видео в порядке файла. Поддерживает несколько одновременных cues, CSS-переменные `--ngx-subtitle-*` и `customClass` на хосте; при `enabled = false` убирает cues из DOM, а `pointer-events: none` не даёт слою перехватывать клики и жесты.
**Чего НЕ делает:** Не загружает VTT по URL, не использует `fetch`, `HttpClient` и `src`, не решает CORS и кэш, не управляет дорожками (включение/выключение — задача родителя), не вызывает медиа-API и не знает о `VideoService`, не разбирает inline-теги WebVTT как разметку, не управляет фокусом и не добавляет `tabindex`, `role` и `aria-live`.

### 18. HlsSourceDirective / DashSourceDirective

**Что делает:** Подключение потокового видео (HLS/DASH).
**За что отвечает:** `HlsSourceDirective` (`[ngxHlsSource]`) доставляет HLS-манифест в `<video>`. В браузере с MSE он динамически импортирует `hls.js`, создаёт экземпляр, привязывает его к элементу и загружает манифест; если MSE нет (iOS Safari) или `Hls.isSupported()` вернул `false`, библиотека не загружается, а URL выставляется в `video.src` (native HLS). После `MANIFEST_PARSED` директива отдаёт `levelsChange` (уровни как `QualityInterface`, без «auto»), применяет вход `level` (`id` уровня, `null` — auto) и запускает `video.play()` при `autoplay`; на `LEVEL_SWITCHED` эмитит `levelChange` (`null` — автоматический выбор). Фатальные ошибки hls.js, неподдерживаемый браузер и заблокированный autoplay нормализуются в `VideoError` с кодами `network`, `decode`, `source-not-supported`, `playback-blocked`, `unknown`; нефатальные ошибки и автоматический recover отсутствуют. Смена URL и `enabled = false` полностью пересоздают или очищают источник (`hls.destroy()`, снятие слушателей, `removeAttribute('src')` и `video.load()`); от гонок защищает токен поколения, очистка выполняется в `DestroyRef`. Динамический импорт библиотеки идёт только в браузере через `isPlatformBrowser`, поэтому SSR не трогает DOM и не тянет `hls.js`.
**DashSourceDirective** (`[ngxDashSource]`) доставляет DASH-манифест в `<video>` через `dashjs`: библиотека динамически импортируется только в браузере, native fallback отсутствует — DASH играется исключительно через MSE. После `STREAM_INITIALIZED` директива мапит `getRepresentationsByType('video')` в `QualityInterface` (без «auto»), эмитит `levelsChange`, применяет вход `level` (`id` уровня, `null` — ABR auto) через `setRepresentationForTypeByIndex` с предварительным выключением `streaming.abr.autoSwitchBitrate.video`, а при `autoplay` вызывает `video.play()`. На `QUALITY_CHANGE_RENDERED` эмитится `levelChange` — фактически отрисованный уровень; в auto-режиме это `null` по внутреннему флагу, а не по индексу. Терминальные ошибки dash.js нормализуются в `VideoError` (`network`, `decode`, `source-not-supported`, `unknown`), ошибка разбора субтитров игнорируется, `PLAYBACK_NOT_ALLOWED` и отказ `video.play()` дают `playback-blocked` без дублей; автоматического recover нет. Без `MediaSource` или при `dashjs.supportsMediaSource() === false` эмитится `source-not-supported`. Смена URL и `enabled = false` пересоздают или очищают источник (`player.reset()`, `player.destroy()`, `removeAttribute('src')` и `video.load()`), уровни сбрасываются, гонки отсекает токен поколения, очистка выполняется в `DestroyRef`.
**Чего НЕ делает:** Не управляет интерфейсом: селект качества, кнопки и сообщения об ошибке рисует потребитель, `QualitySwitcherComponent` — отдельный кирпич. Не вызывает `VideoService.play()`, `pause()`, `seek()` и другие команды: состояние видео ведёт сервис, директива только доставляет поток. Не грузит манифест через `fetch`/`HttpClient`, не восстанавливается после ошибок автоматически, не поддерживает DASH (это `DashSourceDirective`) и не меняет публичный API `core`.

### 19. QualitySwitcherComponent

**Что делает:** Presentational-селект качества видео на нативном `<select>`.
**За что отвечает:** Принимает `levels` (`readonly QualityInterface[]` без «auto», порядок сохраняется) и `level` (`id` уровня, `null` — Auto); показывает первым пункт «Auto» со значением `''`, затем уровни в том же порядке. `selected` вычисляется из `level`: если `id` есть среди `levels`, выбран он, иначе Auto; входы не мутируются. Неизвестный `id` показывает Auto и ничего не эмитит до действия пользователя; пустой `levels` оставляет селект в DOM с одним пунктом Auto. На нативное `change` эмитится `levelChange: string | null` (`''` → `null`, иначе `id`) только по действию пользователя — изменение входов выходов не вызывает. Настраивается CSS-переменными `--ngx-quality-*` с дефолтами в `:host` и `customClass` на хост через `classList` + `effect()`, не затирая классы, заданные вручную; `ariaLabel` уходит в `aria-label` селекта, есть `:focus-visible` и отключение перехода при `prefers-reduced-motion: reduce`. Standalone, signals, `input()`/`output()`, OnPush, SSR без `window`, `document` и медиа-API.
**Чего НЕ делает:** Не парсит HLS/DASH-манифесты, не использует `fetch`/`HttpClient`, не хранит состояние, не знает о `VideoService` и не вызывает медиа-API, не применяет качество (это делает родитель через вход `level` директивы), не сортирует, не дедуплицирует и не фильтрует уровни, не добавляет отсутствующий уровень и не меняет публичный API `core`. Выход компонента (`string | null`, `id` выбора) — другой контракт, чем выход директив (`QualityInterface | null`, фактический уровень).

### 20. CaptureService

**Что делает:** Захват кадра, запись фрагмента и GIF из уже играющего `<video>`.
**За что отвечает:** `CaptureService` (`@Injectable({ providedIn: 'root' })`, без селектора и UI) принимает готовый `HTMLVideoElement` и работает через Canvas и `MediaRecorder`. `captureFrame()` проверяет `videoWidth`/`videoHeight` (иначе `no-video`), рисует текущий кадр в Canvas с сохранением пропорций и без увеличения (`maxWidth`/`maxHeight` — максимум, а не цель), отдаёт `Blob` через `toBlob`; `null` или `SecurityError` — `canvas-failed` с `cause`. `recordClip()` синхронно проверяет `MediaRecorder` и `video.captureStream()` (нет API — `unsupported`), сразу начинает запись и возвращает `ClipRecording`: сигнал `state` (`recording`/`stopped`/`cancelled`/`error`), идемпотентный `stop()` и `cancel()`; MIME выбирается из `video/webm;codecs=vp9,opus`, `video/webm;codecs=vp8,opus`, `video/webm`, `video/mp4` через `MediaRecorder.isTypeSupported`, явно переданный неподдержанный MIME — `recording-failed`; пустые данные — `recording-failed`, `cancel()` выбрасывает чанки, останавливает треки `MediaStream` и отклоняет ожидающий `stop()` с кодом `aborted`. `captureGif()` снимает кадры с заданным `fps` в течение `duration`, масштабирует до `width` с сохранением пропорций и кодирует настоящий GIF89a собственным энкодером без зависимостей: глобальная палитра 256 цветов 3-3-2, ближайший цвет, LZW с минимальным размером кода 8, Graphic Control Extension с задержкой `max(2, round(100 / fps))` сотых секунды и Netscape loop extension; ошибка кодирования — `gif-failed`. Некорректные числовые значения заменяются дефолтами и зажимаются в диапазон. Ошибки — обычный объект `CaptureError` (`code`/`message`/`cause`), сообщения — собственные константы пакета. SSR: `isPlatformBrowser`/`PLATFORM_ID`, на сервере — `unsupported`, без `window`, `document` и `MediaRecorder` на верхнем уровне модуля. Константы лежат в `constants/`, нормализация опций и GIF-энкодер — в `utils/`, внутренние типы — в `interfaces/`; в публичный API входят только сервис, публичные типы методов и ошибок.
**Чего НЕ делает:** Не управляет плеером и не вызывает `play()`, `pause()`, `seek()` и другие команды `VideoService`, не меняет `<video>` и не запускает воспроизведение. Не хранит глобальное состояние: вернул `Blob` — забыл. Не скачивает файлы и не инициирует загрузку — это задача потребителя. Не рисует UI: `ScreenshotButtonComponent` и `ClipRecorderComponent` — отдельные кирпичи. Не использует `fetch`, `HttpClient` и сторонние GIF-библиотеки, не добавляет зависимостей; не поддерживает прозрачность и локальные палитры GIF, не восстанавливается после ошибок автоматически и не меняет публичный API `core`.

### 21. ScreenshotButtonComponent

**Что делает:** Кнопка скриншота для уже играющего `<video>`: делегирует захват кадра `CaptureService`, отдаёт готовый `Blob` и скачивает файл.
**За что отвечает:** `ScreenshotButtonComponent` (`ngx-screenshot-button`, standalone, OnPush, signals) по клику вызывает `CaptureService.captureFrame(video, { type, quality, maxWidth, maxHeight })` и получает готовый `Blob` — сам кадр не снимает, Canvas и `MediaRecorder` не трогает. Пока кадр снимается, внутренний сигнал `capturing` блокирует кнопку и выставляет `aria-busy="true"`, повторные клики игнорируются. При успехе эмитится `capture(blob)`, затем при `download = true` файл скачивается временной ссылкой `<a download>` через `URL.createObjectURL`, а object URL освобождается после клика; имя собирает `buildFileName(fileName, type)` — trim, fallback `screenshot`, срезание существующего расширения и `.png`/`.jpg`/`.webp` по MIME. Ошибка эмитится в `captureError` как `CaptureError` из сервиса, чужое исключение оборачивается в `canvas-failed` с `cause`, кнопка снова активна, исключение не пробрасывается. `disabled` учитывает вход, отсутствие видео и захват; `aria-label` меняется на время захвата и переопределяется `ariaLabel`. Настройка — CSS-переменные `--ngx-screenshot-*` с дефолтами в `:host`, `customClass` на хост через `classList` + `effect()` и `iconTemplate` с контекстом `{ capturing }`. SSR: `document` используется только в обработчике клика, на верхнем уровне модуля нет `window`, `document` и `MediaRecorder`.
**Чего НЕ делает:** Не управляет плеером: `play()`, `pause()`, `seek()` и `VideoService` — не его зона; не снимает кадр сам и не работает с Canvas и `MediaRecorder` напрямую; не хранит историю кадров, не скачивает ничего при инициализации и не хранит глобальное состояние; не использует `fetch`/`HttpClient`; не меняет публичный API `core` и `CaptureService`.

### 22. ClipRecorderComponent

**Что делает:** UI записи клипа для уже играющего `<video>`: кнопки «Начать запись» и «Остановить», таймер, индикатор процесса и лимит `maxDuration`.
**За что отвечает:** `ClipRecorderComponent` (`ngx-clip-recorder`, standalone, OnPush, signals) по клику вызывает `CaptureService.recordClip(video, { mimeType: mimeType() ?? undefined, videoBitsPerSecond, audioBitsPerSecond, timeslice })`, получает `ClipRecording` и владеет им: запись выполняет сервис, а компонент управляет только UI-состоянием. После успешного старта включаются внутренний сигнал `recording`, таймер с нуля (обновление каждые 250 мс) и выход `recordStart`. Пока идёт запись, старт заблокирован, повторные клики игнорируются; «Остановить» доступна, пока запись активна, даже если вход `disabled` включён. Стоп вызывает `ClipRecording.stop()`, переводит UI в `stopping`, по завершении очищает интервал, фиксирует таймер на фактической длительности и один раз эмитит `recordStop(blob)`; повторный клик во время остановки игнорируется. По достижении `maxDuration` компонент сам вызывает ту же остановку; лимит фиксируется на момент старта (`0` — без ограничения, некорректное значение — 30, отрицательное — 0, больше 3600 — 3600). Ошибка `recordClip()`, `stop()` или переход `ClipRecording.state()` в `error` дают `recordError` с `CaptureError`, останавливают таймер и снова делают кнопки доступными; чужое исключение оборачивается в `recording-failed` с `cause` и наружу не пробрасывается. На `DestroyRef` очищается интервал, активная запись отменяется через `cancel()`, после уничтожения выходы не эмитятся. Настройка — CSS-переменные `--ngx-recorder-*` с дефолтами в `:host`, `customClass` на хост через `classList` + `effect()` и `indicatorTemplate` с контекстом `{ recording, stopping }`; стандартный индикатор — пульсирующая декоративная точка (`aria-hidden`), при `prefers-reduced-motion: reduce` анимация отключается. `aria-label` группы по умолчанию «Запись клипа», у кнопок — «Начать запись» и «Остановить запись», таймер — `role="timer"` с `aria-live="off"`. SSR: на верхнем уровне модуля нет `window`, `document` и `MediaRecorder`, `setInterval` создаётся только в обработчике клика, поэтому создание компонента на сервере не падает.
**Чего НЕ делает:** Не управляет плеером: `play()`, `pause()`, `seek()` и `VideoService` — не его зона. Не работает с Canvas и `MediaRecorder` напрямую — только через `CaptureService`. Не скачивает файлы, не создаёт object URL, не хранит историю записей и не отменяет запись по клику: готовый `Blob` уходит потребителю, скачивание и предпросмотр — его задача. Не использует `fetch`/`HttpClient`, не меняет публичный API `core` и `CaptureService`.

## Публичный API core

Полное описание — в [projects/core/README.md](../projects/core/README.md).
