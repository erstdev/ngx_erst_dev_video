import type {
  DashLevelViewInterface,
  DashRepresentationInterface,
} from '../interfaces';

/**
 * Переводит представления dash.js в публичные `QualityInterface` и запоминает
 * индекс каждого уровня в списке `getRepresentationsByType('video')`.
 *
 * - `label` — высота кадра (`720p`), иначе `id` представления, иначе
 *   `Уровень N`;
 * - `id` — `id` представления, иначе `<height>p`, иначе `level-<index>`.
 *   Если такой `id` уже занят, к нему добавляется `-<index>`: идентификатор
 *   остаётся уникальным для `<select>` и входа `level`;
 * - `bitrate` — `bandwidth` в битах в секунду, иначе `bitrateInKbit * 1000`.
 *
 * Уровня «auto» в списке нет: автоматический выбор — это `null` во входе
 * `level` и выходе `levelChange`.
 */
export function mapDashLevels(
  representations: readonly DashRepresentationInterface[],
): readonly DashLevelViewInterface[] {
  const usedIds = new Set<string>();

  return representations.map((representation, index) => {
    const width = toPositiveInteger(representation.width);
    const height = toPositiveInteger(representation.height);
    const bitrate =
      toPositiveInteger(representation.bandwidth) ??
      toBitrateFromKbit(representation.bitrateInKbit);
    const representationId = toRepresentationId(representation);
    const baseId =
      representationId.length > 0
        ? representationId
        : toFallbackId(height, index);
    const id = usedIds.has(baseId) ? `${baseId}-${index}` : baseId;

    usedIds.add(id);

    return {
      quality: {
        id,
        label: toLabel(height, representationId, index),
        width: width ?? undefined,
        height: height ?? undefined,
        bitrate: bitrate ?? undefined,
      },
      qualityIndex: index,
      representationId,
    };
  });
}

/** Находит уровень по публичному `id` из входа `level`. */
export function findDashLevelById(
  levels: readonly DashLevelViewInterface[],
  id: string,
): DashLevelViewInterface | null {
  return levels.find((level) => level.quality.id === id) ?? null;
}

/**
 * Находит уровень по представлению из события `QUALITY_CHANGE_RENDERED`.
 *
 * Сопоставление идёт по исходному `id` представления, а не по публичному `id`:
 * публичный идентификатор может быть дополнен индексом при совпадении.
 */
export function findDashLevelByRepresentation(
  levels: readonly DashLevelViewInterface[],
  representation: DashRepresentationInterface | null | undefined,
): DashLevelViewInterface | null {
  if (!representation) {
    return null;
  }

  const id = toRepresentationId(representation);

  return levels.find((level) => level.representationId === id) ?? null;
}

/** Идентификатор представления без пробелов по краям; пустая строка, если нет. */
function toRepresentationId(
  representation: DashRepresentationInterface,
): string {
  return typeof representation.id === 'string' ? representation.id.trim() : '';
}

/** Возвращает положительное целое или `null` для отсутствующего значения. */
function toPositiveInteger(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : null;
}

/** Битрейт из килобит в секунду в биты в секунду. */
function toBitrateFromKbit(value: number | undefined): number | null {
  const kbit = toPositiveInteger(value);

  return kbit === null ? null : kbit * 1000;
}

/** Идентификатор уровня по высоте кадра, иначе по индексу. */
function toFallbackId(height: number | null, index: number): string {
  return height === null ? `level-${index}` : `${height}p`;
}

/** Подпись уровня для интерфейса. */
function toLabel(
  height: number | null,
  representationId: string,
  index: number,
): string {
  if (height !== null) {
    return `${height}p`;
  }

  return representationId.length > 0
    ? representationId
    : `Уровень ${index + 1}`;
}
