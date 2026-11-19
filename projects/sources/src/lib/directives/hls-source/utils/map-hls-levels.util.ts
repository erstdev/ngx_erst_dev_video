import type { QualityInterface } from '@erst_dev/ngx-video-core';

import type { HlsLevelLike } from '../interfaces';

/**
 * Переводит уровни hls.js в публичные `QualityInterface`.
 *
 * - `label` — высота кадра (`720p`), иначе `name` из манифеста, иначе
 *   `Уровень N`;
 * - `id` — `name` из манифеста, иначе `<height>p`, иначе `level-<index>`.
 *   Если такой `id` уже занят, к нему добавляется `-<index>`: идентификатор
 *   остаётся уникальным для `<select>` и входа `level`.
 *
 * Уровня «auto» в списке нет: автоматический выбор — это `null` во входе
 * `level` и в выходе `levelChange`.
 */
export function mapHlsLevels(
  levels: readonly HlsLevelLike[],
): readonly QualityInterface[] {
  const usedIds = new Set<string>();

  return levels.map((level, index) => {
    const width = toPositiveInteger(level.width);
    const height = toPositiveInteger(level.height);
    const bitrate = toPositiveInteger(level.bitrate);
    const name = typeof level.name === 'string' ? level.name.trim() : '';
    const baseId = name.length > 0 ? name : toFallbackId(height, index);
    const id = usedIds.has(baseId) ? `${baseId}-${index}` : baseId;

    usedIds.add(id);

    return {
      id,
      label: toLabel(height, name, index),
      width: width ?? undefined,
      height: height ?? undefined,
      bitrate: bitrate ?? undefined,
    };
  });
}

/** Возвращает положительное целое или `null` для отсутствующего значения. */
function toPositiveInteger(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : null;
}

/** Идентификатор уровня по высоте кадра, иначе по индексу. */
function toFallbackId(height: number | null, index: number): string {
  return height === null ? `level-${index}` : `${height}p`;
}

/** Подпись уровня для интерфейса. */
function toLabel(height: number | null, name: string, index: number): string {
  if (height !== null) {
    return `${height}p`;
  }

  return name.length > 0 ? name : `Уровень ${index + 1}`;
}
