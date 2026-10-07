/**
 * Shape of the tear in the page and the canvas drawing of what sits along it: the faint
 * perforation ahead of the tab, the white torn rims, paper fibres and shadows. Everything
 * here is a pure function of the tab's progress, so the engine can call it on every frame of a drag.
 */

export type Pt = [x: number, y: number];

export type SeamLayout = {
  w: number;
  h: number;
  /** Where the tear runs: the tab's horizontal position. */
  x0: number;
  /** Where the tear starts with the tab at the top, and with it all the way down. */
  y0: number;
  yMax: number;
  /** The strip of page left along the window edges when the halves are drawn aside. */
  margin: number;
};

export type Seam = {
  apexY: number;
  /** Each ragged edge of the tear, from the tab outward to above the top of the window. */
  left: Pt[];
  right: Pt[];
  /** Where each edge point sits on the paper, as its distance above the tab's start with the page at rest. Stable while the tear moves. */
  keys: [left: number[], right: number[]];
  /** The tear as an SVG path, for `clip-path` and the canvas alike. */
  d: string;
  /** 0 while the tear is a V, 1 once the halves are drawn aside. */
  spread: number;
};

const INK = '#3B3A55';
const PAPER = '#FBF6EF';
const FIBRE = '#FFFDF8';

/** Points per smooth edge, before it is torn. Enough that the corner stays round. */
const N = 160;
/** Distance between points on the torn edge. */
const STEP = 4;
/** The most points on one torn edge. */
const MAX_POINTS = 400;
/** The tear leaves the tab as a clean point: the roughness grows over this much edge. */
const CLEAN = 10;
/** How far above the window the edges run, so their ends never show. */
const PAD = 48;
/** A half narrower than this has no slack to hang below the tear's start. */
const NARROW = 70;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Close to the tab the edges leave at a narrow angle, then the page falls open. */
const fall = (u: number) => 0.16 * u + 0.84 * u * u * (3 - 2 * u);

/** `count + 1` points spaced evenly along a polyline. */
const resample = (pts: Pt[], count: number): Pt[] => {
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = lens[lens.length - 1];
  const out: Pt[] = [];
  let k = 1;
  for (let i = 0; i <= count; i++) {
    const at = (total * i) / count;
    while (k < pts.length - 1 && lens[k] < at) k++;
    const span = lens[k] - lens[k - 1] || 1;
    const t = (at - lens[k - 1]) / span;
    out.push([pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * t, pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * t]);
  }
  return out;
};

/**
 * One edge with the halves drawn all the way aside: out from the tab along the bottom,
 * round the corner and up the side of the window. The short slope beside the tab is the
 * last of the page the bottom stop still holds together.
 */
const drawnAside = (l: SeamLayout, dir: -1 | 1, apexY: number, strip: number): Pt[] => {
  const edge = dir < 0 ? strip : l.w - strip;
  const ext = Math.abs(edge - l.x0);
  const yb = l.h - l.margin - 2;
  const gusset = Math.min(128, ext * 0.8);
  const r = Math.max(0, Math.min(60, ext - gusset, yb - 40));
  const pts: Pt[] = [];
  if (ext < NARROW) {
    // No room to sag on this side, as with a tab near the edge of a phone: the half just steps aside.
    for (let k = 0; k <= 10; k++) {
      const t = k / 10;
      pts.push([l.x0 + dir * ext * (1 - (1 - t) * (1 - t)), apexY - ext * 1.6 * t * t]);
    }
    pts.push([edge, -PAD]);
    return resample(pts, N);
  }
  for (let k = 0; k <= 10; k++) {
    const t = k / 10;
    const a = (1 - t) * (1 - t);
    const b = 2 * t * (1 - t);
    const c = t * t;
    pts.push([l.x0 + dir * gusset * (b * 0.56 + c), a * apexY + b * (apexY + (yb - apexY) * 0.72) + c * yb]);
  }
  const cx = edge - dir * r;
  const cy = yb - r;
  for (let k = 0; k <= 8; k++) {
    const ang = (Math.PI / 2) * (k / 8);
    pts.push([cx + dir * r * Math.sin(ang), cy + r * Math.cos(ang)]);
  }
  pts.push([edge, -PAD]);
  return resample(pts, N);
};

const round = (v: number) => Math.round(v * 10) / 10;

