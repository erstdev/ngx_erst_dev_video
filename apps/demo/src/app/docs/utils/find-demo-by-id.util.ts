import type { DemoEntry } from '../../interfaces/demo-entry.interface';
import { findDemoGroup } from './find-demo-group.util';

/** Кирпич по id группы и id кирпича. */
export function findDemoById(
  groupId: string,
  demoId: string,
): DemoEntry | undefined {
  return findDemoGroup(groupId)?.demos.find((demo) => demo.id === demoId);
}
