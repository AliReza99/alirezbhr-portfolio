import { computeSeam, paintCut, type Seam, type SeamLayout } from './cut-seam';

/** The scissors' box, and where in it the blades' pivot is. The cut opens from that point. */
export const PULL = { width: 44, height: 104, top: -12, apex: 54 };

/** Gap left under the tips when the scissors are all the way down. */
const REST_GAP = 44;
/** The blades open and close once per this much travel. */
const SNIP_PX = 34;
/** The blades stay open this long after the last movement, then close. */
const SNIP_HOLD_MS = 90;

type Key = { at: number; p: number; ease?: (t: number) => number };
type Tween = { start: number; keys: Key[]; target: 0 | 1 };

type CutParts = {
  /** Covers the window, above the sheet. Flaps, dashes and shadows are painted here. */
  canvas: HTMLCanvasElement;
  /** The page underneath. Its clip-path is the cut. */
  sheet: HTMLElement;
  /** The scissors. They ride the cut down. */
  handle: HTMLElement;
};

type CutEvents = {
  /** The scissors left the top stop, or are back on it with the page settled. */
  onActive: (active: boolean) => void;
  /** The scissors came to rest at one end. */
  onRest: (open: boolean) => void;
  /** The scissors hit the top stop. */
  onBump: () => void;
};

const inOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const out = (t: number) => 1 - (1 - t) ** 3;
const into = (t: number) => t * t;

/**
 * Runs the cut. The scissors' progress `p` comes from the pointer or from a tween; the page
 * edges follow it on a spring, and every frame writes the cut to the sheet's clip-path,
 * repaints the canvas and moves the handle. No React state changes per frame.
 */