/** A straight-segment path through `pts`, appended to `d`. `first` says whether to start with a move. */
const poly = (pts: Pt[], first: boolean): string => {
  let d = `${first ? 'M' : 'L'}${round(pts[0][0])} ${round(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) d += `L${round(pts[i][0])} ${round(pts[i][1])}`;
  return d;
};

/** A stable pseudo-random number from an integer, between -1 and 1. */
const hash = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
};

/** Value noise: hashed values at the integers, smoothly blended between them. */
const valueNoise = (x: number) => {
  const i = Math.floor(x);
  const t = smoothstep(0, 1, x - i);
  return hash(i) + (hash(i + 1) - hash(i)) * t;
};

/** Three octaves of value noise, between -1 and 1: big bites, small bites, fine grit. */
const roughness = (k: number) => 0.55 * valueNoise(k / 26) + 0.3 * valueNoise(k / 9) + 0.15 * valueNoise(k / 3);

/** The unit normal of `pts` at `i`, pointing into the opening. `dir` is which half the edge belongs to. */
export const inward = (pts: Pt[], i: number, dir: -1 | 1): Pt => {
  const a = pts[Math.max(0, i - 1)];
  const b = pts[Math.min(pts.length - 1, i + 1)];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return dir < 0 ? [-dy / len, dx / len] : [dy / len, -dx / len];
};

/**
 * Tears a smooth edge. It is sampled every few px along its length, at spots fixed to the
 * paper rather than to the edge, and each sample is pushed along the normal by noise of its
 * position on the paper, so the ragged pattern stays put while the tear moves. The left edge
 * moves with the noise into the opening and the right edge against it, which is the same
 * way in the world: the two sides of a real tear match.
 */
const tearEdge = (smooth: Pt[], dir: -1 | 1, apexY: number, amp: number): { pts: Pt[]; keys: number[] } => {
  const lens = [0];
  for (let i = 1; i < smooth.length; i++) lens.push(lens[i - 1] + Math.hypot(smooth[i][0] - smooth[i - 1][0], smooth[i][1] - smooth[i - 1][1]));
  const total = lens[lens.length - 1];
  const step = Math.max(STEP, Math.ceil(total / MAX_POINTS));
  // The tab's own point first, then every `step` px of paper, then the far end.
  const at = [0];
  let s = (((apexY % step) + step) % step) || step;
  if (s < 1) s += step;
  for (; s < total - 1; s += step) at.push(s);
  at.push(total);
  const base: Pt[] = [];
  let k = 1;
  for (const a of at) {
    while (k < smooth.length - 1 && lens[k] < a) k++;
    const span = lens[k] - lens[k - 1] || 1;
    const t = (a - lens[k - 1]) / span;
    base.push([smooth[k - 1][0] + (smooth[k][0] - smooth[k - 1][0]) * t, smooth[k - 1][1] + (smooth[k][1] - smooth[k - 1][1]) * t]);
  }
  const keys = at.map((a) => apexY - a);
  const pts = base.map(([x, y], i): Pt => {
    // Left edge: along its inward normal. Right edge: against its own, which is the same way in the world.
    const n = roughness(keys[i]) * amp * smoothstep(0, CLEAN, at[i]) * -dir;
    const [nx, ny] = inward(base, i, dir);
    return [x + nx * n, y + ny * n];
  });
  return { pts, keys };
};

/**
 * The tear for a tab at `p` (0 not started, 1 at the bottom). `lag` is the same number a
 * moment ago: the page follows the tab late, so the width comes from it. The smooth edges
 * are torn last, so the clip-path and the painting share the same ragged geometry.
 */
export const computeSeam = (l: SeamLayout, p: number, lag: number): Seam => {
  const apexY = l.y0 + (l.yMax - l.y0) * p;
  const g = clamp01(lag);
  const spread = smoothstep(0.58, 0.98, g);
  // Past the end the page overshoots a little and settles.
  const strip = Math.max(4, l.margin - (lag - p) * 110);

  const side = (dir: -1 | 1): Pt[] => {
    const ext = Math.abs((dir < 0 ? strip : l.w - strip) - l.x0);
    const top = ext * 0.9 * Math.pow(g, 1.35);
    const aside = spread > 0 ? drawnAside(l, dir, apexY, strip) : null;
    const pts: Pt[] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      let x = l.x0 + dir * top * fall(u);
      let y = apexY - u * (apexY + PAD);
      if (aside) {
        x += (aside[i][0] - x) * spread;
        y += (aside[i][1] - y) * spread;
      }
      pts.push([x, y]);
    }
    return pts;
  };

  const amp = l.w < 600 ? 4 : 6;
  const L = tearEdge(side(-1), -1, apexY, amp);
  const R = tearEdge(side(1), 1, apexY, amp);
  const d = `${poly(L.pts, true)}${poly([...R.pts].reverse(), false)}Z`;
  return { apexY, left: L.pts, right: R.pts, keys: [L.keys, R.keys], d, spread };
};

const trace = (ctx: CanvasRenderingContext2D, pts: Pt[]) => {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
};

/** Ahead of the tab: the dots of a perforation. */
const DOT_GAP = 8;
const DOT_REACH = 160;

/**
 * Paints one frame onto a canvas that covers the window. The page underneath shows through
 * `seam.d`, so this only adds what sits on the edge between it and the page being torn.
 */
export const paintTear = (ctx: CanvasRenderingContext2D, l: SeamLayout, seam: Seam) => {
  ctx.clearRect(0, 0, l.w, l.h);
  const travel = seam.apexY - l.y0;
  if (travel <= 0.5) return;
  const hole = new Path2D(seam.d);
  const page = new Path2D(`M-9-9H${l.w + 9}V${l.h + 9}H-9Z${seam.d}`);
  const edges = [seam.left, seam.right];
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = clamp01(travel / 26);
  const alpha = ctx.globalAlpha;

  // The paper still to tear, ahead of the tab: a short faint perforation. It goes once the halves are drawn aside.
  const from = seam.apexY + DOT_GAP;
  ctx.fillStyle = INK;
  for (let y = from; y < from + DOT_REACH && y < l.h; y += DOT_GAP) {
    ctx.globalAlpha = alpha * 0.45 * (1 - (y - from) / DOT_REACH) * (1 - seam.spread);
    ctx.beginPath();
    ctx.arc(l.x0, y, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = alpha;

  // The page beside the tear: its white torn rim lifts a little and casts a soft shadow.
  ctx.save();
  ctx.clip(page, 'evenodd');
  const bunched = smoothstep(0.7, 1, seam.spread);
  if (bunched > 0) {
    // What is left of the page once it is drawn aside is plain bunched paper.
    ctx.save();
    ctx.globalAlpha *= bunched;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, l.w, l.h);
    ctx.restore();
  }
  ctx.shadowColor = 'rgba(59,58,85,.3)';
  ctx.shadowBlur = 14;
  ctx.strokeStyle = '#FFFFFF';
  // Half of it is clipped away with the hole, so about 3.5px of rim shows on the page.
  ctx.lineWidth = 7;
  edges.forEach((e) => (trace(ctx, e), ctx.stroke()));
  ctx.restore();

  // The page underneath, just inside the tear, sits in the shadow of the lifted rim.
  ctx.save();
  ctx.clip(hole);
  ctx.shadowColor = 'rgba(59,58,85,.3)';
  ctx.shadowBlur = 18;
  ctx.strokeStyle = 'rgba(59,58,85,.3)';
  ctx.lineWidth = 6;
  edges.forEach((e) => (trace(ctx, e), ctx.stroke()));
  ctx.restore();

  // Paper fibres standing out of the torn rim into the opening. Their spots and angles come from the paper position.
  ctx.strokeStyle = FIBRE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  edges.forEach((e, side) => {
    const dir = side ? 1 : -1;
    for (let i = 1; i < e.length - 1; i++) {
      const key = Math.round(seam.keys[side][i]) * 2 + side;
      if (hash(key) < -0.5) continue;
      const [nx, ny] = inward(e, i, dir);
      const turn = hash(key * 3 + 1) * 0.7;
      const len = 1.5 + (hash(key * 3 + 2) * 0.5 + 0.5) * 2.5;
      const c = Math.cos(turn);
      const sn = Math.sin(turn);
      ctx.moveTo(e[i][0], e[i][1]);
      ctx.lineTo(e[i][0] + (nx * c - ny * sn) * len, e[i][1] + (nx * sn + ny * c) * len);
    }
  });
  ctx.stroke();

  // The doodle ink edge.
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  edges.forEach((e) => (trace(ctx, e), ctx.stroke()));
  ctx.globalAlpha = 1;
};
