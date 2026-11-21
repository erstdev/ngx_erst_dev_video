/** Декодирует URL-фрагмент, не падая на некорректной последовательности. */
export function decodeFragment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
