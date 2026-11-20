# План работ и дорожная карта

Единственный файл с планом: что сделано, что осталось и в каком порядке.

- `[x]` — сделано, `[ ]` — осталось. Пункты идут в порядке выполнения.
- Пункт закрывается только после зелёных `npx nx lint <project>` и `npx nx build <project>`;
  для документации — после `npx nx format:check`.
- Детали реализации — `docs/architecture.md`, правила кода — `docs/conventions.md`,
  история изменений — `docs/journal.md`.

## Сейчас

Все 23 кирпича в шести пакетах готовы, демо-страницы работают, стек обновлён:
Angular 22.3.0, Nx 24.1.0-beta.2, ESLint 10.15, `npm audit` — 0 уязвимостей.

**Следующий шаг — лендинг.** Дальше: сайт на VPS, публикация пакетов, финальные CI/CD.

## 1. Ближайшее

- [ ] Лендинг — отдельная точка входа с презентацией и ссылками; демо не оборачивает:
      Angular-приложение сохраняет `/demo/...`, документация — статические `/docs/...`.

## 2. Сайт-презентация на VPS

Исходники остаются приватными, публикуется только собранная статика.

- [ ] Купить VPS и домен, зафиксировать `SITE_URL`.
- [ ] Выбрать рендер Markdown для документации: `marked` (devDependency) или свой
      генератор; согласовать до реализации.
- [ ] Собрать статический сайт: лендинг + демо под `/demo/` + документация под `/docs/`.
- [ ] Собирать демо с `baseHref=/demo/`, копировать `dist/apps/demo/browser` в `public/demo`.
- [ ] Генерировать HTML из README пакетов и кирпичей, переписывать относительные и
      GitHub-ссылки на `/docs/...`.
- [ ] HTTPS и статика: Caddy (авто-TLS) или nginx + certbot, `try_files` для SPA,
      кеширование, `404`.
- [ ] Деплой из CI по SSH/rsync: секреты (host, user, SSH key, путь), отдельный
      deploy-пользователь, firewall, автообновления.
- [ ] На VPS только статика: без Node, исходников, `.git`, `node_modules` и source maps.
- [ ] Проверить после деплоя: лендинг, все демо-маршруты, docs, HTTPS, ссылки,
      отсутствие лишних файлов.
- [ ] Обновить README пакетов, корневой README и npm-README ссылками на `SITE_URL`.

## 3. Публикация пакетов (0.1.0)

Публикуем только когда готовы все пакеты, демо и README кирпичей.
Порядок: `core` → `controls` → `timeline` → `extras` → `sources` → `capture`.

- [x] README у кирпичей: 18 файлов рядом с исходниками; кирпичи `core` описаны в README пакета.
- [ ] README пакета: заголовок, описание, установка, состав, быстрый старт,
      совместимость, лицензия — именно он показывается на странице пакета в npm.
- [ ] Таблица кирпичей в README пакета с абсолютными ссылками на `SITE_URL/docs/...`.
- [ ] Метаданные во все манифесты: `description`, `keywords`, `license`, `author`,
      `repository` (+ `directory`), `homepage`, `bugs`.
- [ ] Перевести publish-сборку на partial compilation (`@nx/angular:package`):
      текущий `@nx/angular:ng-packagr-lite` добавляет `prepublishOnly`, который
      блокирует публикацию.
- [ ] Синхронизировать версии и `peerDependencies` (у `controls` — `core ^0.1.0`),
      поднять все пакеты до `0.1.0`.
- [ ] При переходе на partial — пересмотреть peer-диапазон Angular и указать
      минимальную версию в README (сейчас `^22.0.0`).
- [ ] Проверить tarball: `npm pack --dry-run` — README в корне пакета, лишних файлов нет.
- [ ] Опубликовать пакеты в порядке выше.
- [ ] После публикации проверить страницы на npm: описание, README, таблица кирпичей, ссылки.

## 4. Проверки — одинаковые команды в обоих CI

