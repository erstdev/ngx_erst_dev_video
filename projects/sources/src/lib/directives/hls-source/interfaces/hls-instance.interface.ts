import type { HlsHandler } from './hls-handler.type';
import type { HlsLevelLike } from './hls-level.interface';

/** Минимальная часть API экземпляра hls.js, которая нужна директиве. */
export interface HlsInstance {
  readonly levels: readonly HlsLevelLike[];
  readonly manualLevel: number;
  currentLevel: number;
  attachMedia(media: HTMLMediaElement): void;
  loadSource(url: string): void;
  on(event: string, handler: HlsHandler): void;
  off(event: string, handler: HlsHandler): void;
  destroy(): void;
}
