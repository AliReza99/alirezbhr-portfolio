import { useEffect, useRef, type RefObject } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

type UseBasementTeaseOptions = {
  /** The clipped basement wrapper; its top is where the page "ends". */
  wrapRef: RefObject<HTMLElement | null>;
  /** Ladder tips poking up from the floor strip. */
  ladderRef: RefObject<HTMLElement | null>;
  /** Warm light leaking around the ladder. */
  glowRef: RefObject<HTMLElement | null>;
  isOpen: () => boolean;
  isBusy: () => boolean;
  onOpen: () => void;
  /** Visitor keeps scrolling at the very bottom of the open basement. */
  onDeep: () => void;
};

const OPEN = 340;
const TRIES_TO_OPEN = 3;
/** A pause longer than this starts the count over. */
const RESET_MS = 4000;

/**
 * The page ends a little early. Reaching the bottom lifts the ladder, holds,
 * then slowly pushes the visitor back up. The third try drops them into the basement.
 */
export const useBasementTease = (opts: UseBasementTeaseOptions) => {
  const latest = useRef(opts);
  latest.current = opts;

  useEffect(() => {
    const o = () => latest.current;
    let progress = 0;
    let raf = 0;
    let last = 0;
    let deep = 0;
    let touchY: number | null = null;
    let tries = 0;
    let goal = 0;
    let touchTried = false;
    let wasAtBottom = false;
    let lastY = scrollY;
    let backTimer: number | undefined;
    let backRaf = 0;

    const atBottom = () => innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    const modalOpen = () => !!document.querySelector('[aria-modal="true"][aria-hidden="false"]');

    const apply = () => {
      const e = 1 - Math.pow(1 - Math.min(1, progress / OPEN), 2);
      const lad = o().ladderRef.current;
      const glow = o().glowRef.current;
      if (lad) lad.style.transform = e > 0.001 ? `translateY(${-e * 20}px)` : '';
      if (glow) glow.style.opacity = String(0.3 + e * 0.3);
    };

    const tick = () => {
      raf = 0;
      if (tries && performance.now() - last > RESET_MS) {
        tries = 0;
        goal = 0;
      }
      progress += (goal - progress) * (goal > progress ? 0.16 : 0.08);
      if (Math.abs(goal - progress) < 0.5) progress = goal;
      apply();
      if (progress !== goal || tries) raf = requestAnimationFrame(tick);
    };

    const pushBack = () => {
      const wrap = o().wrapRef.current;
      if (!wrap || o().isOpen()) return;
      const y0 = scrollY;
      const y1 = wrap.getBoundingClientRect().top + scrollY - innerHeight;
      if (prefersReducedMotion()) return scrollTo({ top: y1, behavior: 'instant' });
      const t0 = performance.now();
      const D = 1200;
      cancelAnimationFrame(backRaf);
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / D);
        const q = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        scrollTo({ top: y0 + (y1 - y0) * q, behavior: 'instant' });
        if (k < 1) backRaf = requestAnimationFrame(step);
      };
      backRaf = requestAnimationFrame(step);
    };

    const push = (d: number, fresh = false) => {
      const now = performance.now();
      if (o().isBusy() || modalOpen() || !atBottom()) return;
      const isNew = fresh || now - last > 320;
      last = now;
      if (o().isOpen()) {
        deep += d;
        if (deep > 900) o().onDeep();
        return;
      }
      if (!isNew) return;
      tries++;
      if (tries >= TRIES_TO_OPEN) {
        tries = 0;
        goal = 0;
        progress = 0;
        return o().onOpen();
      }
      goal = (OPEN * tries) / TRIES_TO_OPEN;
      if (!raf) raf = requestAnimationFrame(tick);
      clearTimeout(backTimer);
      // Hold at the bottom for a beat, then push them back up to the cream floor.
      backTimer = window.setTimeout(pushBack, 900);
    };

    const onScroll = () => {
      const b = atBottom();
      if (b && !wasAtBottom && scrollY > lastY && !o().isOpen()) push(60, true);
      if (!b) deep = 0;
      wasAtBottom = b;
      lastY = scrollY;
    };
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) push(Math.min(40, e.deltaY * (e.deltaMode ? 16 : 1)) * 0.8);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!e.repeat && ['ArrowDown', 'PageDown', 'End', ' '].includes(e.key) && !(e.target instanceof Element && e.target.closest('input,textarea,button,a')))
        push(130, true);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = atBottom() && !o().isOpen() ? e.touches[0].clientY : null;
      touchTried = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY == null || touchTried || o().isBusy()) return;
      if (touchY - e.touches[0].clientY > 30) {
        touchTried = true;
        push(60, true);
      }
    };
    const onTouchEnd = () => {
      touchY = null;
    };

    addEventListener('wheel', onWheel, { passive: true });
    addEventListener('keydown', onKey);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('touchstart', onTouchStart, { passive: true });
    addEventListener('touchmove', onTouchMove, { passive: true });
    addEventListener('touchend', onTouchEnd);
    addEventListener('touchcancel', onTouchEnd);
    onScroll();

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(backRaf);
      clearTimeout(backTimer);
      removeEventListener('wheel', onWheel);
      removeEventListener('keydown', onKey);
      removeEventListener('scroll', onScroll);
      removeEventListener('touchstart', onTouchStart);
      removeEventListener('touchmove', onTouchMove);
      removeEventListener('touchend', onTouchEnd);
      removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);
};
