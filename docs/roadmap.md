# Дорожная карта и матрица

> Справочник. Текущий статус — в `CONTEXT.md`; здесь полный план и архив спринтов.

## 7. Дорожная карта (спринты)

### ✅ Спринт 0: Скелет проекта (завершён)

- [x] Nx монорепо с Angular 22
- [x] Demo-приложение `apps/demo`
- [x] Библиотека `projects/core` → `@erst_dev/ngx-video-core`
- [x] Репозиторий на GitHub
- [x] Первый коммит
- [x] `CONTEXT.md`

### ✅ Спринт 1: ngx-video-core (2 недели) — код и README готовы

- [x] `VideoService` — гибридный API (signal + Observable)
- [x] `VideoDirective` — обёртка над `<video>`
- [x] Типы: `VideoState`, `VideoError`, `QualityInterface`
- [x] Утилиты: `formatTime`
- [x] Демо-страница с сырым `<video>`, управляемым через сервис
- [x] README пакета с примерами

### ✅ Спринт 2: ngx-video-controls (2 недели) — завершён

- [x] `PlayButtonComponent`
- [x] `VolumeSliderComponent`
- [x] `TimeDisplayComponent`
- [x] `FullscreenButtonComponent`
- [x] `BufferingIndicatorComponent`
- [x] `BufferingIndicatorComponent.indicatorTemplate` — слот для собственных
      `@keyframes` (публичный API расширен аддитивно).
- [x] Полноценная демо-страница плеера: видео, play/buffering overlay, панель
      (play, volume + mute, time, fullscreen), клик по видео, адаптивная вёрстка.
      Fullscreen — на контейнер плеера, чтобы контролы оставались доступны; состояние
      синхронизируется по `fullscreenchange` в демо-обёртке.
- [x] README для каждого кирпича `controls` (`components/<кирпич>/README.md`):
      API, CSS-переменные, примеры; ссылки из README пакета.

### ✅ Спринт 3: ngx-video-timeline (3 недели) — завершён

- [x] `TimelineComponent` (клик, буфер, прогресс, клавиатура; `seek` на отпускании — вариант A)
- [x] `TimelinePreviewComponent` (превью кадров при наведении, отключаемое)
- [x] `ChapterMarkersComponent` (`chapterSelect` с полным объектом главы)
- [x] README пакета и каждого кирпича, демо-страницы `/timeline/*`

### ✅ Спринт 4: ngx-video-extras (2 недели) — завершён

- [x] `ClickToPlayOverlayComponent`
- [x] `ErrorDisplayComponent`
- [x] `SpeedControlComponent`
- [x] `KeyboardShortcutsDirective`

Четыре кирпича готовы, Спринт 4 завершён.

### ✅ Спринт 5: жесты и субтитры (3 недели) — завершён

- [x] `GestureDirective` (свайпы для мобильных)
- [x] `SubtitleRendererComponent` (WebVTT)

Оба кирпича готовы, Спринт 5 завершён.

### ✅ Спринт 6: ngx-video-sources (2 недели) — завершён

- [x] `HlsSourceDirective` (hls.js)
- [x] `DashSourceDirective` (dash.js)
- [x] `QualitySwitcherComponent`

Все три кирпича готовы, пакет `sources` собран полностью: директивы доставляют
поток и отдают уровни, компонент выбирает качество. Демо `/sources/hls-source`,
`/sources/dash-source` и `/sources/quality-switcher` — `ready`.

### 🚧 Спринт 7: ngx-video-capture — PRO (4 недели)

- [x] `CaptureService` (captureFrame, recordClip, captureGif)
- [x] `ScreenshotButtonComponent`
- [x] `ClipRecorderComponent`
- [ ] Лендинг

`CaptureService`, `ScreenshotButtonComponent` и `ClipRecorderComponent` готовы:
кадр, клип и GIF без UI, кнопка скриншота со скачиванием и UI записи клипа с
таймером и лимитом. Демо `/capture/capture-service`,
`/capture/screenshot-button` и `/capture/clip-recorder` — `ready`. Спринт 7
остаётся `🚧` из-за лендинга: следующим шагом идёт лендинг, публикация — в
финальной фазе после всех спринтов.

### ⏳ Публичный сайт: демо и документация (VPS)

Исходники остаются в приватном репозитории; публикуется только собранный
статический сайт. Сайт живёт в этом же приватном репозитории — отдельный
репозиторий не нужен. На сайте — лендинг, `/demo/` и `/docs/` с README пакетов и
кирпичей. npm-README ссылаются на публичные `/docs/...`, а не на GitHub.

Лендинг — самостоятельная точка входа с презентацией и ссылками. Он не заменяет
и не оборачивает демо: Angular-приложение сохраняет свои маршруты `/demo/...`,
документация — отдельные статические страницы `/docs/...`.