Здесь не «два похожих пайплайна», а буквально одни и те же команды. Площадка меняет
только обвязку (checkout или образ, кеш, артефакты), а не набор и смысл проверок.

Целевой набор на каждый push и pull request / merge request — одни и те же строки в
обоих CI, потому что команды вынесены в `package.json`:

```
npm ci              установка по lockfile                       ~45 c
npm run ci:audit    npm audit: падает на любой severity           ~1 c
npm run ci:verify   format + lint + build всех 7 проектов        ~30 c
```

`lint` и `build` намеренно одной командой: Nx строит общий граф и запускает их
параллельно, по отдельности они идут последовательно (~32 c + ~27 c).

Audit без порогов: `npm audit --audit-level=low` падает на любой severity, включая
moderate и low, — пайплайн зелёный только при нуле. Плата за строгость: новая
moderate-запись в базе advisories покрасит сборку без изменений в коде; лечится
обновлением зависимости или осознанным решением, записанным в этот план.

- [x] Базовый `verify` в обоих CI: `npm ci` → `lint` → `build` → artifacts.
- [x] Кеш npm в обоих CI и `.nx/cache` в GitLab; отмена устаревших прогонов.
- [x] Общий набор в npm-скриптах: `ci:verify` (format + lint + build) и `ci:audit` —
      оба CI вызывают одни и те же строки.
- [x] `lint` и `build` одним шагом `nx run-many -t lint,build` (параллельно).
- [x] `npm audit --audit-level=low` — блокирующая проверка всего дерева, любая severity.
- [ ] Добавить кеш `.nx/cache` в GitHub Actions (сейчас там кешируется только npm).
- [ ] `npm outdated` — только в задаче по расписанию, не блокирующе: команда возвращает
      exit 1 при устаревших пакетах и уронила бы пайплайн.
- [ ] SBOM (`npm sbom --sbom-format=cyclonedx`) как артефакт — **после** ухода с Nx beta:
      сейчас команда падает с `ESBOMPROBLEMS`, потому что `nx@24.1.0-beta.2` не проходит
      проверку prerelease-диапазона peer-зависимости.
- [ ] Защитить `master`: обязательный зелёный pipeline, запрет force push.
- [ ] Решить, какой CI основной; второй — вручную или по расписанию.
- [ ] Проверить первый зелёный пайплайн в GitHub.
- [ ] Проверить первый зелёный пайплайн в GitLab.
- [ ] Решить, где живёт демо: на VPS вместе с сайтом или на Pages.
- [ ] Бейджи CI — когда репозитории станут публичными.
- [ ] Тесты и coverage (`nx run-many -t test`) — только если решим вернуть тесты.

Не добавляем в пайплайн: `tsc --noEmit` (типы уже проверяет сборка), `npm audit fix`
(меняет lockfile), `npx npm@10 ci --dry-run` (в CI избыточно: `npm ci` и так идёт под npm 10;
полезно локально перед пушем, где npm 11).

## 5. CI/CD — только интеграции GitHub

То, что нельзя выразить общей командой: сервисы площадки, её авторизация и её события.

- [x] События: `verify` на push в `master` и pull request.
- [ ] Сервисы: CodeQL, secret scanning, Dependabot/Renovate — по доступному тарифу.
- [ ] Публикация: `npm publish --provenance` через OIDC (`id-token: write`), без долгоживущего токена.
- [ ] Релиз: GitHub Release по тегу.
- [ ] Деплой демо на GitHub Pages: `baseHref`, `404.html`/SPA fallback.

## 6. CI/CD — только интеграции GitLab

- [x] События: `verify` на push.
- [ ] События: отдельный пайплайн на merge request, MR-пайплайны и protected branches.
- [ ] Сервисы: dependency/secret scanning по тарифу.
- [ ] Публикация: `npm publish` с токеном в переменных GitLab.
- [ ] Релиз: GitLab Release по тегу.
- [ ] Деплой демо на GitLab Pages.

## 7. Технический долг и отложенные фичи

