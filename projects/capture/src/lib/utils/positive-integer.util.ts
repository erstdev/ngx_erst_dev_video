/** Положительное целое из входа: некорректные значения отбрасываются. */
export function positiveInteger(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }

  return Math.max(1, Math.floor(value));
}
