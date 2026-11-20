/** Сигнатура GIF89a в начале файла. */
export const GIF_HEADER = 'GIF89a';

/** Признак конца GIF-потока. */
export const GIF_TRAILER = 0x3b;

/** Вводный байт расширения. */
export const GIF_EXTENSION_INTRODUCER = 0x21;

/** Метка Graphic Control Extension. */
export const GIF_GRAPHIC_CONTROL_LABEL = 0xf9;

/** Метка Application Extension (в ней живёт Netscape loop). */
export const GIF_APPLICATION_LABEL = 0xff;

/** Идентификатор приложения Netscape для зацикливания. */
export const GIF_NETSCAPE_ID = 'NETSCAPE2.0';

/** Разделитель изображения — начало кадра. */
export const GIF_IMAGE_SEPARATOR = 0x2c;

/**
 * Упакованный байт Logical Screen Descriptor: глобальная палитра включена,
 * глубина цвета 8 бит, палитра на 256 цветов.
 */
export const GIF_LOGICAL_SCREEN_PACKED = 0b1111_0111;

/** Упакованный байт Image Descriptor: локальной палитры нет, без чересстрочности. */
export const GIF_IMAGE_PACKED = 0x00;

/** Упакованный байт Graphic Control Extension: без прозрачности и disposal. */
export const GIF_GRAPHIC_CONTROL_PACKED = 0x00;

/** Размер глобальной палитры GIF. */
export const GIF_PALETTE_SIZE = 256;

/** Уровней красного канала в палитре 3-3-2. */
export const GIF_PALETTE_RED_LEVELS = 8;

/** Уровней зелёного канала в палитре 3-3-2. */
export const GIF_PALETTE_GREEN_LEVELS = 8;

/** Уровней синего канала в палитре 3-3-2. */
export const GIF_PALETTE_BLUE_LEVELS = 4;

/** Минимальный размер LZW-кода: 8 бит на индекс палитры. */
export const GIF_LZW_MIN_CODE_SIZE = 8;

/** Предел словаря LZW: после него отправляется clear code. */
export const GIF_LZW_MAX_CODE = 4096;

/** Максимальная разрядность LZW-кода. */
export const GIF_LZW_MAX_CODE_SIZE = 12;

/** Максимальный размер блока данных GIF. */
export const GIF_SUB_BLOCK_SIZE = 255;

/** Минимальная задержка кадра в сотых секунды: 2 — предел большинства плееров. */
export const GIF_MIN_DELAY_CENTISECONDS = 2;

/** MIME-тип результата GIF. */
export const GIF_MIME_TYPE = 'image/gif';
