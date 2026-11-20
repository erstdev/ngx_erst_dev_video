import {
  GIF_PALETTE_BLUE_LEVELS,
  GIF_PALETTE_GREEN_LEVELS,
  GIF_PALETTE_RED_LEVELS,
  GIF_PALETTE_SIZE,
} from '../../constants';

/** Сдвиг красного канала в индексе палитры 3-3-2. */
const RED_SHIFT = 5;

/** Сдвиг зелёного канала в индексе палитры 3-3-2. */
const GREEN_SHIFT = 2;

/** Значение канала для уровня палитры: уровни равномерно покрывают 0..255. */
function channelValue(level: number, maxLevel: number): number {
  return Math.round((level * 255) / maxLevel);
}

/** Глобальная палитра 3-3-2: 256 цветов, по 3/3/2 бита на канал. */
export const GIF_PALETTE: Uint8Array = createPalette();

/** Ближайший уровень канала для каждого входного значения 0..255. */
const RED_LEVELS = createChannelLevels(GIF_PALETTE_RED_LEVELS);
const GREEN_LEVELS = createChannelLevels(GIF_PALETTE_GREEN_LEVELS);
const BLUE_LEVELS = createChannelLevels(GIF_PALETTE_BLUE_LEVELS);

/** Собирает таблицу уровней палитры в порядке 3-3-2. */
function createPalette(): Uint8Array {
  const palette = new Uint8Array(GIF_PALETTE_SIZE * 3);

  for (let index = 0; index < GIF_PALETTE_SIZE; index += 1) {
    const red = (index >> RED_SHIFT) & (GIF_PALETTE_RED_LEVELS - 1);
    const green = (index >> GREEN_SHIFT) & (GIF_PALETTE_GREEN_LEVELS - 1);
    const blue = index & (GIF_PALETTE_BLUE_LEVELS - 1);

    palette[index * 3] = channelValue(red, GIF_PALETTE_RED_LEVELS - 1);
    palette[index * 3 + 1] = channelValue(green, GIF_PALETTE_GREEN_LEVELS - 1);
    palette[index * 3 + 2] = channelValue(blue, GIF_PALETTE_BLUE_LEVELS - 1);
  }

  return palette;
}

/**
 * Таблица «значение канала → ближайший уровень».
 *
 * Палитра равномерная, поэтому минимум суммы квадратов по каналам совпадает
 * с минимумом по каждому каналу отдельно: это и есть ближайший цвет.
 */
function createChannelLevels(levels: number): Uint8Array {
  const maxLevel = levels - 1;
  const table = new Uint8Array(256);

  for (let value = 0; value < 256; value += 1) {
    let bestLevel = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let level = 0; level <= maxLevel; level += 1) {
      const distance = Math.abs(value - channelValue(level, maxLevel));

      if (distance < bestDistance) {
        bestDistance = distance;
        bestLevel = level;
      }
    }

    table[value] = bestLevel;
  }

  return table;
}

/** Индекс ближайшего цвета палитры для RGB. */
export function findNearestColorIndex(
  red: number,
  green: number,
  blue: number,
): number {
  return (
    (RED_LEVELS[red] << RED_SHIFT) |
    (GREEN_LEVELS[green] << GREEN_SHIFT) |
    BLUE_LEVELS[blue]
  );
}

/** Переводит RGBA-пиксели Canvas в индексы глобальной палитры. */
export function toIndexedPixels(rgba: Uint8ClampedArray): Uint8Array {
  const pixelCount = Math.floor(rgba.length / 4);
  const pixels = new Uint8Array(pixelCount);

  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const offset = pixel * 4;

    pixels[pixel] = findNearestColorIndex(
      rgba[offset],
      rgba[offset + 1],
      rgba[offset + 2],
    );
  }

  return pixels;
}
