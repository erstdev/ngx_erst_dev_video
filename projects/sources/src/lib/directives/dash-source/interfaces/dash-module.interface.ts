import type { DashPlayerInterface } from './dash-player.interface';

/** Фабрика player'а в динамическом импорте dash.js. */
export interface DashPlayerFactoryInterface {
  create(): DashPlayerInterface;
}

/**
 * Форма модуля `dashjs` из динамического импорта.
 *
 * В ESM-сборке нужные сущности лежат и в named-экспортах, и в `default`,
 * поэтому директива поддерживает оба варианта: сначала берёт named-экспорт,
 * затем `default`.
 */
export interface DashModuleInterface {
  readonly MediaPlayer?: () => DashPlayerFactoryInterface;
  readonly supportsMediaSource?: () => boolean;
  readonly default?: DashModuleInterface;
}
