# Соглашения по коду и стилизации

> Справочник. Читать перед реализацией кирпича или ревью API.

## 4. Соглашения по коду

### Именование

- **Селекторы компонентов:** `ngx-` префикс → `ngx-play-button`, `ngx-timeline`
- **Директивы:** `[ngxVideo]`, `[ngxHlsSource]`, `[ngxGesture]`
- **CSS-переменные:** префикс `--ngx-` → `--ngx-play-size`, `--ngx-timeline-color`
- **Сервисы:** суффикс `Service` → `VideoService`, `CaptureService`
- **Файлы:** kebab-case с суффиксом слоя → `play-button.component.ts`, `video.service.ts`,
  `video.directive.ts`, `video-state.type.ts`, `video-error.interface.ts`, `format-time.util.ts`
- **Интерфейсы:** на ближайшем общем уровне — `components/<кирпич>/interfaces/…`,
  `components/interfaces/…` для нескольких кирпичей, `lib/interfaces/…` для разных
  слоёв пакета.
- **Чистые функции:** аналогично — `components/<кирпич>/utils/…`,
  `components/utils/…`, `lib/utils/…` (`format-time.util.ts`).
- **Классы:** PascalCase → `PlayButtonComponent`, `VideoService`

### Компоненты

- **Standalone** по умолчанию. NgModule — только если реально нужно.
- **Все входы — сигналы:** `input<T>()`, `input.required<T>()`, `model<T>()`.
- **Все выходы — сигналы:** `output<T>()`.
- **Локальное состояние — сигналы:** `signal<T>()`.
- **Производные значения — `computed()`**.
- **Побочные эффекты — `effect()`** (аккуратно, только когда действительно нужен).
- Каждый кирпич принимает `customClass` (сигнальный вход) для стилизации.
- Каждый кирпич поддерживает `ng-template` для замены внутренностей (где уместно).
- Никаких жёстких стилей — только CSS-переменные с дефолтами.
- Accessibility: `aria-label`, `role`, keyboard-навигация — обязательны.
- **Анимации:** Angular скоупит `@keyframes` компонента; `animation-name` задаётся
  литералом, не через CSS-переменную.

### Реактивность

**Сигналы:**

- Состояние компонента (`signal()`, `computed()`).
- Входы/выходы компонентов (`input()`, `output()`, `model()`).
- Производные значения от других сигналов.

**RxJS:**

- Потоки DOM-событий (`fromEvent`).
- Асинхронные операции с операторами (`debounceTime`, `switchMap`, `combineLatest`).
- HTTP, WebSocket, таймеры.
- Внутренние потоки `VideoService` (источник данных).

**Мост между ними:**

- `toSignal()` — Observable → сигнал (для шаблонов).
- `toObservable()` — сигнал → RxJS-операторы.

### Публичный API сервисов (Вариант C: гибрид)

Все публичные данные сервиса отдаются в **двух представлениях**:

```typescript
// Observable — для RxJS-любителей и операторов
time$: Observable<number>;

// Signal — для шаблонов без AsyncPipe
time: Signal<number>;
```

Внутри держится **один источник правды** (signal), Observable получается через `toObservable()`.
Синхронизация — автоматическая. Оба представления всегда согласованы.

Методы управления (команды) остаются обычными функциями: `play()`, `pause()`, `seek(t)`.

### Публичный API пакетов

- Каждый пакет экспортирует только то, что нужно пользователю, через `src/index.ts`.
- Публичные утилиты живут в слое `utils` и документируются в README (в `controls`
  это `clamp`); внутренние helper-функции в баррел не попадают.
- Ломающие изменения — только в мажорных версиях.

### Антипаттерны (не использовать)

- ❌ `@Input()` / `@Output()` декораторы — использовать `input()` / `output()`.
- ❌ `EventEmitter` — использовать `output()`.
- ❌ `ngOnChanges` — использовать `computed()` или `effect()`.
- ❌ `BehaviorSubject` для состояния — использовать `signal()`.
- ❌ `subscribe()` в компонентах — использовать `toSignal()` или `takeUntilDestroyed()`.
- ❌ `@ViewChild` декоратор — использовать `viewChild()` / `viewChild.required()`.

---

## 6. Соглашения по стилизации

У каждого кирпича есть три возможных уровня кастомизации: CSS-переменные и
`customClass` — обязательно, `ng-template` — где уместно.

### Уровень 1: CSS-переменные (главный способ)

Все настраиваемые значения — через переменные с префиксом `--ngx-{компонент}-`.
Разработчик переопределяет их у себя, не трогая исходники.

```scss
// Внутри компонента (ngx-play-button)
:host {
  --ngx-play-size: 48px;
  --ngx-play-icon-size: 55%;
  --ngx-play-color: #ffffff;
  --ngx-play-bg: rgba(0, 0, 0, 0.7);
  --ngx-play-hover-bg: rgba(0, 0, 0, 0.9);
  --ngx-play-border-radius: 50%;
  --ngx-play-transition: 0.15s ease;
}

.ngx-play-button {
  width: var(--ngx-play-size);
  height: var(--ngx-play-size);
  color: var(--ngx-play-color);
  background: var(--ngx-play-bg);
  border-radius: var(--ngx-play-border-radius);
  transition: background var(--ngx-play-transition);
}
```

Пользователь:

