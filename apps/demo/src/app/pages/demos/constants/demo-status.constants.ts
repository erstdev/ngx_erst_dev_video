import type { UiKey } from '../../../i18n/types/ui-key.type';
import type { DemoStatus } from '../types/demo-status.type';

/** Ключи UI-строк для статусов кирпичей. */
export const DEMO_STATUS_KEYS: Readonly<Record<DemoStatus, UiKey>> = {
  ready: 'statusReady',
  wip: 'statusWip',
  planned: 'statusPlanned',
};