- [ ] Купить VPS и домен, зафиксировать `SITE_URL`.
- [ ] Собрать статический сайт: лендинг, демо под `/demo/`, документация под
      `/docs/`.
- [ ] Собирать демо с `baseHref=/demo/`; копировать
      `dist/apps/demo/browser` в `public/demo`.
- [ ] Генерировать HTML из README пакетов и кирпичей; переписывать
      относительные и GitHub-ссылки на `/docs/...`.
- [ ] Выбрать рендер Markdown: devDependency `marked` (рекомендуется, в runtime
      пакетов не попадает) или минимальный собственный генератор; согласовать
      до реализации.
- [ ] Настроить HTTPS и статику: Caddy (авто-TLS) или nginx + certbot;
      `try_files` для SPA `/demo/*`, кеширование, `404`.
- [ ] Деплой из CI по SSH/rsync: секреты — host, user, SSH key, путь; на VPS
      отдельный deploy-пользователь, firewall, автообновления.
- [ ] На VPS держать только статику: без Node, исходников, `.git`,
      `node_modules` и source maps.
- [ ] Проверить после деплоя: лендинг, все демо-маршруты, docs-страницы,
      HTTPS, ссылки и отсутствие лишних файлов.
- [ ] Обновить README пакетов, корневой README и npm-README ссылками на
      `SITE_URL`.

### ⏳ Финальная публикация (после всех кирпичей и спринтов)

Публикуем только когда готов весь проект: все пакеты, демо и README кирпичей.
Порядок: core → controls → timeline → extras → sources → capture.

**Описания пакетов и кирпичей на npm:**

- [ ] В корневом `README.md` каждого пакета — заголовок, короткое описание,
      установка, состав, быстрый старт, совместимость и лицензия. Именно этот
      файл npm показывает на странице пакета.
- [ ] В корневом README каждого пакета — таблица кирпичей с коротким описанием
      «что решает» и абсолютной ссылкой на публичный сайт документации
      (`SITE_URL/docs/...`). npm не рендерит вложенные README: описание кирпича
      на npm — это строка в README пакета, а полный README открывается на
      сайте.
- [ ] У каждого кирпича — README рядом с исходниками: назначение и границы,
      входы/выходы, поведение, CSS-переменные, пример, доступность, SSR.
- [ ] В `package.json` каждого пакета — `description`, `keywords`, `license`,
      `author`, `repository` (с `directory`), `homepage`, `bugs`.
- [ ] Проверить, что `README.md` попадает в корень tarball
      (`npm pack --dry-run`), а после публикации — что описание, README,
      таблица кирпичей и ссылки видны на странице пакета в npm.
- [ ] Перевести publish-сборку на partial compilation (`@nx/angular:package`):
      текущий `@nx/angular:ng-packagr-lite` генерирует `prepublishOnly`,
      который блокирует публикацию.
- [ ] Учесть, что README и метаданные фиксируются при публикации; обновление
      описания — только новой версией пакета.

- [ ] Синхронизировать версии и `peerDependencies` (у controls — `core ^0.1.0`).
- [ ] `@erst_dev/ngx-video-core@0.1.0`
- [ ] `@erst_dev/ngx-video-controls@0.1.0`
- [ ] `@erst_dev/ngx-video-timeline@0.1.0`
- [ ] `@erst_dev/ngx-video-extras@0.1.0`
- [ ] `@erst_dev/ngx-video-sources@0.1.0`
- [ ] `@erst_dev/ngx-video-capture` (PRO)

### 🚧 Инфраструктура: базовый CI (сделано; полный набор — в финальной фазе)

- [x] **GitLab:** репозиторий создан; GitHub — основной, GitLab — приватное зеркало и CI.
- [x] **CI в GitLab:** `.gitlab-ci.yml` — установка зависимостей, `lint`, `build`, артефакты сборки.
- [ ] Проверить первый зелёный пайплайн в GitLab.
- [x] **CI в GitHub:** `.github/workflows/ci.yml` — те же шаги через GitHub Actions.
- [ ] Проверить первый зелёный пайплайн в GitHub.
- [ ] **Финальные пайплайны:** полный набор для обеих площадок — в разделе
      «Финальные CI/CD-пайплайны в GitLab и GitHub» ниже.

### ⏳ Финальные CI/CD-пайплайны в GitLab и GitHub (в самом конце)

Делаем после всех спринтов, вместе с финальной публикацией. Базовый `verify`
уже есть в обоих репозиториях; здесь — полный набор: качество, безопасность,
релиз и деплой демо.

**Общее для обеих площадок**

- [ ] Выровнять пайплайны: `npm ci` → `nx format:check` → `nx run-many -t lint`
      → `nx run-many -t build` → artifacts.
