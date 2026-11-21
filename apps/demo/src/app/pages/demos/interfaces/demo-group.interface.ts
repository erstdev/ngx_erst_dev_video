import type { DemoEntry } from './demo-entry.interface';
import type { DemoGroupId } from '../types/demo-group-id.type';

/** Пакет сайта: группа кирпичей с общим README. */
export interface DemoGroup {
  readonly id: DemoGroupId;
  readonly title: string;
  readonly pkg: string;
  /** Маршрут README пакета без локали: `docs/<пакет>`. */
  readonly docsPath: string;
  /** Платный пакет (capture). */
  readonly pro?: boolean;
  readonly demos: readonly DemoEntry[];
}
