# ngx-video

Headless-библиотеки для видео-плеера в Angular. Не монолит, а набор «кирпичей»:
каждый пакет решает одну задачу, не навязывает разметку и стили и собирается в плеер
любой сложности — от одной кнопки Play до собственного таймлайна с превью кадров.

Философия проекта:

- **Один кирпич — один npm-пакет.**
- **Состояние — сигналы, потоки — RxJS.** Публичный API сервисов существует в двух
  представлениях, всегда согласованных.
- **Стилизация без навязывания.** CSS-переменные, `customClass` и `ng-template` вместо
  жёстких стилей.
- **Доступность — часть API**, а не опция.

## Пакеты

| Пакет                          | Версия | Статус      | Что внутри                                                                                                                                        |
| ------------------------------ | ------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@erst_dev/ngx-video-core`     | 0.0.1  | ✅ готов    | `VideoService`, `VideoDirective`, типы состояния, `formatTime`                                                                                    |
| `@erst_dev/ngx-video-controls` | 0.0.1  | ✅ готов    | `PlayButtonComponent`, `VolumeSliderComponent`, `TimeDisplayComponent`, `FullscreenButtonComponent`, `BufferingIndicatorComponent`                |
| `@erst_dev/ngx-video-timeline` | 0.0.1  | ✅ готов    | `TimelineComponent`, `TimelinePreviewComponent`, `ChapterMarkersComponent`                                                                        |
| `@erst_dev/ngx-video-extras`   | 0.0.1  | 🚧 в работе | `ClickToPlayOverlayComponent`, `ErrorDisplayComponent`, `SpeedControlComponent`, `KeyboardShortcutsDirective` (готовы), Gesture, SubtitleRenderer |
| `@erst_dev/ngx-video-sources`  | 0.0.1  | 🚧 в работе | `HlsSourceDirective`, `DashSourceDirective` (готовы), QualitySwitcher                                                                             |
| `@erst_dev/ngx-video-capture`  | —      | 💰 PRO      | CaptureService, ScreenshotButton, ClipRecorder                                                                                                    |

Пакеты пока не опубликованы в npm: версия `0.0.1` — рабочая. Внутри монорепо они
подключаются через `paths` в `tsconfig.base.json`.

## Требования

- **Angular 22+**, **RxJS 7.8+** — для использования пакетов.
- **Node 22+**, **npm 10+** — для разработки.
- **Nx 23** — сборка и запуск задач.

## Разработка

```sh
npm install

npm start          # демо-песочница в watch-режиме (nx serve demo)
npm run build:all  # сборка всех пакетов
npm run lint       # линт всех проектов
npm run verify     # lint + build по всем проектам
```

### Скрипты

| Скрипт                                     | Что делает                                                       |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `npm start`                                | dev-сервер демо-песочницы                                        |
| `npm run build`                            | сборка демо-приложения                                           |
| `npm run build:all`                        | сборка всех проектов (`nx run-many --target=build`)              |
| `npm run lint` / `npm run lint:all`        | линт всех проектов                                               |
| `npm run lint:fix`                         | линт с автоисправлениями                                         |
| `npm run lint-staged:fix`                  | линт и фиксы только для staged-файлов (`lint-staged --relative`) |
| `npm run affected:build` / `affected:lint` | задачи только для затронутых проектов                            |
| `npm run format:check` / `format:write`    | проверка и применение Prettier                                   |
| `npm run verify`                           | `lint + build` по всем проектам                                  |
| `npm run verify:affected`                  | `lint + build` только для затронутых                             |

Полезные команды Nx напрямую:

```sh
npx nx build core
npx nx build controls
npx nx lint controls
npx nx graph                 # граф проектов
npx nx show project controls # список целей проекта
```

Pre-commit-хук (`husky` + `lint-staged`) прогоняет линтер только по staged-файлам
через `nx affected --target=lint --fix --files`.

## Структура репозитория

```
ngx-erst-dev-video/
├── projects/
│   ├── core/          ← @erst_dev/ngx-video-core
│   ├── controls/      ← @erst_dev/ngx-video-controls
│   ├── extras/        ← @erst_dev/ngx-video-extras
│   ├── sources/       ← @erst_dev/ngx-video-sources
│   └── timeline/      ← @erst_dev/ngx-video-timeline
├── apps/
│   └── demo/          ← песочница с живыми примерами (документация не ведётся)
├── CONTEXT.md         ← рабочий документ проекта (не версионируется)
├── nx.json
├── tsconfig.base.json ← paths пакетов для локальной разработки
└── package.json
```

Каждый пакет устроен одинаково: слои `components/`, `directives/`, `services/`,
`types/`, `utils/` внутри `src/lib`, баррелы `index.ts` и публичный API через
`src/index.ts`. Подробнее — в README соответствующих пакетов.

## Документация

- [@erst_dev/ngx-video-core](projects/core/README.md) — сервис, директива, типы, утилиты.
- [@erst_dev/ngx-video-controls](projects/controls/README.md) — готовые контролы плеера.
- [@erst_dev/ngx-video-extras](projects/extras/README.md) — дополнительные кирпичи: оверлей первого запуска и другие.
- [@erst_dev/ngx-video-sources](projects/sources/README.md) — источники потокового видео: HLS через hls.js и DASH через dash.js.
- [@erst_dev/ngx-video-timeline](projects/timeline/README.md) — таймлайн, превью кадров и главы.
- [docs/](docs/README.md) — архитектура, соглашения, roadmap, журнал и workflow.
- `CONTEXT.md` — короткая локальная точка входа для нового чата. В git не входит;
  подробности вынесены в `docs/`.

## Лицензия

MIT. Файл [LICENSE](LICENSE) распространяется на все пакеты экосистемы.

Автор: erst_dev.
