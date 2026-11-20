/**
 * `<video>` с методом `captureStream()`.
 *
 * В `lib.dom` метода нет, а браузеры его поддерживают по-разному, поэтому он
 * объявлен необязательным и проверяется в рантайме. Внутренний тип пакета.
 */
export interface VideoCaptureStreamInterface extends HTMLVideoElement {
  captureStream?(): MediaStream;
}
