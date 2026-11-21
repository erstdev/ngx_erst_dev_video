import type { DemoGroup } from '../../interfaces/demo-group.interface';
import { DEMO_GROUPS } from '../../constants/demo-groups.constants';

/** Группа по id пакета. */
export function findDemoGroup(id: string): DemoGroup | undefined {
  return DEMO_GROUPS.find((group) => group.id === id);
}
