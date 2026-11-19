import type { HlsInstance } from './hls-instance.interface';

/** Конструктор, который приходит из динамического импорта `hls.js`. */
export interface HlsConstructor {
  new (): HlsInstance;
  isSupported(): boolean;
}
