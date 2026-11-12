/*
 * Каждый компонент живёт в собственной папке со своим `index.ts`-баррелом.
 * Слой реэкспортирует только папки, а не файлы напрямую.
 */

export * from './play-button';
export * from './time-display';
export * from './volume-slider';
