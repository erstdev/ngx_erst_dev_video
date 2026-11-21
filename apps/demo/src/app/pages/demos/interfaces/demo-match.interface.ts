import type { DemoEntry } from './demo-entry.interface';
import type { DemoGroup } from './demo-group.interface';

/** Найденный кирпич вместе с его группой. */
export interface DemoMatch {
  readonly group: DemoGroup;
  readonly demo: DemoEntry;
}
