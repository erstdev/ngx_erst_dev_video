# Деплой сайта

Черновик к шагу 2: VPS и домен покупаются в декабре, конфиг пока не применяется.
Файл фиксирует, что именно нужно настроить, чтобы не отлаживать это на сервере.

Сайт — статика из `dist/apps/demo/browser`: `index.html`, хешированные JS/CSS,
`favicon.ico`, `docs-content/*.json` и `404.html` (копия `index.html`, её создаёт
сборка).

## Что важно

- `baseHref=/`: сайт живёт в корне домена, а не в подпапке. Все маршруты клиентские:
  файлов `en/docs/...` на диске нет.
- **SPA-fallback:** на неизвестный путь сервер отдаёт `index.html`, иначе глубокая
  ссылка и F5 дают 404 — приложение не успевает загрузиться.
- **Fallback только для страниц:** `docs-content/*.json`, `main-*.js`, `styles-*.css`
  и другие файлы должны отдаваться как файлы, а отсутствующие — честным 404. Если
  вернуть на них `index.html`, `fetch` получит HTML вместо JSON.
- `index.html` не кешируем (он ссылается на новые хеши), хешированные ассеты — надолго.

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
curl -I https://example.com/                                  # 200, index.html
curl -I https://example.com/en/docs                           # 200, index.html (fallback)
curl -I https://example.com/en/docs/controls/play-button/api  # 200, fallback
curl -I https://example.com/docs-content/en/core.json         # 200, application/json
curl -I https://example.com/docs-content/en/missing.json      # 404
curl -I https://example.com/no-such-page                      # 200, index.html (SPA)
```

Локально то же самое проверяется через `npx nx run demo:serve-static --port=4300`:
цель запускается с `"spa": true`.

## Что осталось на декабрь

- HTTPS: Caddy получает сертификат сам, для nginx — certbot.
- Домен и `SITE_URL`, DNS на IP VPS.
- Деплой из CI по SSH/rsync; на сервере только статика.
- Проверить после включения HTTPS все маршруты и глубокие ссылки.
