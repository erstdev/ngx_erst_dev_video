import {
  GIF_APPLICATION_LABEL,
  GIF_EXTENSION_INTRODUCER,
  GIF_GRAPHIC_CONTROL_LABEL,
  GIF_GRAPHIC_CONTROL_PACKED,
  GIF_HEADER,
  GIF_IMAGE_PACKED,
  GIF_IMAGE_SEPARATOR,
  GIF_LZW_MIN_CODE_SIZE,
  GIF_LOGICAL_SCREEN_PACKED,
  GIF_MIN_DELAY_CENTISECONDS,
  GIF_NETSCAPE_ID,
  GIF_SUB_BLOCK_SIZE,
  GIF_TRAILER,
} from '../../constants';
import type {
  GifEncoderOptionsInterface,
  GifFrameInterface,
} from '../../interfaces';
import { encodeLzw } from './lzw-encoder.util';
import { GIF_PALETTE } from './palette.util';

/**
 * Собирает настоящий GIF89a из кадров с индексированной палитрой.
 *
 * Формат: заголовок, дескриптор экрана, глобальная палитра 3-3-2, необязательный
 * Netscape loop extension, затем для каждого кадра Graphic Control Extension с
 * задержкой и Image Descriptor с LZW-данными. Зависимостей нет: только байты.
 */
export function encodeGif(
  frames: readonly GifFrameInterface[],
  options: GifEncoderOptionsInterface,
): Uint8Array<ArrayBuffer> {
  if (frames.length === 0) {
    throw new Error('GIF: нет кадров для кодирования.');
  }

  const bytes: number[] = [];

  writeAscii(bytes, GIF_HEADER);
  writeWord(bytes, options.width);
  writeWord(bytes, options.height);
  bytes.push(GIF_LOGICAL_SCREEN_PACKED);
  bytes.push(0x00, 0x00);

  for (const value of GIF_PALETTE) {
    bytes.push(value);
  }

  if (options.loop) {
    writeNetscapeLoop(bytes);
  }

  const delay = Math.max(
    GIF_MIN_DELAY_CENTISECONDS,
    Math.round(options.delayCentiseconds),
  );

  for (const frame of frames) {
    if (frame.width !== options.width || frame.height !== options.height) {
      throw new Error('GIF: размер кадра не совпадает с размером полотна.');
    }

    writeGraphicControl(bytes, delay);

    bytes.push(GIF_IMAGE_SEPARATOR);
    writeWord(bytes, 0);
    writeWord(bytes, 0);
    writeWord(bytes, frame.width);
    writeWord(bytes, frame.height);
    bytes.push(GIF_IMAGE_PACKED);
    bytes.push(GIF_LZW_MIN_CODE_SIZE);
    writeSubBlocks(bytes, encodeLzw(frame.pixels, GIF_LZW_MIN_CODE_SIZE));
  }

  bytes.push(GIF_TRAILER);

  return new Uint8Array(bytes);
}

/** Дописывает ASCII-строку — идентификаторы формата пишутся посимвольно. */
function writeAscii(target: number[], text: string): void {
  for (let index = 0; index < text.length; index += 1) {
    target.push(text.charCodeAt(index));
  }
}

/** Дописывает 16-битное число младшим байтом вперёд. */
function writeWord(target: number[], value: number): void {
  target.push(value & 0xff, (value >> 8) & 0xff);
}

/** Graphic Control Extension: задержка кадра, без прозрачности. */
function writeGraphicControl(
  target: number[],
  delayCentiseconds: number,
): void {
  target.push(
    GIF_EXTENSION_INTRODUCER,
    GIF_GRAPHIC_CONTROL_LABEL,
    0x04,
    GIF_GRAPHIC_CONTROL_PACKED,
  );
  writeWord(target, delayCentiseconds);
  target.push(0x00, 0x00);
}

/** Netscape Application Extension: бесконечное зацикливание. */
function writeNetscapeLoop(target: number[]): void {
  target.push(GIF_EXTENSION_INTRODUCER, GIF_APPLICATION_LABEL, 0x0b);
  writeAscii(target, GIF_NETSCAPE_ID);
  target.push(0x03, 0x01);
  writeWord(target, 0);
  target.push(0x00);
}

/** Разбивает LZW-поток на блоки GIF не длиннее 255 байт. */
function writeSubBlocks(target: number[], data: Uint8Array): void {
  for (let offset = 0; offset < data.length; offset += GIF_SUB_BLOCK_SIZE) {
    const size = Math.min(GIF_SUB_BLOCK_SIZE, data.length - offset);
    target.push(size);

    for (let index = 0; index < size; index += 1) {
      target.push(data[offset + index]);
    }
  }

  target.push(0x00);
}
