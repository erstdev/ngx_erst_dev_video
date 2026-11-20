# Временные патчи зависимостей

Патчи применяются автоматически: `patch-package` вызывается из скрипта `postinstall`
в корневом `package.json` (в том числе при `npm ci` в CI).

**Правило:** каждый файл здесь — это костыль. Патч живёт только до фикса в апстриме;
после обновления зависимости его нужно снять (см. «Когда убрать»).

---

## `nx+24.1.0-beta.2.patch` — временный костыль под Angular 22.3

**Статус:** костыль, убрать после релиза Nx с исправлением.

**Проблема.** Angular 22.3 добавил поле `exports` в `@angular-devkit/architect`
(в 22.1 и 22.2 его не было). Из-за этого подпуть
`@angular-devkit/architect/node/index.js` больше не резолвится — Node бросает
`ERR_PACKAGE_PATH_NOT_EXPORTED`. Nx (включая 24.1.0-beta.2) импортирует именно этот
подпуть в `nx/dist/src/adapter/ngcli-adapter.js`, поэтому падают любые targets на
Angular-CLI-билдерах: `demo:build`, `demo:serve`.

Симптом:

```
NX   Package subpath './node/index' is not defined by "exports" in
     .../node_modules/@angular-devkit/architect/package.json
```

**Что делает патч.** Меняет один импорт в `ngcli-adapter.js`:

```diff
- '@angular-devkit/architect/node/index.js'
+ '@angular-devkit/architect/node'
```

Поведение то же: `./node` в `exports` пакета указывает на тот же `node/index.js`.

**Апстрим:** [nrwl/nx#37955](https://github.com/nrwl/nx/issues/37955).

**Когда убрать.**

1. Дождаться релиза Nx с исправлением (следить за issue выше).
2. Обновить `nx` и `@nx/*`.
3. Удалить `patches/nx+*.patch`, devDependency `patch-package` и скрипт `postinstall`.
4. Проверить сборку демо: `npx nx build demo` должен быть зелёным без патча.

Если после обновления Nx `patch-package` падает с ошибкой применения —
значит, файл уже изменился в новой версии: проверить, есть ли фикс, и снять патч.
