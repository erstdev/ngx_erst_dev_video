/** BOM в начале файла WebVTT. */
export const VTT_BOM_PATTERN = /^\uFEFF/;

/** Переносы строк: CRLF и CR приводим к LF. */
export const VTT_LINE_BREAK_PATTERN = /\r\n?/g;

/** Заголовок файла WebVTT. */
export const VTT_HEADER = 'WEBVTT';

/** Строка заголовка WebVTT, включая необязательное пояснение после него. */
export const VTT_HEADER_PATTERN = new RegExp(`^${VTT_HEADER}[^\\n]*(?:\\n|$)`);

/** Разделитель начала и конца cue. */
export const VTT_TIMESTAMP_SEPARATOR = '-->';

/** Пустая строка между блоками, в том числе с пробелами. */
export const VTT_BLOCK_SEPARATOR_PATTERN = /\n[ \t]*\n/;

/** Блоки, которые в этом кирпиче пропускаются. */
export const VTT_SKIPPABLE_BLOCK_PATTERN = /^(?:NOTE(?:\s|$)|STYLE$|REGION$)/;

/** Таймстемп WebVTT: `mm:ss.mmm` или `hh:mm:ss.mmm`. */
export const VTT_TIMESTAMP_PATTERN =
  /^(?:(\d{2,}):)?([0-5]\d):([0-5]\d)\.(\d{3})$/;

/** Пробелы между таймстемпом и настройками cue. */
export const VTT_WHITESPACE_PATTERN = /\s+/;

/** HTML-теги в тексте cue. */
export const VTT_TAG_PATTERN = /<[^>]*>/g;

/** Базовые сущности, которые декодируются в тексте cue. */
export const VTT_ENTITY_PATTERN = /&(?:amp|lt|gt|nbsp|quot|#39);/g;

/** Карта декодирования базовых сущностей. */
export const VTT_ENTITIES: Readonly<Record<string, string>> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': '\u00a0',
  '&quot;': '"',
  '&#39;': "'",
};
