import { computeSeam, paintTear, type Seam, type SeamLayout } from './tear-seam';

/** The pull tab's box, and where in it the tear starts: the top of the visible tab, where it meets the window. */
export const PULL = { width: 44, height: 86, top: -12, apex: 14 };

/** Gap left under the tab when it is all the way down. */
const REST_GAP = 44;
/** The tab shudders once per this much travel while the paper rips. */
const SHUDDER_PX = 6;

type Key = { at: number; p: number; ease?: (t: number) => number };
type Tween = { start: number; keys: Key[]; target: 0 | 1 };

type TearParts = {
  /** Covers the window, above the sheet. Torn rims, fibres and shadows are painted here. */
  canvas: HTMLCanvasElement;
  /** The page underneath. Its clip-path is the tear. */
  sheet: HTMLElement;
  /** The pull tab. It rides the tear down. */
  handle: HTMLElement;
};

type TearEvents = {
  /** The tab left the top stop, or is back on it with the page settled. */
  onActive: (active: boolean) => void;
  /** The tab came to rest at one end. */
  onRest: (open: boolean) => void;
  /** The tab hit the top stop. */
  onBump: () => void;
};

const inOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const out = (t: number) => 1 - (1 - t) ** 3;
const into = (t: number) => t * t;

/** A stable pseudo-random number from an integer, between -0.5 and 0.5. */
const jitter = (n: number) => {
  const s = Math.sin(n * 127.1 + 31.7) * 43758.5453;
  return s - Math.floor(s) - 0.5;
};

/**
 * Runs the tear. The tab's progress `p` comes from the pointer or from a tween; the torn
 * edges follow it on a spring, and every frame writes the tear to the sheet's clip-path,
 * repaints the canvas and moves the handle. No React state changes per frame.
 */
export const createTear = ({ canvas, sheet, handle }: TearParts, events: TearEvents) => {
  const ctx = canvas.getContext('2d');
  let layout: SeamLayout = { w: 0, h: 0, x0: 0, y0: 0, yMax: 1, margin: 10 };
  let seam: Seam | null = null;
  let p = 0;
  /** The torn edges' own progress, chasing `p`. */
  let lag = 0;
  let vel = 0;
  let active = false;
  let held = false;
  let raf = 0;
  let last = 0;
  let tween: Tween | null = null;
  const measure = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    const y0 = PULL.top + PULL.apex;
    layout = { w, h, x0: handle.offsetLeft + handle.offsetWidth / 2, y0, yMax: Math.max(y0 + 1, h - (PULL.height - PULL.apex) - REST_GAP), margin: w < 600 ? 8 : 10 };
  };

  const render = () => {
    seam = computeSeam(layout, p, lag);
    sheet.style.clipPath = `path("${seam.d}")`;
    if (ctx) paintTear(ctx, layout, seam);
    const travel = seam.apexY - layout.y0;
    // A small shudder while the paper rips, steady when the tab is let go and settled.
    const dx = held || tween ? jitter(Math.floor(travel / SHUDDER_PX)) * 1.4 : 0;
    handle.style.transform = `translate3d(${dx.toFixed(2)}px,${travel.toFixed(1)}px,0)`;
  };

  const stop = () => {
    active = false;
    sheet.style.clipPath = '';
    ctx?.clearRect(0, 0, layout.w, layout.h);
    handle.style.transform = '';
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
    // Slightly underdamped, so the torn edges swing past the tab and settle.
    vel += (150 * (p - lag) - 15 * vel) * dt;
    lag += vel * dt;
    const still = !tween && !held && Math.abs(p - lag) < 0.0005 && Math.abs(vel) < 0.003;
    if (still) lag = p;
    render();
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
    /** Where the tear starts on screen. */
    apexY: () => (active ? layout.y0 + (layout.yMax - layout.y0) * p : PULL.top + PULL.apex),

    /** The pointer took hold of the tab. */
    grab: () => {
      held = true;
      tween = null;
      if (active) run();
    },

    /** The pointer wants the tear's start at `y`. */
    dragTo: (y: number) => {
      run();
      const raw = (y - layout.y0) / (layout.yMax - layout.y0);
      // Past the bottom stop it gives a few pixels and no more.
      p = raw > 1 ? 1 + 0.014 * (1 - 1 / (1 + (raw - 1) * 9)) : Math.max(0, raw);
    },

    /** The pointer let go. With no target the tab stays where it is. */
    release: (target: 0 | 1 | null) => {
      held = false;
      if (!active) return;
      if (target === null) return run();
      const now = performance.now();
      tween = { start: now, target, keys: [{ at: 0, p }, { at: 150 + 480 * Math.abs(target - p), p: target, ease: target ? out : inOut }] };
      run();
    },

    /** Tears all the way on its own, in strokes with a short pause between them: rip, rip, rip. */
    tearTo: (target: 0 | 1) => {
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

    /** Reduced motion: no travel, the page is simply torn open or not. */
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
      render();
    },

    destroy: () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', onResize);
      if (active) stop();
    },
  };
};

export type Tear = ReturnType<typeof createTear>;
