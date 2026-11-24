# Деплой сайта

Черновик к шагу 2: VPS и домен покупаются в декабре, конфиг пока не применяется.
Файл фиксирует, что именно нужно настроить, чтобы не отлаживать это на сервере.

Сайт — статика из `dist/apps/demo/browser`: 54 пререндеренные страницы (главные,
`/docs`, README пакетов и API), SPA-shell `index.csr.html` (его создаёт Angular) и
его копии `index.html` — в корне и в каталогах клиентских маршрутов (демо), после
`nx run demo:prepare-static`; хешированные JS/CSS, `favicon.ico` и
`docs-content/*.json`.

## Что важно

- `baseHref=/`: сайт живёт в корне домена, а не в подпапке.
- **Пререндер:** главные `/en` и `/ru`, `/<локаль>/docs`, README пакетов и API —
  готовый HTML с контентом (`ng-server-context="ssg"`). Живые демо
  (`/<локаль>/docs/<пакет>/<кирпич>`) остаются клиентскими: им нужен браузер.
- **SPA-fallback:** на неизвестный путь сервер отдаёт `index.html` (это shell),
  иначе глубокая ссылка и F5 дают 404 — приложение не успевает загрузиться.
- **Fallback только для страниц:** `docs-content/*.json`, `main-*.js`, `styles-*.css`
  и другие файлы должны отдаваться как файлы, а отсутствующие — честным 404. Если
  вернуть на них `index.html`, `fetch` получит HTML вместо JSON.
- `index.html` не кешируем (он ссылается на новые хеши), хешированные ассеты — надолго.

## Сборка

```sh
npx nx run demo:build          # сборка + пререндер страниц
npx nx run demo:prepare-static # index.csr.html → index.html
```

`prepare-static` обязателен: при наличии серверной точки входа Angular называет
SPA-shell `index.csr.html`, а статике нужен `index.html`. Скрипт копирует shell в
корень и в каталоги клиентских маршрутов: каталог, появившийся ради вложенной
пререндеренной API-страницы, иначе отдаёт листинг или 403 вместо приложения.
Пререндеренные страницы скрипт не трогает. Серверный бандл в прод не уезжает —
деплоится только `browser/`.

## nginx

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    root /var/www/ngx-video;
    index index.html;

    # документация и файлы: отсутствующий файл — это 404, а не index.html
    location ^~ /docs-content/ {
        try_files $uri =404;
    }

    # хешированные ассеты кешируем надолго
    location ~* \.(?:js|css|woff2?|png|jpe?g|gif|svg|ico)$ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    # всё остальное — SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Caddy

```caddy
example.com {
    root * /var/www/ngx-video
    encode gzip

    @files path /docs-content/* *.js *.css *.woff2 *.png *.jpg *.jpeg *.gif *.svg *.ico
    handle @files {
        file_server
    }

    header /index.html Cache-Control "no-cache"

    handle {
        try_files {path} /index.html
        file_server
    }
}
```

## Проверка после деплоя

```sh
curl -I https://example.com/                                  # 200, index.html (shell)
curl -I https://example.com/en                                # 200, пререндеренный HTML
curl -I https://example.com/ru                                # 200, пререндеренный HTML
curl -I https://example.com/en/docs                           # 200, пререндеренный HTML
curl -I https://example.com/en/docs/core                      # 200, README пакета
curl -I https://example.com/en/docs/controls/play-button/api  # 200, API-справка
curl -I https://example.com/en/docs/controls/play-button      # 200, shell (демо)
curl -I https://example.com/docs-content/en/core.json         # 200, application/json
curl -I https://example.com/docs-content/en/missing.json      # 404
curl -I https://example.com/no-such-page                      # 200, index.html (SPA)
```

Локально: `npx nx run demo:serve-static --port=4300` (цель сама собирает сайт,
готовит `index.html` и запускается с `"spa": true`).

## Что осталось на декабрь

- HTTPS: Caddy получает сертификат сам, для nginx — certbot.
- Домен и `SITE_URL`, DNS на IP VPS.
- Деплой из CI по SSH/rsync; на сервере только статика.
- Проверить после включения HTTPS все маршруты и глубокие ссылки.
