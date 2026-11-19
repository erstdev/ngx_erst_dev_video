# Референсы, ссылки, авторство

> Справочник. Читать при выборе API-ориентира или подготовке публикации.

## 12. Референсы и аналоги

### Плохие примеры (чему не подражать)

- **Video.js** — тяжёлый монолит, jQuery-наследие, сложная кастомизация.
- **Shaka Player** — мощный, но кривая типизация для Angular, React-центричный.

### Хорошие примеры (вдохновение)

- **Vidstack** — headless-подход в вебе, чистая архитектура.
- **Radix UI** (React) — эталон «кирпичной» философии, доступность из коробки.
- **Angular CDK** — пример headless-примитивов в Angular, API-дизайн.
- **Spartan UI** — Angular-порт идей Radix, минималистичный подход.

### Что вдохновляет в их API

- Каждый компонент работает сам по себе, но легко комбинируется.
- Стилизация — через CSS-переменные + слоты (`ng-template`).
- Доступность (a11y) — не опция, а часть API.
- Ноль зависимостей от других UI-библиотек.

---

## 13. Полезные ссылки

### Angular

- [Angular Standalone Components](https://angular.dev/guide/components)
- [Angular Signals](https://angular.dev/guide/signals)
- [Signal inputs](https://angular.dev/guide/signals/inputs)
- [toSignal / toObservable](https://angular.dev/api/core/rxjs-interop)

### RxJS

- [RxJS Operators](https://rxjs.dev/guide/operators)
- [takeUntilDestroyed](https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed)

### Media API

- [MDN: HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)
- [MDN: Media Source Extensions](https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API)
- [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)
- [WebVTT](https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API)

### Инструменты

- [Nx Docs](https://nx.dev)
- [ng-packagr](https://github.com/ng-packagr/ng-packagr)
- [semver.org](https://semver.org/lang/ru/)

---

## 16. Авторство и лицензия

**Автор:** erst_dev
**GitHub:** https://github.com/erst_dev
**npm scope:** `@erst_dev`
**Лицензия:** MIT

Все пакеты экосистемы публикуются под MIT. Файл `LICENSE` в корне репозитория
распространяется на все пакеты.

---
