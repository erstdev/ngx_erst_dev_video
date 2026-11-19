> Карточка задачи для нового чата. Скопируй содержимое целиком.

# Спринт 6 / DashSourceDirective

Работаем в репозитории `ngx_erst_dev_video` (Nx, Angular 22). Следуй `AGENTS.md`.

Пакет `@erst_dev/ngx-video-sources` и первый кирпич `HlsSourceDirective` уже готовы. Этот чат делает второй кирпич — `DashSourceDirective`, по образцу HLS. `QualitySwitcherComponent` не делать.

## Цель

Реализовать `DashSourceDirective` в `@erst_dev/ngx-video-sources`: директива на `<video>` подключает DASH-манифест через `dash.js`, отдаёт уровни качества и текущий уровень, не управляет интерфейсом и не меняет публичный API `core`. Нативного DASH в браузерах нет, поэтому ветки «как в Safari» здесь не будет.

## Библиотека (решение)

- `dash.js`, npm-пакет **`dashjs`** (не `dash.js` — это посторонний React-кит). Актуальная версия `5.x` (`^5.3.0`), проверить `npm view dashjs version`.
- Альтернатива — Shaka Player (`shaka-player`). Если нужен он, скажи до начала: меняются зависимость, API и структура. По умолчанию — `dashjs`.

## Прочитать только это

- `CONTEXT.md` — разделы «Сейчас» и «Решения Спринта 6».
- `projects/sources/src/lib/directives/hls-source/` — эталон кирпича: директива, `constants/`, `utils/`, `interfaces/`, README, баррелы.
- `projects/sources/package.json`, `ng-package.json`, `project.json`, `tsconfig.json`, `tsconfig.lib.json`, `tsconfig.lib.prod.json`, `eslint.config.mjs` — каркас есть, менять только зависимости.
- `projects/sources/src/index.ts`, `src/lib/index.ts`, `src/lib/directives/index.ts`.
- `projects/core/src/lib/interfaces/quality.interface.ts`, `video-error.interface.ts`, `types/video-error-code.type.ts`.
- `projects/core/src/lib/directives/video.directive.ts`; `services/video.service.ts` — только публичные сигналы и методы.
- `apps/demo/src/app/demos/sources/dash-source/*` — заготовка демо.
- `apps/demo/src/app/demos/sources/hls-source/*` — эталон живого демо с `CodeSnippetComponent` (`.ts`, `.html`, `.scss`).
- `apps/demo/src/app/demos/shared/demo-shell/demo-shell.ts`, `code-snippet/code-snippet.ts`.
- `apps/demo/src/app/demos/demo-registry.ts` — только группа `sources`.
- `apps/demo/src/app/app.routes.ts` — только маршрут `sources/dash-source`.
- `docs/architecture.md` — раздел 18; `docs/roadmap.md` — Спринт 6 и матрица; `docs/conventions.md` — 4, 6 и 10; `docs/journal.md` — последние строки.
- `README.md` — таблица пакетов.
- `tsconfig.base.json` — алиас `@erst_dev/ngx-video-sources` уже есть, менять не нужно.

## Не читать

- Остальные кирпичи `controls`, `timeline`, `extras`.
- README пакетов целиком, кроме `projects/sources/README.md` и README HLS-кирпича.
- `docs/` целиком, `dist`, `.nx`, lock-файлы.
- `node_modules` — кроме `node_modules/dashjs/index.d.ts` после установки (точные имена событий, ошибок и методов).
- Историю старых спринтов и старые чаты.

## Зависимость

`dashjs` — единственная новая зависимость. Добавить как devDependency корня (демо и сборка) и peerDependency пакета `sources`; не бандлить в пакет. Версия — актуальная 5.x, зафиксировать в `package.json`. Lock-файл обновляется только через `npm install`. Других зависимостей не добавлять. Публичный API `core` не менять.

## API

Селектор: `[ngxDashSource]`.
Класс: `DashSourceDirective`.

Входы:

- `ngxDashSource: string | null = null` — URL DASH-манифеста (`.mpd`), строка; `null`/пустая строка выгружают поток;
- `autoplay: boolean = false` — запуск после успешной инициализации потока;
- `enabled: boolean = true` — `false` уничтожает player и очищает источник;
- `level: string | null = null` — `id` выбранного уровня из `QualityInterface`; `null` — автоматический выбор.

Выходы:

