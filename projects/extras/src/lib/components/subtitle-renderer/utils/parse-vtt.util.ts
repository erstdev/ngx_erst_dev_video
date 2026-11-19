import {
  VTT_BLOCK_SEPARATOR_PATTERN,
  VTT_BOM_PATTERN,
  VTT_ENTITIES,
  VTT_ENTITY_PATTERN,
  VTT_HEADER_PATTERN,
  VTT_LINE_BREAK_PATTERN,
  VTT_SKIPPABLE_BLOCK_PATTERN,
  VTT_TAG_PATTERN,
  VTT_TIMESTAMP_PATTERN,
  VTT_TIMESTAMP_SEPARATOR,
  VTT_WHITESPACE_PATTERN,
} from '../constants';
import type { SubtitleCueInterface } from '../interfaces';

/** Декодирует базовые сущности, остальные оставляет как есть. */
const decodeEntities = (text: string): string =>
  text.replace(VTT_ENTITY_PATTERN, (entity) => VTT_ENTITIES[entity] ?? entity);

/** Убирает HTML-теги, затем декодирует сущности. */
const normalizeText = (text: string): string =>
  decodeEntities(text.replace(VTT_TAG_PATTERN, ''));

/** Переводит таймстемп в секунды; `null` — если формат неверный. */
const parseTimestamp = (value: string): number | null => {
  const match = VTT_TIMESTAMP_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const [, hours, minutes, seconds, milliseconds] = match;

  return (
    Number(hours ?? 0) * 3600 +
    Number(minutes) * 60 +
    Number(seconds) +
    Number(milliseconds) / 1000
  );
};

/** Разбирает один блок; `null` — если блок некорректный или служебный. */
const parseBlock = (block: string): SubtitleCueInterface | null => {
  const lines = block.split('\n');
  const firstLine = (lines[0] ?? '').trim();

  if (!firstLine || VTT_SKIPPABLE_BLOCK_PATTERN.test(firstLine)) {
    return null;
  }

  const timingIndex = lines[0]?.includes(VTT_TIMESTAMP_SEPARATOR) ? 0 : 1;
  const timingLine = lines[timingIndex];

  if (!timingLine?.includes(VTT_TIMESTAMP_SEPARATOR)) {
    return null;
  }

  const separatorIndex = timingLine.indexOf(VTT_TIMESTAMP_SEPARATOR);
  const start = parseTimestamp(timingLine.slice(0, separatorIndex).trim());
  const endToken = timingLine
    .slice(separatorIndex + VTT_TIMESTAMP_SEPARATOR.length)
    .trim()
    .split(VTT_WHITESPACE_PATTERN)[0];
  const end = endToken ? parseTimestamp(endToken) : null;

  if (start === null || end === null || start >= end) {
    return null;
  }

  const text = lines
    .slice(timingIndex + 1)
    .map((line) => normalizeText(line).trim())
    .join('\n')
    .trim();

  if (!text) {
    return null;
  }

  return { start, end, text };
};

/**
 * Разбирает содержимое WebVTT в список cue.
 *
 * Поддерживаются `mm:ss.mmm` и `hh:mm:ss.mmm`, необязательный идентификатор
 * cue и настройки после таймстемпа. Блоки `NOTE`, `STYLE` и `REGION`, а также
 * некорректные блоки молча пропускаются. Функция чистая и не бросает
 * исключений.
 */
export const parseVtt = (vtt: string): readonly SubtitleCueInterface[] => {
  if (!vtt) {
    return [];
  }

  const normalized = vtt
    .replace(VTT_BOM_PATTERN, '')
    .replace(VTT_LINE_BREAK_PATTERN, '\n')
    .trim();

  if (!normalized) {
    return [];
  }

  const content = normalized.replace(VTT_HEADER_PATTERN, '').trim();
  const cues: SubtitleCueInterface[] = [];

  for (const block of content.split(VTT_BLOCK_SEPARATOR_PATTERN)) {
    const cue = parseBlock(block);

    if (cue) {
      cues.push(cue);
    }
  }

  return cues;
};
