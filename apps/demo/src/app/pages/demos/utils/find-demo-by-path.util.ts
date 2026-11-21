import type { DemoMatch } from '../interfaces/demo-match.interface';
import { DEMO_GROUPS } from '../constants/demo-groups.constants';

/** Кирпич по пути примера (`controls/play-button`). */
export function findDemoByPath(path: string): DemoMatch | undefined {
  for (const group of DEMO_GROUPS) {
    const demo = group.demos.find((entry) => entry.path === path);
    if (demo) return { group, demo };
  }

  return undefined;
}