### Временный костыль: патч Nx под Angular 22.3

Angular 22.3 добавил поле `exports` в `@angular-devkit/architect`, поэтому подпуть
`@angular-devkit/architect/node/index.js` больше не резолвится, а Nx (включая
`24.1.0-beta.2`) импортирует именно его — падают `demo:build` и `demo:serve`.
Апстрим: [nrwl/nx#37955](https://github.com/nrwl/nx/issues/37955).

Сейчас закрыто патчем `patches/nx+24.1.0-beta.2.patch` (одна строка:
`architect/node/index.js` → `architect/node`) через `patch-package` в `postinstall`.
Порядок снятия — `patches/README.md`.

- [ ] Убрать патч, когда Nx исправит импорт и выйдет релиз с исправлением: удалить
      `patches/nx+*.patch`, devDependency `patch-package` и скрипт `postinstall`,
      затем проверить, что `npx nx build demo` зелёный без патча.
- [ ] Перейти с `nx`/`@nx/*` `24.1.0-beta.2` на stable-релиз Nx 24.1.x, когда он выйдет
      (на beta пришлось уйти ради чистого `npm audit`: в `24.0.6` жёстко запинен
      `minimatch@10.2.5` с уязвимостями).

### Отложенные фичи

- [ ] Live-scrub таймлайна (вариант B): перемотка во время движения, а не на отпускании.
- [ ] Live-режим жестов: непрерывная перемотка и громкость во время свайпа.

## 8. Сделано ранее

- [x] Старт проекта: Nx-монорепо, `apps/demo`, `@erst_dev/ngx-video-core`, репозиторий, `CONTEXT.md`.
- [x] `core`: `VideoService`, `VideoDirective`, типы и `formatTime`; демо с сырым `<video>`.
- [x] `controls`: пять кирпичей, README каждого, полный плеер `/controls/player`.
- [x] `timeline`: три кирпича, README, демо `/timeline/*`.
- [x] `extras`: шесть кирпичей, README, демо `/extras/*`.
- [x] `sources`: три кирпича, README, демо `/sources/*`.
- [x] `capture`: `CaptureService`, `ScreenshotButtonComponent`, `ClipRecorderComponent`,
      README, демо `/capture/*`.
- [x] Обновление стека: Angular 22.3.0, Nx 24.1.0-beta.2, ESLint 10.15, `npm audit` = 0.

## 9. Справочник

### Пакеты и кирпичи

| Пакет           | Кирпичи                                                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`          | `VideoService`, `VideoDirective`, типы `VideoState`/`VideoError`/`QualityInterface`, `formatTime`                                                              |
| `controls`      | `PlayButtonComponent`, `VolumeSliderComponent`, `TimeDisplayComponent`, `FullscreenButtonComponent`, `BufferingIndicatorComponent`                             |
| `timeline`      | `TimelineComponent`, `TimelinePreviewComponent`, `ChapterMarkersComponent`                                                                                     |
| `extras`        | `ClickToPlayOverlayComponent`, `ErrorDisplayComponent`, `SpeedControlComponent`, `KeyboardShortcutsDirective`, `GestureDirective`, `SubtitleRendererComponent` |
| `sources`       | `HlsSourceDirective`, `DashSourceDirective`, `QualitySwitcherComponent`                                                                                        |
| `capture` (PRO) | `CaptureService`, `ScreenshotButtonComponent`, `ClipRecorderComponent`                                                                                         |

Ответственность каждого кирпича — `docs/architecture.md`, раздел 5.1.

### Семантическое версионирование

- **MAJOR** — ломающие изменения публичного API.
- **MINOR** — новая функциональность без ломки.
- **PATCH** — багфиксы, косметика, документация.

Стартовая версия публикации — `0.1.0` (в репозитории рабочая `0.0.1`). `core` задаёт
тон: если `core@1.2.0`, то остальные — `1.2.x`. До `1.0.0` ломать API в минорных
версиях можно, но лучше избегать.
