/** Округляет смещение до сотых. */
export const roundGestureDelta = (delta: number): number => {
  if (!Number.isFinite(delta)) {
    return 0;
  }

  return Math.round(delta * 100) / 100;
};