export const createCut = ({ canvas, sheet, handle }: CutParts, events: CutEvents) => {
  const ctx = canvas.getContext('2d');
  let layout: SeamLayout = { w: 0, h: 0, x0: 0, y0: 0, yMax: 1, flap: 16 };
  let seam: Seam | null = null;
  let p = 0;
  /** The page edges' own progress, chasing `p`. */
  let lag = 0;
  let vel = 0;
  let active = false;
  let held = false;
  let raf = 0;
  let last = 0;
  let tween: Tween | null = null;
  /** How far the blades are open, 0 to 1. */
  let snip = 0;
  let travelled = 0;
  let movedAt = -1e9;

  const setSnip = (v: number) => {
    snip = v;
    handle.style.setProperty('--snip', v.toFixed(3));
  };

  const measure = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    const y0 = PULL.top + PULL.apex;
    layout = { w, h, x0: handle.offsetLeft + handle.offsetWidth / 2, y0, yMax: Math.max(y0 + 1, h - (PULL.height - PULL.apex) - REST_GAP), flap: w < 600 ? 13 : 17 };
  };

  const render = (now: number, dt: number) => {
    seam = computeSeam(layout, p, lag);
    sheet.style.clipPath = `path("${seam.d}")`;
    if (ctx) paintCut(ctx, layout, seam);
    const travel = seam.apexY - layout.y0;
    handle.style.transform = `translate3d(0,${travel.toFixed(1)}px,0)`;
    if (Math.abs(travel - travelled) > 0.02) movedAt = now;
    travelled = travel;
    // Snipping as it goes. When the movement stops the blades close on their own.
    if (now - movedAt < SNIP_HOLD_MS) setSnip(0.5 - 0.5 * Math.cos((travel / SNIP_PX) * 2 * Math.PI));
    else if (snip > 0) setSnip(snip < 0.01 ? 0 : snip * Math.exp(-dt * 22));
  };

  const stop = () => {
    active = false;
    sheet.style.clipPath = '';
    ctx?.clearRect(0, 0, layout.w, layout.h);
    handle.style.transform = '';
    setSnip(0);
    travelled = 0;
    events.onActive(false);
  };

  const arrive = (target: 0 | 1) => {
    p = target;
    if (!target) events.onBump();
    events.onRest(!!target);
  };

  const frame = (now: number) => {
    const dt = Math.min(0.032, Math.max(0.001, (now - last) / 1000));
    last = now;
    if (tween) {
      const t = Math.max(0, now - tween.start);
      const keys = tween.keys;
      const end = keys[keys.length - 1];
      if (t >= end.at) {
        const target = tween.target;
        tween = null;
        arrive(target);
      } else {
        const i = keys.findIndex((k) => k.at > t);
        const a = keys[i - 1];
        const b = keys[i];
        p = a.p + (b.p - a.p) * (b.ease ?? inOut)((t - a.at) / (b.at - a.at));
      }
    }
    // Slightly underdamped, so the page edges swing past the blades and settle.
    vel += (150 * (p - lag) - 15 * vel) * dt;
    lag += vel * dt;
    const still = !tween && !held && snip === 0 && now - movedAt >= SNIP_HOLD_MS && Math.abs(p - lag) < 0.0005 && Math.abs(vel) < 0.003;
    if (still) lag = p;
    render(now, dt);
    if (!still) raf = requestAnimationFrame(frame);
    else {
      raf = 0;
      if (p <= 0) stop();
    }
  };

  const run = () => {
    if (!active) {
      active = true;
      // The scroll lock goes on first: it can change how wide the window is for fixed elements.
      events.onActive(true);
      measure();
    }
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  const onResize = () => {
    if (!active) return;
    measure();
    // The sheet lays itself out again on resize; the canvas is measured once more after that.
    requestAnimationFrame(() => {
      if (!active) return;
      measure();
      run();
    });
  };
  addEventListener('resize', onResize);

  return {
    get p() {
      return p;
    },
    /** Where the blades' pivot is on screen. */
    apexY: () => (active ? layout.y0 + (layout.yMax - layout.y0) * p : PULL.top + PULL.apex),

    /** The pointer took hold of the scissors. */
    grab: () => {
      held = true;
      tween = null;
      if (active) run();
    },

    /** The pointer wants the pivot at `y`. */
    dragTo: (y: number) => {
      run();
      const raw = (y - layout.y0) / (layout.yMax - layout.y0);
      // Past the bottom stop it gives a few pixels and no more.
      p = raw > 1 ? 1 + 0.014 * (1 - 1 / (1 + (raw - 1) * 9)) : Math.max(0, raw);
    },

    /** The pointer let go. With no target the scissors stay where they are. */
    release: (target: 0 | 1 | null) => {
      held = false;
      if (!active) return;
      if (target === null) return run();
      const now = performance.now();
      tween = { start: now, target, keys: [{ at: 0, p }, { at: 150 + 480 * Math.abs(target - p), p: target, ease: target ? out : inOut }] };
      run();
    },

    /** Cuts all the way on its own, in strokes with a short pause between them: the snips. */
    cutTo: (target: 0 | 1) => {
      held = false;
      const now = performance.now();
      const d = Math.abs(target - p);
      let keys: Key[];
      if (target && p < 0.1)
        keys = [{ at: 0, p }, { at: 280, p: 0.3 }, { at: 380, p: 0.31 }, { at: 640, p: 0.66 }, { at: 730, p: 0.67 }, { at: 1180, p: 1, ease: out }];
      else if (!target && p > 0.9) keys = [{ at: 0, p }, { at: 280, p: 0.56 }, { at: 360, p: 0.55 }, { at: 760, p: 0, ease: into }];
      else keys = [{ at: 0, p }, { at: 160 + 520 * d, p: target, ease: target ? out : into }];
      tween = { start: now, target, keys };
      run();
    },

    /** Reduced motion: no travel, the page is simply cut open or not. */
    jump: (target: 0 | 1) => {
      tween = null;
      held = false;
      cancelAnimationFrame(raf);
      raf = 0;
      if (target && !active) {
        active = true;
        events.onActive(true);
        measure();
      }
      if (!active) return;
      p = lag = target;
      vel = 0;
      events.onRest(!!target);
      if (!target) return stop();
      render(performance.now(), 0);
      // Nothing moved, so the blades rest closed.
      setSnip(0);
      movedAt = -1e9;
    },

    destroy: () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', onResize);
      if (active) stop();
    },
  };
};

export type Cut = ReturnType<typeof createCut>;
