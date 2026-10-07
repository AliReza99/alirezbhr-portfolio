/**
 * Shape of the cut in the page and the canvas drawing of what sits along it: the dashed
 * line ahead of the blades, the curled-back flaps and their shadows. Everything here is a
 * pure function of the blades' progress, so the engine can call it on every frame of a drag.
 */

export type Pt = [x: number, y: number];

export type SeamLayout = {
  w: number;
  h: number;
  /** Where the cut runs: the scissors' horizontal position. */
  x0: number;
  /** Pivot height with the cut not started, and all the way down. */
  y0: number;
  yMax: number;
  /** Width of the curled-back flap along each edge. */
  flap: number;
};

export type Seam = {
  apexY: number;
  /** Each edge of the cut, from the pivot outward to above the top of the window. */
  left: Pt[];
  right: Pt[];
  /** The cut as an SVG path, for `clip-path` and the canvas alike. */
  d: string;
  /** 0 while the cut is a V, 1 once the halves are drawn aside. */
  spread: number;
};

const INK = '#3B3A55';
const PAPER = '#FBF6EF';
const HATCH_BG = '#F5F1E6';

/** Points per edge. */
const N = 84;
/** How far above the window the edges run, so their ends never show. */
const PAD = 48;
/** A half narrower than this has no slack to hang below the pivot. */
const NARROW = 70;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Close to the pivot the edges leave at a narrow angle, then the page falls open. */
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
 * One edge with the halves drawn all the way aside: out from the pivot along the bottom,
 * round the corner and up the side of the window. The short slope beside the pivot is the
 * last of the page the bottom stop still holds together.
 */
const drawnAside = (l: SeamLayout, dir: -1 | 1, apexY: number, strip: number): Pt[] => {
  const edge = dir < 0 ? strip : l.w - strip;
  const ext = Math.abs(edge - l.x0);
  const yb = l.h - l.flap - 2;
  const gusset = Math.min(128, ext * 0.8);
  const r = Math.max(0, Math.min(60, ext - gusset, yb - 40));
  const pts: Pt[] = [];
  if (ext < NARROW) {
    // No room to sag on this side, as with scissors near the edge of a phone: the half just steps aside.
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

/** A smooth path through the midpoints of a polyline, appended to `d`. `first` says whether to start with a move. */
const through = (pts: Pt[], first: boolean): string => {
  let d = `${first ? 'M' : 'L'}${round(pts[0][0])} ${round(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += `Q${round(pts[i][0])} ${round(pts[i][1])} ${round(mx)} ${round(my)}`;
  }
  const end = pts[pts.length - 1];
  return `${d}L${round(end[0])} ${round(end[1])}`;
};

/**
 * The cut for blades at `p` (0 not started, 1 at the bottom). `lag` is the same number a
 * moment ago: the page follows the blades late, so the width comes from it.
 */
export const computeSeam = (l: SeamLayout, p: number, lag: number): Seam => {
  const apexY = l.y0 + (l.yMax - l.y0) * p;
  const g = clamp01(lag);
  const spread = smoothstep(0.58, 0.98, g);
  // Past the end the page overshoots a little and settles.
  const strip = Math.max(4, l.flap + 2 - (lag - p) * 110);

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

  const left = side(-1);
  const right = side(1);
  const d = `${through(left, true)}${through([...right].reverse(), false)}Z`;
  return { apexY, left, right, d, spread };
};

const trace = (ctx: CanvasRenderingContext2D, pts: Pt[]) => {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) ctx.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
  ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
};

/** The edge moved `by` px onto the page. `dir` is which half it belongs to. */
const offset = (pts: Pt[], dir: -1 | 1, by: number): Pt[] =>
  pts.map(([x, y], i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    return [x - (dir * dy * by) / len, y + (dir * dx * by) / len] as Pt;
  });

let hatch: CanvasPattern | null = null;

/** Diagonal ink hatching on cream, the same texture as the site's hard shadows. Made once, at twice the size, then scaled back. */
const hatchPattern = (ctx: CanvasRenderingContext2D): CanvasPattern | null => {
  if (hatch) return hatch;
  const tile = document.createElement('canvas');
  tile.width = tile.height = 8;
  const t = tile.getContext('2d');
  if (!t) return null;
  t.fillStyle = HATCH_BG;
  t.fillRect(0, 0, 8, 8);
  t.strokeStyle = INK;
  t.globalAlpha = 0.55;
  t.lineWidth = 2;
  // Run past the corners so the lines join across tiles.
  t.beginPath();
  t.moveTo(-2, -2);
  t.lineTo(10, 10);
  t.stroke();
  hatch = ctx.createPattern(tile, 'repeat');
  hatch?.setTransform(new DOMMatrix().scale(0.5));
  return hatch;
};

/**
 * Paints one frame onto a canvas that covers the window. The page underneath shows through
 * `seam.d`, so this only adds what sits on the edge between it and the page being cut.
 */
export const paintCut = (ctx: CanvasRenderingContext2D, l: SeamLayout, seam: Seam) => {
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

  // The line still to cut, ahead of the blades. It fades once the halves are drawn aside.
  ctx.globalAlpha = alpha * (1 - seam.spread);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 7]);
  ctx.beginPath();
  ctx.moveTo(l.x0, seam.apexY + 30);
  ctx.lineTo(l.x0, l.h + 8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = alpha;

  // The page beside the cut: a soft shadow, then the flap curled back along the edge.
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
  // The flap casts the shadow of the lifted edge onto the page.
  ctx.shadowColor = 'rgba(59,58,85,.38)';
  ctx.shadowBlur = 22;
  ctx.strokeStyle = hatchPattern(ctx) ?? HATCH_BG;
  ctx.lineWidth = l.flap * 2;
  edges.forEach((e) => (trace(ctx, e), ctx.stroke()));
  ctx.shadowBlur = 0;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  edges.forEach((e, i) => {
    trace(ctx, offset(e, i ? 1 : -1, l.flap));
    ctx.stroke();
  });
  ctx.restore();

  // The page underneath just inside the cut sits in the shadow of the flaps.
  ctx.save();
  ctx.clip(hole);
  ctx.shadowColor = 'rgba(59,58,85,.35)';
  ctx.shadowBlur = 24;
  ctx.strokeStyle = 'rgba(59,58,85,.35)';
  ctx.lineWidth = 8;
  edges.forEach((e) => (trace(ctx, e), ctx.stroke()));
  ctx.restore();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  edges.forEach((e) => (trace(ctx, e), ctx.stroke()));
  ctx.globalAlpha = 1;
};
