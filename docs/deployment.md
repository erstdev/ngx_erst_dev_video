# Деплой сайта на GitHub Pages

Черновик к шагу 2: хостинг — **GitHub Pages**, бесплатно для публичного
репозитория. Файл фиксирует, что настроить и проверить, чтобы не отлаживать это на
живом сайте.

Сайт — статика из `dist/apps/demo/browser`. Адрес:
`https://erstdev.github.io/ngx_erst_dev_video/`. Проект живёт под подпутём
`/ngx_erst_dev_video/`, домен не покупаем: HTTPS и CDN даёт GitHub, сервер не нужен.

## Что важно

- **Базовый путь.** `baseHref` — `/ngx_erst_dev_video/`, `SITE_URL` —
  `https://erstdev.github.io/ngx_erst_dev_video` без хвостового слэша. Все
  внутренние ссылки, canonical, hreflang, Open Graph и JSON-LD — с подпутём.
- **Завершающий слэш.** Pages отдаёт 301 на `/...` для каталогов, поэтому
  canonical/hreflang/sitemap и ссылки из README нормализуются к виду
  `/en/docs/core/`. Адрес без слэша работает, но получает лишний редирект.
- **Пререндер.** 54 статических страницы с `ng-server-context="ssg"`: главные,
  `/docs`, README пакетов и API — в каждой статья, сайдбар и SEO-теги. Живые демо
  остаются клиентскими, но их каталоги получают shell: прямые ссылки открываются,
  а не отдают 404.
- **404.html.** Pages не умеет rewrite: неизвестный путь отдаёт `404.html` (shell)
  со статусом 404, приложение показывает «не найдено». Для демо-маршрутов это не
  нужно — у них есть `index.html`.
- **Файлы.** `docs-content/*.json` отдаются как `application/json`; отсутствующий
  файл — честный 404, иначе `fetch` получит HTML вместо JSON.
- **Кеш.** Управлять `Cache-Control` на Pages нельзя: `index.html` и хешированные
  ассеты кешируются на усмотрение GitHub (короткий TTL). Для immutable-кеша и
  security-заголовков нужен внешний CDN или свой сервер — для запуска не требуется.
- **Лимиты бесплатного Pages:** публичный репозиторий, 1 ГБ опубликованного сайта,
  100 ГБ трафика в месяц, 10 сборок в час. Наш сайт — около 6 МБ.
- **GitLab-зеркало сайт не деплоит:** Pages настроен только в GitHub, GitLab CI
  остаётся проверками.

## Где живёт адрес

| Место                                           | Что задаёт                                           |
| ----------------------------------------------- | ---------------------------------------------------- |
| `apps/demo/project.json`                        | `baseHref: "/ngx_erst_dev_video/"`                   |
| `apps/demo/src/app/constants/site.constants.ts` | `SITE_URL` и `SITE_BASE`                             |
| `tools/docs/generate.mjs`                       | `SITE_BASE` из окружения — ссылки в README-страницах |
| `docs:pack`                                     | `SITE_URL` из окружения — ссылки в npm-README        |
| workflow `deploy`                               | ничего: готовый `dist` из build-джобы                |

## Сборка

```sh
npm ci
npx nx run demo:build
node tools/site/prepare-static.mjs
```

`prepare-static` обязателен: Angular с серверной точкой входа кладёт SPA-shell
`index.csr.html`, а статике нужен `index.html`. Скрипт копирует shell в корень, в
`404.html` и в каталоги клиентских маршрутов (демо), добавляет `.nojekyll`.
Пререндеренные страницы не трогает. Артефакт деплоя — `dist/apps/demo/browser`,
серверный бандл в прод не уезжает.

Локально Pages эмулирует цель `demo:serve-pages` (появляется в шаге 2): Node-сервер
без зависимостей отдаёт сайт под `/ngx_erst_dev_video/`, каталоги — через
`index.html`, остальное — через `404.html`. Она заменяет `serve-static`, который
отдаёт сайт с базой `/` и для Pages не подходит.

## Деплой

Джоба в GitHub Actions после зелёного `build` — в `ci.yml` или отдельном
`pages.yml`:

```yaml
deploy:
  name: deploy
  needs: [build]
  if: github.event_name == 'push' && github.ref == 'refs/heads/master'
  runs-on: ubuntu-latest
  timeout-minutes: 10
  permissions:
    pages: write
    id-token: write
  environment:
    name: github-pages
    url: ${{ steps.deployment.outputs.page_url }}
  concurrency:
    group: pages
    cancel-in-progress: false
  steps:
    - name: Скачать сборку
      uses: actions/download-artifact@v4
      with:
        name: dist
        path: dist
    - name: Подготовить статику
      run: node tools/site/prepare-static.mjs
    - name: Настроить Pages
      uses: actions/configure-pages@v5
    - name: Загрузить артефакт
      uses: actions/upload-pages-artifact@v3
      with:
        path: dist/apps/demo/browser
    - name: Опубликовать
      id: deployment
      uses: actions/deploy-pages@v4
```

Один раз вручную: Settings → Pages → Build and deployment → Source:
**GitHub Actions**. Секретов и отдельного токена нет; `npm ci` в деплое не нужен —
`dist` приходит из build-джобы, а `prepare-static` использует только Node.

Откат: перезапуск старого запуска workflow (или деплой коммита до правки) —
Pages хранит историю деплоев. GitLab-пайплайн деплой не дублирует.

## Проверка после деплоя

```sh
SITE=https://erstdev.github.io/ngx_erst_dev_video

curl -I "$SITE/"                                  # 200, shell (index.html)
curl -I "$SITE/en/"                               # 200, пререндеренный HTML
curl -I "$SITE/ru/"                               # 200, пререндеренный HTML
curl -I "$SITE/en/docs/"                          # 200, обзор документации
curl -I "$SITE/en/docs/core/"                     # 200, README пакета
curl -I "$SITE/en/docs/controls/play-button/api/" # 200, API-справка
curl -I "$SITE/en/docs/controls/play-button/"     # 200, shell (демо)
curl -I "$SITE/docs-content/en/core.json"         # 200, application/json
curl -I "$SITE/docs-content/en/missing.json"      # 404
curl -I "$SITE/no-such-page"                      # 404 + 404.html (SPA)
curl -I "$SITE/sitemap.xml"                       # 200
curl -I "$SITE/robots.txt"                        # 200
```

Дополнительно:

- canonical в HTML — `https://erstdev.github.io/ngx_erst_dev_video/en/docs/core/`;
- hreflang `en`/`ru`/`x-default` — с подпутём и слэшем;
- в статье — текст README, сайдбар с пакетами, `ng-state` с `docs-index` и
  `docs-page`;
- ссылка без слэша (`/en/docs/core`) даёт 301 на слэш — это нормально, внутренние
  ссылки уже со слэшем;
- в консоли нет ошибок hydration (`NG05xx`).

## Что осталось на потом

- Свой домен (платно): `CNAME` в артефакте, DNS, `baseHref` → `/`, `SITE_URL` без
  подпути, генератор без `SITE_BASE`, 301 со старого адреса. Отдельная задача.
- Кеш и security-заголовки: только внешний CDN или свой сервер.
- GitLab Pages: не нужен, пока зеркало приватное и сайт на GitHub.
