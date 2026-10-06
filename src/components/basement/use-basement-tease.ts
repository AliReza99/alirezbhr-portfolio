import { useEffect, useRef, type RefObject } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

type UseBasementTeaseOptions = {
  /** The clipped basement wrapper; its top is where the page "ends". */
  wrapRef: RefObject<HTMLElement | null>;
  /** Ladder tips poking up from the floor strip. */
  ladderRef: RefObject<HTMLElement | null>;
  /** Warm light leaking around the ladder. */
  glowRef: RefObject<HTMLElement | null>;
  /** Note in the peek telling touch visitors not to pull; only shown to them. */
  hintRef: RefObject<HTMLElement | null>;
  isOpen: () => boolean;
  isBusy: () => boolean;
  /** `knocked` is true when the last straw was a click on the ladder. */
  onOpen: (knocked?: boolean) => void;
  /** Visitor clicked the ladder tips and it stayed shut. `n` counts up from 1. */
  onKnock: (n: number) => void;
  /** Visitor keeps scrolling at the very bottom of the open basement. */
  onDeep: () => void;
};

const OPEN = 340;
const TRIES_TO_OPEN = 3;
/** Clicking the ladder takes one more, so the voice gets a last word in. */
const KNOCKS_TO_OPEN = 4;
/** A pause longer than this starts the count over. */
const RESET_MS = 4000;
/** Wheel distance pushed into the end of the page, after the first try, that counts as enough. */
const PUSH_ENERGY = 700;
/** Touch: pulling this far past the end of the page and letting go opens it. */
const PULL_OPEN = 80;
/** Touch: a shorter pull still counts as a try; two of them open it. */
const PULL_TRY = 24;
const PULLS_TO_OPEN = 2;
/** Painted behind the page near its end, so the gap Safari's bounce reveals is more basement. */
/** The voice forbids it, which is the invitation. One line per stage of the pull. */
const HINTS = ['nothing down here.', 'stop pulling.', 'don’t you dare let go.'];
const BELOW_CLOSED = '#181818';
const BELOW_OPEN = '#242424';

/**
 * The page ends a little early. Reaching the bottom lifts the ladder, holds,
 * then slowly pushes the visitor back up. The third try drops them into the basement.
 * Clicking the ladder tips counts as a try too; the returned function reports one.
 * Once they have been down, it stays unlocked until the page reloads: one click on
 * the ladder, or one push at the end of the page, lets them back in.
 *
 * Touch works differently: the ladder follows how far the visitor pulls past the
 * end of the page, and letting go after a deep pull opens the basement. Safari
 * reports its bounce in scrollY, so that is the pull; elsewhere it is finger travel.
 */