- `levelsChange: readonly QualityInterface[]` — доступные уровни после `STREAM_INITIALIZED`; без «auto»;
- `levelChange: QualityInterface | null` — фактический уровень; `null` означает auto;
- `error: VideoError` — фатальная ошибка dash.js, неподдерживаемый браузер или заблокированный autoplay.

CSS-переменных, `customClass` и `ng-template` у директивы нет.

## Поведение

- Директива вешается на `<video>` и работает вместе с `ngxVideo`, но не требует его. Состояние видео ведёт `VideoService`; директиву не вызывай через `VideoService.play()`, `seek()` и т.п. Единственное обращение к медиа — `video.play()` для `autoplay`.
- В браузере: динамически импортировать `dashjs`, создать player (`dashjs.MediaPlayer().create()`), инициализировать на элементе с `autoplay = false` и загрузить манифест. Форму экспорта динамического импорта проверить по факту (`module.default` или namespace) и по типам.
- Поддержка: если нет `MediaSource` или `dashjs.supportsMediaSource()` вернул `false` — эмитить `error` с кодом `source-not-supported`. Native fallback для DASH не делать.
- `STREAM_INITIALIZED`: смапить `player.getBitrateInfoListFor('video')` в `QualityInterface[]`, эмитить `levelsChange`, применить `level`, при `autoplay` вызвать `video.play()` и обработать отказ через `error` с кодом `playback-blocked`.
- `QUALITY_CHANGE_RENDERED`: эмитить `levelChange`. В auto-режиме `getQualityFor()` тоже возвращает конкретный индекс, поэтому auto определять по настройке ABR (или собственному флагу), а не по индексу; для auto — `null`.
- `ERROR`: нефатальные ошибки игнорировать, терминальные мапить в `VideoError` (`network`, `decode`, `source-not-supported`, `unknown`), `cause` — исходные данные dash.js. Автоматический recover не делать. Ориентир по кодам `dashjs.MediaPlayer.errors`: load/timeout/download → `network`, parsing/scheme/media-source-not-supported → `source-not-supported`, media source/media/decode → `decode`, остальное → `unknown`; точный каталог — в `constants/`.
- `PLAYBACK_NOT_ALLOWED` (если dash.js его эмитит): `playback-blocked`, но без дублей с отказом `video.play()`.
- `level`: найти уровень по `id`, выставить `player.setQualityFor('video', qualityIndex)`; `null` — включить auto (`setAutoSwitchQualityFor('video', true)` или настройка `streaming.abr.autoSwitchBitrate.video`); неизвестный `id` игнорировать. Для связи `QualityInterface` с `qualityIndex` нужна внутренняя view-модель (`{ quality, qualityIndex }`), а не параллельные массивы.
- `enabled = false`: остановить поток, `player.reset()`, `player.destroy()`, убрать `src` и вызвать `video.load()`. При повторном включении — заново инициализировать.
- Смена `ngxDashSource`: полностью пересоздать источник без утечек.
- Защита от гонок при быстрой смене URL/enabled: токен поколения; после `destroy()` никаких эмитов и обращений к DOM.
- Очистка в `DestroyRef`/`ngOnDestroy`: `player.destroy()`, снятие слушателей, обнуление ссылок.
- При смене источника и `enabled = false` уровни сбрасываются: `levelsChange([])`, `levelChange(null)`.
- SSR: без `window`, `document` и `dashjs` на верхнем уровне модуля; динамический импорт только в браузере через `isPlatformBrowser`.
- Константы событий/ошибок и маппинги — в `constants/` и `utils/`. **Интерфейсы и типы — только в `interfaces/` кирпича** (правило из ревью HLS: не объявлять `interface`/`type` в директиве и util-файлах; в публичный API кирпича они не входят).
- Помнить про коллизию имени `error` на `<video>`: Angular позовёт `(error)` и для нативного события медиа. В README и демо — тот же фильтр по `code`/`message`, что у HLS.

## Структура

- `projects/sources/src/lib/directives/dash-source/dash-source.directive.ts`
- `.../dash-source/index.ts`
- `.../dash-source/README.md`
- `.../dash-source/constants/dash-source.constants.ts` + `index.ts`
- `.../dash-source/utils/map-dash-levels.util.ts`, `map-dash-error.util.ts` + `index.ts`
- `.../dash-source/interfaces/` — минимальный интерфейс player'а, тип обработчика события, view-модель уровня, данные ошибки + `index.ts`
- `projects/sources/src/lib/directives/index.ts` — добавить реэкспорт.
- `projects/sources/package.json` — `dashjs` в peerDependencies (hls.js оставить).
- `package.json` корня — `dashjs` в devDependencies.
- `tsconfig.base.json` — alias уже есть, не менять.

