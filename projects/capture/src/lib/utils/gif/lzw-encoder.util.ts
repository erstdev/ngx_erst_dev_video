import { GIF_LZW_MAX_CODE, GIF_LZW_MAX_CODE_SIZE } from '../../constants';

/**
 * LZW-сжатие индексированных пикселей GIF.
 *
 * Коды пишутся младшими битами вперёд, как требует формат. Размер кода растёт
 * вместе со словарём; на пределе словаря отправляется clear code и словарь
 * начинается заново.
 */
export function encodeLzw(pixels: Uint8Array, minCodeSize: number): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  const bytes: number[] = [];
  let bitBuffer = 0;
  let bitCount = 0;

  /** Записывает код указанной разрядности в поток младшими битами вперёд. */
  const emit = (code: number, size: number): void => {
    bitBuffer |= code << bitCount;
    bitCount += size;

    while (bitCount >= 8) {
      bytes.push(bitBuffer & 0xff);
      bitBuffer >>>= 8;
      bitCount -= 8;
    }
  };

  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;
  let dictionary = new Map<number, number>();

  emit(clearCode, codeSize);

  if (pixels.length > 0) {
    let current = pixels[0];

    for (let index = 1; index < pixels.length; index += 1) {
      const next = pixels[index];
      const key = (current << 8) | next;
      const known = dictionary.get(key);

      if (known !== undefined) {
        current = known;
        continue;
      }

      emit(current, codeSize);

      if (nextCode === GIF_LZW_MAX_CODE) {
        emit(clearCode, codeSize);
        dictionary = new Map<number, number>();
        nextCode = endCode + 1;
        codeSize = minCodeSize + 1;
      } else {
        if (nextCode >= 1 << codeSize && codeSize < GIF_LZW_MAX_CODE_SIZE) {
          codeSize += 1;
        }

        dictionary.set(key, nextCode);
        nextCode += 1;
      }

      current = next;
    }

    emit(current, codeSize);
  }

  emit(endCode, codeSize);

  if (bitCount > 0) {
    bytes.push(bitBuffer & 0xff);
  }

  return new Uint8Array(bytes);
}
