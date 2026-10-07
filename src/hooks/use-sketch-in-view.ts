import { useEffect, useState, type RefObject } from 'react';

const PHONE = '(max-width: 600px)';
/** Sketch mode starts once this much of the card is visible and ends below `LEAVE`. */
const ENTER = 0.98;
const LEAVE = 0.85;

/** True on phones while `ref` is fully in the viewport; always false on wider screens. */
export const useSketchInView = (ref: RefObject<HTMLElement | null>): boolean => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const phone = matchMedia(PHONE);
    let io: IntersectionObserver | undefined;

    const sync = () => {
      io?.disconnect();
      io = undefined;
      if (!phone.matches) return setInView(false);
      io = new IntersectionObserver(
        ([entry]) => {
          const ratio = entry.intersectionRatio;
          if (ratio >= ENTER) setInView(true);
          else if (ratio < LEAVE) setInView(false);
        },
        { threshold: [LEAVE, ENTER] },
      );
      io.observe(el);
    };

    phone.addEventListener('change', sync);
    sync();
    return () => {
      phone.removeEventListener('change', sync);
      io?.disconnect();
    };
  }, [ref]);

  return inView;
};