- [ ] Добавить проверку lockfile под npm 10: `npx npm@10 ci --dry-run`.
- [ ] Кеш npm и `.nx/cache`, `concurrency` / cancel-in-progress.
- [ ] Когда появятся тесты — добавить `nx run-many -t test` и coverage.
- [ ] Защитить `master`: обязательный зелёный pipeline, запрет force push.
- [ ] Решить, какой CI основной; второй — ручной/по расписанию, чтобы не
      дублировать минуты.
- [ ] Бейджи CI — когда репозитории станут публичными.

**GitHub Actions**

- [ ] `verify` на push в `master` и pull request (дополнить format/lockfile).
- [ ] `security` по расписанию: `npm audit --audit-level=high`, `npm outdated`,
      SBOM через `npm sbom`.
- [ ] Dependabot/Renovate, secret scanning, CodeQL — по доступному тарифу.
- [ ] `release` по тегу: build → `npm pack --dry-run` → `npm publish --provenance`
      → GitHub Release.
- [ ] `deploy` демо на GitHub Pages: `baseHref`, `404.html`/SPA fallback, артефакт.
- [ ] npm trusted publishing через OIDC (`id-token: write`) без долгоживущего токена.

**GitLab CI**

- [ ] `verify` на push и merge request — паритет с GitHub.
- [ ] `security` по расписанию: `npm audit`, dependency/secret scanning по тарифу.
- [ ] `release` по тегу: `npm publish` или GitLab Release.
- [ ] `deploy` демо на GitLab Pages, если выбран этот хостинг.
- [ ] MR-пайплайны и protected branches.

**Перед включением**

- [ ] Обновить Angular до 22.3, чтобы `npm audit --omit=dev` не был красным.
- [ ] Добавить `repository`, `homepage`, `bugs` во все `package.json`.
- [ ] Выбрать хостинг демо: GitHub Pages или GitLab Pages.
- [ ] Проверить первый зелёный pipeline в обоих CI.

---

## 8. Полная матрица кирпичей

| #   | Кирпич                        | Пакет    | Сложность | Статус |
| --- | ----------------------------- | -------- | --------- | ------ |
| 1   | `VideoService`                | core     | ★★        | ✅     |
| 2   | `VideoDirective`              | core     | ★         | ✅     |
| 3   | Типы и утилиты                | core     | ★         | ✅     |
| 4   | `PlayButtonComponent`         | controls | ★         | ✅     |
| 5   | `VolumeSliderComponent`       | controls | ★★        | ✅     |
| 6   | `TimeDisplayComponent`        | controls | ★         | ✅     |
| 7   | `FullscreenButtonComponent`   | controls | ★         | ✅     |
| 8   | `BufferingIndicatorComponent` | controls | ★         | ✅     |
| 9   | `TimelineComponent`           | timeline | ★★★       | ✅     |
| 10  | `TimelinePreviewComponent`    | timeline | ★★★★      | ✅     |
| 11  | `ChapterMarkersComponent`     | timeline | ★★★       | ✅     |
| 12  | `ClickToPlayOverlayComponent` | extras   | ★★        | ✅     |
| 13  | `ErrorDisplayComponent`       | extras   | ★         | ✅     |
| 14  | `SpeedControlComponent`       | extras   | ★         | ✅     |
| 15  | `KeyboardShortcutsDirective`  | extras   | ★★        | ✅     |
| 16  | `GestureDirective`            | extras   | ★★★★      | ✅     |
| 17  | `SubtitleRendererComponent`   | extras   | ★★★★      | ✅     |
| 18  | `HlsSourceDirective`          | sources  | ★★★       | ✅     |
| 19  | `DashSourceDirective`         | sources  | ★★★       | ✅     |
| 20  | `QualitySwitcherComponent`    | sources  | ★★★★      | ✅     |
| 21  | `CaptureService`              | capture  | ★★★       | ✅     |
| 22  | `ScreenshotButtonComponent`   | capture  | ★★        | ✅     |
| 23  | `ClipRecorderComponent`       | capture  | ★★★★      | ✅     |

**Легенда:** ✅ готово · 🚧 в работе · ⏳ запланировано · 💰 PRO (платный)

> Все кирпичи `core`, `controls`, `timeline`, `extras` и `sources` реализованы и
> проверены; в `capture` готовы `CaptureService`, `ScreenshotButtonComponent` и
> `ClipRecorderComponent`. Публикация **всех** пакетов отложена до завершения
> всех спринтов (см. раздел 7, «Финальная публикация»).

---

## 11. Семантическое версионирование

Пакеты публикуются по semver: `MAJOR.MINOR.PATCH`.

- **MAJOR** — ломающие изменения публичного API.
- **MINOR** — новая функциональность, обратно совместимая.
- **PATCH** — багфиксы, косметика, документация.

