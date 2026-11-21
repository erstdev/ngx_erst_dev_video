import type { UiKey } from '../../../i18n/types/ui-key.type';
import type { DemoStatus } from '../types/demo-status.type';

/** Один кирпич в реестре сайта. */
export interface DemoEntry {
  /** Идентификатор внутри группы (совпадает с именем каталога демо). */
  readonly id: string;
  /**
   * Путь маршрута примера без ведущего слэша (совпадает с `path` в
   * `app.routes.ts`). Ссылка строится как `'/' + path`: массив команд вида
   * `['/', path]` Angular превращает в один закодированный сегмент (`%2F`)
   * и маршрут не находится.
   */
  readonly path: string;
  /** Маршрут API-справки без локали: `docs/<пакет>` или `docs/<пакет>/<кирпич>`. */
  readonly docsPath: string;
  readonly title: string;
  /** Ключ перевода для заголовков, которые отличаются в локалях. */
  readonly titleKey?: UiKey;
  readonly status: DemoStatus;
}
