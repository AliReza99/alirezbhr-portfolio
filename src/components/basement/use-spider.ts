import { useEffect, useRef, type RefObject } from 'react';
import { canAnimate } from '../../lib/motion';

/** Thread lengths in px: tucked up in the web, the usual hang, and a longer drop. Keep HANG in step with `.spider__drop`. */
const WEB = 0;
const HANG = 46;
const LOW = 74;

/** She covers this much thread per burst, then freezes. */
const HOP = 16;
const HOP_MS = 750;
/** Share of each burst spent moving; the rest she holds still. */
const RUN = 0.4;

type UseSpiderOptions = {
  dropRef: RefObject<HTMLElement | null>;
  bodyRef: RefObject<SVGSVGElement | null>;
  open: boolean;
  dark: boolean;
  /** Something else has the visitor's attention, so the spider stays put. */
  holdStill: () => boolean;
};

/**
 * The spider under the cobweb. She hangs still nearly all the time; once in a
 * while she reels up into the web or lets out more thread, then comes back.
 * Lights out sends her up into the web, and she lowers again a few seconds
 * after they return.
 */
export const useSpider = ({ dropRef, bodyRef, open, dark, holdStill }: UseSpiderOptions) => {
  const len = useRef(HANG);
  const hold = useRef(holdStill);
  hold.current = holdStill;

  useEffect(() => {
    const drop = dropRef.current;
    if (!open || !canAnimate(drop)) return;
    const body = bodyRef.current;
    let timer: number | undefined;
    let climb: Animation | undefined;
    let scuttle: Animation | undefined;
    let touched = 0;

    const go = (to: number, fast = false) => {
      const from = len.current;
      if (to === from) return;
      len.current = to;
      climb?.cancel();
      scuttle?.cancel();
      drop.style.translate = `0 ${to}px`;
      if (fast) {
        climb = drop.animate([{ translate: `0 ${from}px` }, { translate: `0 ${to}px` }], { duration: 280, easing: 'ease-out' });
        return;
      }
      // Bursts: run a little, freeze, run again. Her legs only work while she runs.
      const hops = Math.ceil(Math.abs(to - from) / HOP);
      const path: Keyframe[] = [{ translate: `0 ${from}px` }];
      const legs: Keyframe[] = [{ rotate: '0deg' }];
      for (let i = 1; i <= hops; i++) {
        const y = from + ((to - from) * i) / hops;
        const start = (i - 1) / hops;
        const stop = (i - 1 + RUN) / hops;
        path.push({ translate: `0 ${y}px`, offset: stop }, { translate: `0 ${y}px`, offset: i / hops });
        [-7, 7, -7].forEach((deg, k) => legs.push({ rotate: `${deg}deg`, offset: start + ((stop - start) * (k + 1)) / 4 }));
        legs.push({ rotate: '0deg', offset: stop }, { rotate: '0deg', offset: i / hops });
      }
      climb = drop.animate(path, { duration: hops * HOP_MS });
      scuttle = body?.animate(legs, { duration: hops * HOP_MS });
    };

    const later = (fn: () => void, ms: number) => (timer = window.setTimeout(fn, ms));

    const rest = () => 25000 + Math.random() * 25000;

    const wander = () => {
      if (hold.current() || performance.now() - touched < 4000) return later(wander, 5000);
      const home = len.current === HANG;
      go(home ? (Math.random() < 0.6 ? WEB : LOW) : HANG);
      // Away from her usual spot she comes back sooner.
      later(wander, home ? 8000 + Math.random() * 8000 : rest());
    };

    const onTouch = () => (touched = performance.now());
    const room = drop.closest('.basement');
    room?.addEventListener('pointerdown', onTouch);

    if (dark) go(WEB, true);
    else if (len.current === HANG) later(wander, rest());
    // Still up in the web from the dark. He always has something to say about the lights, so she doesn't wait for quiet.
    else
      later(() => {
        go(HANG);
        later(wander, rest());
      }, 3000);

    return () => {
      clearTimeout(timer);
      climb?.cancel();
      scuttle?.cancel();
      room?.removeEventListener('pointerdown', onTouch);
    };
  }, [dropRef, bodyRef, open, dark]);
};
