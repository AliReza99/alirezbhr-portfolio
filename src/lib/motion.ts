export const prefersReducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const canAnimate = (el: Element | null | undefined): el is Element =>
  !!el && typeof el.animate === 'function' && !prefersReducedMotion();

/** Picks a random index that differs from `prev` when possible. */
export const pickIndex = (length: number, prev?: number): number => {
  let n: number;
  do {
    n = Math.floor(Math.random() * length);
  } while (n === prev && length > 1);
  return n;
};
