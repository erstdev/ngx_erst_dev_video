/** Делит строку по первому вхождению разделителя. */
export function splitOnce(value: string, separator: string): [string, string] {
  const index = value.indexOf(separator);

  return index === -1
    ? [value, '']
    : [value.slice(0, index), value.slice(index + separator.length)];
}