## Демо

Превратить `apps/demo/src/app/demos/sources/dash-source/*` в рабочую страницу по образцу HLS-демо:

- `providers: [VideoService]`;
- `<video ngxVideo [ngxDashSource]="src" [autoplay]="autoplay()" ...>`;
- публичный DASH-поток: `https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd` (проверен, 7 уровней 180–1080p); если недоступен — `https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd` или другой публичный манифест;
- привязка `(levelsChange)`, `(levelChange)`, `(error)`, `[level]`, `[enabled]`, `[autoplay]`;
- кнопка Play/Pause;
- `<select>` качества: «Auto» + уровни из `levelsChange`, значение — `id` уровня; выбор обновляет локальный сигнал `level`, который уходит в `[level]`;
- статус `state`, `currentTime`, количество уровней и текущий уровень;
- текст ошибки, если `error` есть;
- таблица «Что делает директива»: URL, autoplay, enabled, level, outputs;
- три блока `CodeSnippetComponent`: базовая разметка, уровни и выбор качества, ошибки/autoplay/SSR;
- в `demo-registry.ts` статус `ready`.

## Документация

- README кирпича рядом с директивой: назначение и границы, импорт, использование, входы, выходы, установка `dashjs`, отсутствие native fallback, маппинг уровней и ошибок, очистка, SSR, коллизия `error`.
- `projects/sources/README.md` — таблица кирпичей: `DashSourceDirective` → готов (ссылка), `QualitySwitcherComponent` → planned.
- `docs/architecture.md` — раздел 18: добавить описание `DashSourceDirective` (dash.js, MSE-only, уровни/ошибки, отсутствие UI и управления `VideoService`), HLS-часть не переписывать.
- `docs/roadmap.md` — Спринт 6: второй пункт `[x]`, матрица 19 → `✅`; следующим идёт `QualitySwitcherComponent`.
- `docs/journal.md` — запись о кирпиче.
- `CONTEXT.md` — «Сейчас», решения Спринта 6, следующий шаг (`QualitySwitcherComponent`).
- `README.md` — строка `@erst_dev/ngx-video-sources` в таблице пакетов: `HlsSourceDirective`, `DashSourceDirective` (готовы), QualitySwitcher.

## Ограничения

- Angular 22, standalone, signals, `input()`/`output()`, OnPush.
- Без новых зависимостей, кроме `dashjs`; без тестов.
- Публичный API `core` не менять; если не хватает метода `VideoService` — остановись и спроси.
- Никакого `fetch`/`HttpClient` для манифеста: загрузку делает dash.js.
- Не управлять UI, не добавлять `QualitySwitcher` и HLS-функциональность.
- `HlsSourceDirective` не менять (кроме, при необходимости, реэкспорта в барреле).
- Документация и комментарии — на русском.
- Интерфейсы/типы — в `interfaces/`, константы — в `constants/`, чистые функции — в `utils/`.

## Готово, когда

- [ ] `dashjs` добавлен в peerDependencies пакета и devDependencies корня; lock обновлён через `npm install`.
- [ ] `DashSourceDirective`, constants, utils, interfaces и баррелы реализованы.
- [ ] README кирпича и README пакета обновлены; корневой README обновлён.
- [ ] Демо-страница `ready` с живым DASH, выбором качества и «Код примера».
- [ ] `docs/architecture.md`, `docs/roadmap.md`, `docs/journal.md`, `CONTEXT.md` обновлены.
- [ ] `npx prettier --check` по изменённым файлам, `npx nx lint sources`, `npx nx lint demo`, `npx nx build sources`, `npx nx build demo` зелёные.
- [ ] Демо проверено в браузере: поток играет, уровни приходят, качество переключается, autoplay/enabled работают, ошибок в консоли нет. Удобно поднять `npx nx serve-static demo --port=4300` и открыть `/sources/dash-source`.
- [ ] Коммит и push в оба remote после зелёных проверок (`git push origin master` уходит и в GitHub, и в GitLab; сверить `git ls-remote origin master` и `git ls-remote gitlab master`).
