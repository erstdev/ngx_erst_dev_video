import type { DemoStatus } from '../demo-registry';
import type { UiKey } from '../../i18n/ui-strings';

/** Ключи UI-строк для статусов кирпичей. */
export const DEMO_STATUS_KEYS: Readonly<Record<DemoStatus, UiKey>> = {
  ready: 'statusReady',
  wip: 'statusWip',
  planned: 'statusPlanned',
};
