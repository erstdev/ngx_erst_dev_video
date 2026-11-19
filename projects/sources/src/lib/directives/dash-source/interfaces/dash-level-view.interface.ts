import type { QualityInterface } from '@erst_dev/ngx-video-core';

/**
 * Внутренняя view-модель уровня DASH.
 *
 * Связывает публичный `QualityInterface` с позицией в списке
 * `getRepresentationsByType('video')` (её принимает
 * `setRepresentationForTypeByIndex`) и с исходным `id` представления (по нему
 * событие `QUALITY_CHANGE_RENDERED` сопоставляется с уровнем). Параллельных
 * массивов уровней и индексов нет: источник истины — один список view-моделей.
 */
export interface DashLevelViewInterface {
  readonly quality: QualityInterface;
  readonly qualityIndex: number;
  readonly representationId: string;
}