**Стартовая версия публикации:** `0.1.0`; в репозитории пока рабочая `0.0.1`.
Пакеты публикуются только после завершения всех спринтов и кирпичей, одной
финальной фазой. До `1.0.0` разрешено ломать API в минорных версиях, но лучше
этого избегать.

**Версии между пакетами:** `core` задаёт тон. Если `core@1.2.0`, то
`controls@1.2.x`, `timeline@1.2.x` — синхронизированы по мажорной и минорной.

---

## Архив спринтов

Завершённые спринты и их решения. Текущий статус — в `CONTEXT.md`.

### ✅ Спринт 3: ngx-video-timeline (архив)

**Статус:** завершён. Все три кирпича, демо-страницы и README готовы; проверки
зелёные, браузерный прогон пройден.

**Сделано:**

- пакет `@erst_dev/ngx-video-timeline`, path в `tsconfig.base.json`, build/lint;
- `TimelineComponent`: `currentTime`, `duration`, `buffered`, `keyboardStep`,
  `customClass`, `ariaLabel`, `previewTemplate`; выходы `seek`, `scrubStart`,
  `scrubEnd`; вариант A (`seek` на отпускании, локальный `dragTime`), клавиатура,
  `role="slider"`, CSS-переменные `--ngx-timeline-*`;
- `TimelinePreviewComponent`: скрытое `<video>` + canvas, `time`, `src`,
  `enabled`, `previewSrc`, `customClass`; ленивое создание, throttle/coalesce,
  fallback по времени, `enabled = false` освобождает ресурсы;
- `ChapterMarkersComponent`: `ChapterInterface { id?, time, title }`, входы
  `chapters`, `duration`, `currentTime`, `customClass`, `ariaLabel`, выход
  `chapterSelect`; сортировка/фильтрация, активная глава, tooltip, a11y;
- демо `/timeline/timeline`, `/timeline/timeline-preview`,
  `/timeline/chapter-markers` — `ready`, с блоками «Код примера»;
- README пакета и каждого кирпича (абсолютные GitHub-ссылки), корневой README
  обновлён;
- браузерная проверка: клик/клавиатура, scrub start/end и пауза/возобновление,
  кадр preview и его отключение, маркеры и `chapterSelect`, отсутствие ошибок
  консоли.

**Отложено:**

- [ ] Live-scrub (вариант B) — отдельным шагом позже; базовую версию не блокирует.

**Решённые вопросы (Спринт 3):**

- [x] `seek` vs `scrub`: `seek` — команда перемотки, `scrubStart`/`scrubEnd` —
      границы жеста; базовая версия эмитит `seek` один раз на отпускании.
- [x] Preview: скрытое `<video>` + canvas, а не основной `<video>`; `enabled`
      полностью отключает загрузку; canvas используется только для показа, CORS
      нужен лишь для чтения пикселей.
- [x] Интеграция preview: слот `previewTemplate` у таймлайна, контекст `{ time }`.
- [x] Главы: `chapterSelect` с полным `ChapterInterface`, а не только `seek`;
      родитель вызывает `video.seek($event.time)`.
- [x] UI/UX: hit-area маркеров, tooltip при hover/focus, `aria-current`,
      clamp подсказок у краёв, `prefers-reduced-motion`.

**Архив Спринта 2:** все кирпичи `controls`, полный плеер `/controls/player` и
README кирпичей готовы; подробности — в `docs/journal.md` и истории git.

**Решённые вопросы (Спринт 1, core — архив):**

- [x] Тесты: отказ от тестовой инфраструктуры (2026-10-21). Удалены пакеты, npm-скрипты,
      `test`-таргеты, `tsconfig.spec.json` и файлы `*.spec.ts`. В `nx.json` оставлены
      `unitTestRunner: none` / `e2eTestRunner: none`, чтобы генераторы Nx не создавали тесты.
- [x] `signal()` + `toObservable()` или `BehaviorSubject` + `toSignal()`?
      → Источник правды — `signal()`, Observable через `toObservable()`. Реализовано.
- [x] Как обрабатывать `disconnect()` — оставлять ли элемент в DOM?
      → Сервис снимает слушатели и сбрасывает состояние; элемент остаётся в DOM
      (удалением занимается Angular).
- [x] `providedIn: 'root'` или per-component?
      → `providedIn: 'root'`; для нескольких плееров — `providers: [VideoService]`
      в компоненте плеера, директива получает локальный экземпляр.
- [x] Семантика `buffered`: секунды, конец буферизованного диапазона, содержащего
      текущую позицию (не доля и не максимальный буфер).
- [x] `formatTime`: при длительности больше часа — `ч:мм:сс`; некорректные значения
      (`NaN`, `Infinity`, отрицательные, `null`) → `'00:00'`.
- [x] `VideoErrorCode` дополнен `playback-blocked` для отказа автоплея (`NotAllowedError`).

---
