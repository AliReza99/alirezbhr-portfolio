import { computeSeam, insideSeam, paintSeam, PITCH, type Seam, type SeamLayout } from './zipper-seam';

/** The pull's box, and where in it the slider's centre is. The seam opens from that point. */
export const PULL = { width: 44, height: 98, top: -12, apex: 24 };

/** Gap left under the ring when the slider is all the way down. */
const REST_GAP = 44;
const SHAKE_MS = 620;

type Key = { at: number; p: number; ease?: (t: number) => number };
type Tween = { start: number; keys: Key[]; target: 0 | 1 };

type ZipperParts = {
  /** Covers the window, above the lining. Tape, teeth and shadows are painted here. */
  canvas: HTMLCanvasElement;
  /** The lining. Its clip-path is the opening. */
  cloth: HTMLElement;
  /** The slider with the ring. It rides the seam. */
  handle: HTMLElement;
};

type ZipperEvents = {
  /** The slider left the top stop, or is back on it with the fabric settled. */
  onActive: (active: boolean) => void;
  /** The slider came to rest at one end. */
  onRest: (open: boolean) => void;
  onSnag: () => void;
  /** The slider hit the top stop. */
  onBump: () => void;
};

const inOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const out = (t: number) => 1 - (1 - t) ** 3;
const into = (t: number) => t * t;

/**
 * Runs the zipper. The slider's progress `p` comes from the pointer or from a tween; the
 * fabric follows it on a spring, and every frame writes the opening to the lining's
 * clip-path, repaints the canvas and moves the handle. No React state changes per frame.
 */
export const createZipper = ({ canvas, cloth, handle }: ZipperParts, events: ZipperEvents) => {
  const ctx = canvas.getContext('2d');
  let layout: SeamLayout = { w: 0, h: 0, x0: 0, y0: 0, yMax: 1, tape: 16 };
  let seam: Seam | null = null;
  let p = 0;
  /** The fabric's own progress, chasing `p`. */
  let lag = 0;
  let vel = 0;
  let active = false;
  let held = false;
  let raf = 0;
  let last = 0;
  let tween: Tween | null = null;
  /** Where this pull will snag, if it will. */
  let snagAt: number | null = null;
  let jammed = false;
  /** While jammed in a drag: the pointer has eased off, so the next pull down is the second tug. */
  let eased = false;
  let shakeFrom = -1e9;
  let patches: { el: HTMLElement; x: number; y: number }[] = [];

  const measure = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    const y0 = PULL.top + PULL.apex;
    layout = { w, h, x0: handle.offsetLeft + handle.offsetWidth / 2, y0, yMax: Math.max(y0 + 1, h - (PULL.height - PULL.apex) - REST_GAP), tape: w < 600 ? 13 : 17 };
    patches = [...cloth.querySelectorAll<HTMLElement>('[data-patch]')].map((el) => {
      const r = el.getBoundingClientRect();
      return { el, x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  };

  const render = (now: number) => {
    seam = computeSeam(layout, p, lag);
    cloth.style.clipPath = `path("${seam.d}")`;
    if (ctx) paintSeam(ctx, layout, seam);
    const travel = seam.apexY - layout.y0;
    const shake = now - shakeFrom;
    let dx = 0;
    if (shake < SHAKE_MS) dx = Math.sin(shake * 0.085) * 3.4 * (1 - shake / SHAKE_MS);
    // A tick from side to side as each tooth passes.
    else if (held || tween) dx = Math.floor(travel / PITCH) % 2 ? 0.6 : -0.6;
    handle.style.transform = `translate3d(${dx.toFixed(2)}px,${travel.toFixed(1)}px,0)`;
    for (const patch of patches) {
      if (!patch.el.hasAttribute('data-sewn') && insideSeam(seam, patch.x, patch.y)) patch.el.setAttribute('data-sewn', '');
    }
  };

  const stop = () => {
    active = false;
    cloth.style.clipPath = '';
    ctx?.clearRect(0, 0, layout.w, layout.h);
    handle.style.transform = '';
    patches.forEach(({ el }) => el.removeAttribute('data-sewn'));
    events.onActive(false);
  };

  const arrive = (target: 0 | 1) => {
    p = target;
    if (!target) events.onBump();
    events.onRest(!!target);
  };

  const jam = (now: number) => {
    tween = null;
    p = snagAt ?? p;
    jammed = true;
    eased = false;
    shakeFrom = now;
    events.onSnag();
  };

  const free = () => {
    jammed = false;
    snagAt = null;
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
        if (snagAt !== null && tween.target && p >= snagAt) jam(now);
      }
    }
    // Slightly underdamped, so the fabric swings past the slider and settles.
    vel += (150 * (p - lag) - 15 * vel) * dt;
    lag += vel * dt;
    const still = !tween && !held && now - shakeFrom > SHAKE_MS && Math.abs(p - lag) < 0.0005 && Math.abs(vel) < 0.003;
    if (still) lag = p;
    render(now);
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
    // The lining lays itself out again on resize; its patches are measured after that.
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
    get jammed() {
      return jammed;
    },
    /** Where the slider's centre is on screen. */
    apexY: () => (active ? layout.y0 + (layout.yMax - layout.y0) * p : PULL.top + PULL.apex),

    /** This pull will catch at `at` on the way down. */
    arm: (at: number) => {
      snagAt = at;
    },

    /** The pointer took hold of the ring. A second hold on a jammed zipper is the tug that frees it. */
    grab: () => {
      held = true;
      tween = null;
      if (jammed) free();
      if (active) run();
    },

    /** The pointer wants the slider's centre at `y`. */
    dragTo: (y: number) => {
      run();
      const raw = (y - layout.y0) / (layout.yMax - layout.y0);
      // Past the bottom stop it gives a few pixels and no more.
      let next = raw > 1 ? 1 + 0.014 * (1 - 1 / (1 + (raw - 1) * 9)) : Math.max(0, raw);
      if (jammed && snagAt !== null) {
        if (next < snagAt - 0.03) eased = true;
        if (next > snagAt) {
          if (eased) free();
          else next = snagAt + 0.008 * (1 - 1 / (1 + (next - snagAt) * 30));
        }
      } else if (snagAt !== null && next >= snagAt && next > p) {
        p = snagAt;
        jam(performance.now());
        return;
      }
      p = next;
    },

    /** The pointer let go. A jammed zipper stays where it is. */
    release: (target: 0 | 1 | null) => {
      held = false;
      if (!active) return;
      if (target === null || (jammed && target)) return run();
      free();
      const now = performance.now();
      tween = { start: now, target, keys: [{ at: 0, p }, { at: 150 + 480 * Math.abs(target - p), p: target, ease: target ? out : inOut }] };
      run();
    },

    /** Zips all the way on its own, in strokes with a short catch between them. */
    zipTo: (target: 0 | 1) => {
      held = false;
      // A click on a jammed zipper is the second tug, and zipping shut forgets the snag.
      if (jammed || !target) free();
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

    /** Reduced motion: no travel, the zipper is simply open or shut. */
    jump: (target: 0 | 1) => {
      tween = null;
      held = false;
      free();
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
      render(performance.now());
    },

    /** Measures again once the lining has changed what it shows. */
    remeasure: () => {
      if (!active) return;
      measure();
      // Measuring wipes the canvas. With no frame on the way, as under reduced motion, it is painted again here.
      if (!raf) render(performance.now());
    },

    destroy: () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', onResize);
      if (active) stop();
    },
  };
};

export type Zipper = ReturnType<typeof createZipper>;