```scss
ngx-play-button {
  --ngx-play-size: 64px;
  --ngx-play-bg: #ff0000;
}
```

**Правила:**

- Дефолтные значения **всегда** прописаны внутри `:host`.
- Имя переменной: `--ngx-{компонент}-{свойство}` в kebab-case.
- Пользователь **не обязан** переопределять — работает из коробки.

### Уровень 2: `customClass` (для сложной стилизации)

Сигнальный вход `customClass`, который добавляется к **хост-элементу** компонента
(`<ngx-play-button>`), а не к его внутренней разметке.

```typescript
export class PlayButtonComponent {
  customClass = input<string>('');
}
```

Пользователь:

```html
<ngx-play-button customClass="my-button"></ngx-play-button>
```

```scss
/* стили компонента-потребителя — без ::ng-deep и без глобальных стилей */
.my-button {
  --ngx-play-bg: #059669;
  border: 2px solid gold;
}
```

**Почему на хост, а не на внутренний корень:** хост-элемент создаётся в шаблоне
потребителя и получает его атрибут инкапсуляции, поэтому scoped-стили потребителя
его видят. CSS-переменные наследуются с хоста внутрь компонента. Внутренние классы
компонента остаются приватными, потребителю не нужен `::ng-deep`.

### Уровни 1 и 2 вместе

Уровни не конфликтуют и не заменяют друг друга. CSS-переменные задают внутренний
вид компонента, `customClass` — хук на хост для точечной стилизации, раскладки и
дополнительной специфичности. Если одна и та же переменная задана и на элементе,
и в классе, применяется более специфичный селектор — класс:

```scss
/* все кнопки: размер и цвет по умолчанию для темы */
ngx-play-button {
  --ngx-play-size: 64px;
  --ngx-play-bg: #ff0000;
}

/* конкретная кнопка: класс переопределяет фон, размер наследуется */
.my-button {
  --ngx-play-bg: #059669; /* победит: .my-button специфичнее ngx-play-button */
  border: 2px solid gold; /* стиль хоста, не внутренней кнопки */
}
```

Для `<ngx-play-button customClass="my-button">` итог: размер `64px`, фон
`#059669`, золотая рамка вокруг хост-элемента. Остальные переменные, заданные на
элементе, продолжают действовать. `border` и `padding` из `customClass`
применяются к хосту; чтобы рамка повторяла скругление кнопки, задайте
`border-radius` на том же классе (или используйте `outline`/`box-shadow`).

### Уровень 3: `ng-template` (для замены внутренностей)

Для компонентов со сложной структурой (таймлайн, оверлеи) — возможность заменить
целые куски через `TemplateRef`.

```typescript
export class TimelineComponent {
  previewTemplate = input<TemplateRef<{ time: number }> | null>(null);
}
```

Пользователь:

```html
<ngx-timeline [previewTemplate]="myPreview"></ngx-timeline>

<ng-template #myPreview let-time="time">
  <div class="my-preview">{{ time | date:'mm:ss' }}</div>
</ng-template>
```

### Документация стилизации

В `README.md` каждого пакета и каждого кирпича обязательно есть раздел
**«Стилизация»** с таблицей CSS-переменных: имя, дефолт, описание. Плюс примеры для
`customClass` и `ng-template` (где уместно).

---

## 10. Что нельзя ломать (breaking changes)

Публичный контракт библиотеки. Любое изменение здесь — только в новой **мажорной** версии
с миграционной инструкцией.

### Селекторы и имена

- Селекторы компонентов: `ngx-play-button`, `ngx-timeline`, `ngx-volume-slider` и т.д.
- Имена директив: `[ngxVideo]`, `[ngxHlsSource]`, `[ngxGesture]`.
- Имена сервисов: `VideoService`, `CaptureService`.
- Символ экспорта из `src/index.ts`.

### API VideoService

- Названия сигналов: `time`, `state`, `volume`, `muted`, `playbackRate`, `buffered`, `fullscreen`, `error`.
- Названия Observable: `time$`, `state$`, `volume$`, `muted$`, `playbackRate$`, `buffered$`, `fullscreen$`, `error$`.
- Сигнатуры методов: `play()`, `pause()`, `toggle()`, `seek(t)`, `setVolume(v)` и т.д.
- Типы: `VideoState`, `VideoError`, `QualityInterface`.

### API компонентов

- Имена входов (сигналов): `state`, `volume`, `currentTime`, `duration`,
  `fullscreen`, `delay`, `customClass`, `ariaLabel`, `iconTemplate`,
  `indicatorTemplate`, `previewTemplate`, `keyboardStep` и т.д.
- Имена выходов (сигналов): `toggle`, `volumeChange`, `seek`, `scrubStart`,
  `scrubEnd`, `chapterSelect` и т.д.
- CSS-переменные: `--ngx-play-*`, `--ngx-volume-*`, `--ngx-time-*`,
  `--ngx-fullscreen-*`, `--ngx-buffering-*`, `--ngx-timeline-*`.
- Типы: `ChapterInterface`, `TimelinePreviewContext`.

### Семантика типов

- Значения `VideoState`: `'idle' | 'playing' | 'paused' | 'buffering' | 'seeking' | 'ended' | 'error'`.
- Структура `VideoError` и `QualityInterface`.

**Правило:** если сомневаешься, ломает ли изменение контракт — считай, что ломает.
Добавляй новое, не трогай старое.

---