export const useBasementTease = (opts: UseBasementTeaseOptions) => {
  const latest = useRef(opts);
  latest.current = opts;
  const knockRef = useRef(() => {});

  useEffect(() => {
    const o = () => latest.current;
    let progress = 0;
    let raf = 0;
    let last = 0;
    let deep = 0;
    let tries = 0;
    /** Clicks on the ladder; they add to `tries`. */
    let knocks = 0;
    let energy = 0;
    let pushingBack = false;
    let goal = 0;
    let wasAtBottom = false;
    let lastY = scrollY;
    let backTimer: number | undefined;
    let backRaf = 0;
    /** The last input was a finger. */
    let touch = false;
    let anchorY: number | null = null;
    let nativeOver = false;
    let pull = 0;
    let fingerDown = false;
    /** Deepest pull of the current touch. */
    let peak = 0;
    /** Index into HINTS; only goes up until the hint has faded out. */
    let stage = 0;
    let pulls = 0;
    let below = '';
    /** They have been in once; nothing resists any more. */
    let unlocked = false;
    let arrivedAt = 0;

    const root = document.documentElement;
    const atBottom = () => innerHeight + scrollY >= root.scrollHeight - 4;
    const overscroll = () => innerHeight + scrollY - root.scrollHeight;
    const modalOpen = () => !!document.querySelector('[aria-modal="true"][aria-hidden="false"]');

    const apply = () => {
      const e = 1 - Math.pow(1 - Math.min(1, progress / OPEN), 2);
      const lad = o().ladderRef.current;
      const glow = o().glowRef.current;
      const hint = o().hintRef.current;
      if (lad) lad.style.transform = e > 0.001 ? `translateY(${-e * (touch ? 34 : 20)}px)` : '';
      if (glow) glow.style.opacity = String(0.3 + e * (touch ? 0.6 : 0.3));
      if (hint) {
        // A bounce with no finger on the screen sweeps through every depth; it must not flip the text.
        if (!progress) stage = 0;
        else if (fingerDown) stage = Math.max(stage, pull >= PULL_OPEN ? 2 : pull >= PULL_OPEN / 2 ? 1 : 0);
        if (hint.textContent !== HINTS[stage]) hint.textContent = HINTS[stage];
        hint.style.opacity = touch ? String(Math.min(1, e * 1.6)) : '';
      }
    };

    const tick = () => {
      raf = 0;
      if (tries && performance.now() - last > RESET_MS) {
        tries = 0;
        knocks = 0;
        goal = 0;
        energy = 0;
      }
      progress += (goal - progress) * (goal > progress ? 0.16 : 0.08);
      if (Math.abs(goal - progress) < 0.5) progress = goal;
      apply();
      if (progress !== goal || tries) raf = requestAnimationFrame(tick);
    };

    const pushBack = () => {
      const wrap = o().wrapRef.current;
      if (!wrap || o().isOpen() || o().isBusy()) return;
      const y0 = scrollY;
      const y1 = wrap.getBoundingClientRect().top + scrollY - innerHeight;
      if (prefersReducedMotion()) return scrollTo({ top: y1, behavior: 'instant' });
      pushingBack = true;
      const t0 = performance.now();
      const D = 1200;
      cancelAnimationFrame(backRaf);
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / D);
        const q = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        scrollTo({ top: y0 + (y1 - y0) * q, behavior: 'instant' });
        if (k < 1) backRaf = requestAnimationFrame(step);
        else pushingBack = false;
      };
      backRaf = requestAnimationFrame(step);
    };

    const open = (knocked = false) => {
      tries = 0;
      knocks = 0;
      energy = 0;
      goal = 0;
      progress = 0;
      // A pending or running push-back would fight the scroll into the basement.
      clearTimeout(backTimer);
      cancelAnimationFrame(backRaf);
      pushingBack = false;
      unlocked = true;
      o().onOpen(knocked);
    };

    const push = (d: number, fresh = false) => {
      const now = performance.now();
      if (o().isBusy() || modalOpen()) return;
      // Pushing again while being shoved back counts: stop the shove and keep trying.
      if (pushingBack && tries) {
        cancelAnimationFrame(backRaf);
        pushingBack = false;
      } else if (!atBottom()) return;
      const isNew = fresh || now - last > 320;
      if (now - last > RESET_MS) knocks = 0;
      last = now;
      if (o().isOpen()) {
        deep += d;
        if (deep > 900) o().onDeep();
        return;
      }
      if (unlocked) {
        // Not on the scroll that brought them here, or just reading the footer would drop them in.
        if (now - arrivedAt > 500) open();
        return;
      }
      if (!isNew) {
        // One long hard push: enough total force opens it without separate tries.
        energy += d;
        if (tries && energy > PUSH_ENERGY) {
          tries = TRIES_TO_OPEN;
        } else return;
      } else tries++;
      if (tries + knocks >= TRIES_TO_OPEN) return open();
      goal = (OPEN * tries) / TRIES_TO_OPEN;
      if (!raf) raf = requestAnimationFrame(tick);
      clearTimeout(backTimer);
      pushingBack = false;
      // Hold at the bottom for a beat, then push them back up to the cream floor.
      backTimer = window.setTimeout(pushBack, 900);
    };

    knockRef.current = () => {
      if (o().isOpen() || o().isBusy() || modalOpen()) return;
      const now = performance.now();
      if (now - last > RESET_MS) tries = knocks = 0;
      last = now;
      if (unlocked) return open();
      knocks++;
      if (tries + knocks >= KNOCKS_TO_OPEN) return open(true);
      o().onKnock(tries + knocks);
    };

    const setPull = (px: number) => {
      pull = Math.max(0, px);
      if (fingerDown) peak = Math.max(peak, pull);
      if (o().isOpen() || o().isBusy() || modalOpen()) return;
      goal = OPEN * Math.min(1, pull / PULL_OPEN);
      // Rise with the finger, ease back down.
      if (goal > progress) progress = goal;
      apply();
      if (progress !== goal && !raf) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      const b = atBottom();
      const over = overscroll();
      if (over > 1) nativeOver = true;
      if (touch && nativeOver) setPull(over);
      // On phones the locked basement stays hidden, so the bounce must not reveal dark either.
      const closedColor = matchMedia('(max-width: 600px)').matches ? '' : BELOW_CLOSED;
      const color = over > -200 ? (o().isOpen() ? BELOW_OPEN : closedColor) : '';
      if (color !== below) root.style.backgroundColor = below = color;
      // Touch visitors are not pushed back; the browser's own bounce does that.
      if (b && !wasAtBottom) arrivedAt = performance.now();
      if (b && !wasAtBottom && scrollY > lastY && !o().isOpen() && !touch && !unlocked) push(60, true);
      if (!b) deep = 0;
      wasAtBottom = b;
      lastY = scrollY;
    };
    const onWheel = (e: WheelEvent) => {
      touch = false;
      if (e.deltaY > 0) push(Math.min(40, e.deltaY * (e.deltaMode ? 16 : 1)) * 0.8);
    };
    const onKey = (e: KeyboardEvent) => {
      touch = false;
      if (!e.repeat && ['ArrowDown', 'PageDown', 'End', ' '].includes(e.key) && !(e.target instanceof Element && e.target.closest('input,textarea,button,a')))
        push(130, true);
    };
    const onTouchStart = () => {
      touch = true;
      fingerDown = true;
      peak = 0;
      anchorY = null;
      tries = 0;
      energy = 0;
      clearTimeout(backTimer);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (nativeOver) return;
      const y = e.touches[0].clientY;
      if (!atBottom()) {
        anchorY = null;
        return;
      }
      anchorY ??= y;
      // Halved to match the resistance of a native bounce.
      setPull((anchorY - y) * 0.5);
    };
    const onTouchEnd = () => {
      // Judged on the deepest point, unless they eased most of the way back before letting go.
      const p = pull >= peak / 2 ? peak : pull;
      fingerDown = false;
      anchorY = null;
      if (!nativeOver) setPull(0);
      if (o().isBusy() || modalOpen()) return;
      if (o().isOpen()) {
        if (p >= PULL_TRY * 2) o().onDeep();
        return;
      }
      if (p < PULL_TRY) return;
      const now = performance.now();
      if (now - last > RESET_MS) pulls = 0;
      last = now;
      if (p < PULL_OPEN && !unlocked && ++pulls < PULLS_TO_OPEN) return;
      pulls = 0;
      knocks = 0;
      goal = 0;
      progress = 0;
      stage = 0;
      unlocked = true;
      o().onOpen();
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
      root.style.backgroundColor = '';
      removeEventListener('wheel', onWheel);
      removeEventListener('keydown', onKey);
      removeEventListener('scroll', onScroll);
      removeEventListener('touchstart', onTouchStart);
      removeEventListener('touchmove', onTouchMove);
      removeEventListener('touchend', onTouchEnd);
      removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  return () => knockRef.current();
};
