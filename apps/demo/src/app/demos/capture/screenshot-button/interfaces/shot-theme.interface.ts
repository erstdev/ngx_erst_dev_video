import type { ShotThemeId } from '../types/shot-theme-id.type';

/** Пресет оформления кнопки скриншота. */
export interface ShotTheme {
  readonly id: ShotThemeId;
  readonly label: string;
  readonly className: string;
}
