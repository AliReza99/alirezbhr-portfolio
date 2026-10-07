/**
 * Shape of the unzipped opening and the canvas drawing of what lines it: the tape, the
 * teeth and the shadows. Everything here is a pure function of the slider's progress,
 * so the engine can call it on every frame of a drag.
 */

export type Pt = [x: number, y: number];

export type SeamLayout = {
  w: number;
  h: number;
  /** Where the seam runs: the ring's horizontal position. */
  x0: number;
  /** Slider height with the zipper shut, and all the way down. */
  y0: number;
  yMax: number;
  /** Width of the zipper tape along each edge. */
  tape: number;
};

export type Seam = {
  apexY: number;
  /** Each edge of the opening, from the slider outward to above the top of the window. */
  left: Pt[];
  right: Pt[];
  /** The opening as an SVG path, for `clip-path` and the canvas alike. */
  d: string;
  /** 0 while the opening is a V, 1 once the halves are drawn aside. */
  spread: number;
};

const INK = '#3B3A55';
const LILAC = '#A89AFE';
const PURPLE = '#5A49D6';
const PAPER = '#FBF6EF';
const TAPE = '#EFE8D8';

/** Points per edge. */
const N = 84;
/** How far above the window the edges run, so their ends never show. */
const PAD = 48;
/** Distance between two teeth on one side. */
export const PITCH = 13;
/** A half narrower than this has no slack to hang below the slider. */
const NARROW = 70;
/** How far ahead of the slider the shut seam stays visible. */
const AHEAD = 150;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Close to the slider the edges leave at a narrow angle, then the fabric falls open. */
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
 * One edge with the halves drawn all the way aside: out from the slider along the bottom,
 * round the corner and up the side of the window. The short slope beside the slider is the
 * last of the fabric the bottom stop still holds together.
 */
const drawnAside = (l: SeamLayout, dir: -1 | 1, apexY: number, strip: number): Pt[] => {
  const edge = dir < 0 ? strip : l.w - strip;
  const ext = Math.abs(edge - l.x0);
  const yb = l.h - l.tape - 2;
  const gusset = Math.min(128, ext * 0.8);
  const r = Math.max(0, Math.min(60, ext - gusset, yb - 40));
  const pts: Pt[] = [];
  if (ext < NARROW) {
    // No room to sag on this side, as with a ring near the edge of a phone: the half just steps aside.
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
 * The opening for a slider at `p` (0 shut, 1 at the bottom). `lag` is the same number a
 * moment ago: the fabric follows the slider late, so the width comes from it.
 */
export const computeSeam = (l: SeamLayout, p: number, lag: number): Seam => {
  const apexY = l.y0 + (l.yMax - l.y0) * p;
  const g = clamp01(lag);
  const spread = smoothstep(0.58, 0.98, g);
  // Past the end the fabric overshoots a little and settles.
  const strip = Math.max(4, l.tape + 2 - (lag - p) * 110);

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

/** Even-odd ray cast: is the point inside the opening? */
export const insideSeam = (seam: Seam, x: number, y: number): boolean => {
  let inside = false;
  const ring = [...seam.left, ...[...seam.right].reverse()];
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

/** A steady pseudo-random number per tooth, so each keeps its own wobble while it moves. */
const jitter = (n: number) => {
  const s = Math.sin(n * 127.1 + 31.7) * 43758.5453;
  return s - Math.floor(s) - 0.5;
};

const tooth = (ctx: CanvasRenderingContext2D, x: number, y: number, nx: number, ny: number, id: number) => {
  const len = 9.5 + jitter(id) * 1.6;
  const wide = 6.4 + jitter(id + 0.5) * 1.2;
  const lean = jitter(id + 0.25) * 0.16;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(ny, nx) + lean);
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-2.5, -wide / 2, len, wide, 2.4);
  else ctx.rect(-2.5, -wide / 2, len, wide);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
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

/**
 * Paints one frame onto a canvas that covers the window. The page under it is the fabric and
 * the lining shows through `seam.d`, so this only adds what sits on the edge between them.
 */
export const paintSeam = (ctx: CanvasRenderingContext2D, l: SeamLayout, seam: Seam) => {
  ctx.clearRect(0, 0, l.w, l.h);
  const travel = seam.apexY - l.y0;
  if (travel <= 0.5) return;
  const hole = new Path2D(seam.d);
  const page = new Path2D(`M-9-9H${l.w + 9}V${l.h + 9}H-9Z${seam.d}`);
  const edges = [seam.left, seam.right];
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = clamp01(travel / 26);

  // The page beside the opening: a soft curl shadow, then the tape with its row of stitches.
  ctx.save();
  ctx.clip(page, 'evenodd');
  const bunched = smoothstep(0.7, 1, seam.spread);
  if (bunched > 0) {
    // What is left of the page once it is drawn aside is plain bunched fabric.
    ctx.save();
    ctx.globalAlpha *= bunched;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, l.w, l.h);
    ctx.restore();
  }
  // The tape casts the shadow of the lifted edge onto the page.
  ctx.shadowColor = 'rgba(59,58,85,.38)';
  ctx.shadowBlur = 22;
  ctx.strokeStyle = TAPE;
  ctx.lineWidth = l.tape * 2;
  edges.forEach((e) => (trace(ctx, e), ctx.stroke()));
  ctx.shadowBlur = 0;
  edges.forEach((e, i) => {
    const dir = i ? 1 : -1;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([]);
    trace(ctx, offset(e, dir, l.tape));
    ctx.stroke();
    ctx.strokeStyle = PURPLE;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    trace(ctx, offset(e, dir, l.tape * 0.56));
    ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.restore();

  // The lining just inside the opening sits in the page's shadow.
  ctx.save();
  ctx.clip(hole);
  ctx.shadowColor = 'rgba(4,4,10,.75)';
  ctx.shadowBlur = 30;
  ctx.strokeStyle = 'rgba(4,4,10,.5)';
  ctx.lineWidth = 10;
  edges.forEach((e) => (trace(ctx, e), ctx.stroke()));
  ctx.restore();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  edges.forEach((e) => (trace(ctx, e), ctx.stroke()));

  ctx.fillStyle = LILAC;
  ctx.lineWidth = 1.5;

  // The seam still shut below the slider. It fades out ahead until the halves are drawn aside.
  const reach = AHEAD + (l.h - seam.apexY - AHEAD) * seam.spread;
  const alpha = ctx.globalAlpha;
  for (let k = Math.ceil((seam.apexY + 12 - l.y0) / (PITCH / 2)); ; k++) {
    const y = l.y0 + (k * PITCH) / 2;
    const fade = 1 - (y - seam.apexY) / reach;
    if (fade <= 0 || y > l.h + 8) break;
    ctx.globalAlpha = alpha * Math.min(1, fade * 1.6);
    const dir = k % 2 ? 1 : -1;
    tooth(ctx, l.x0 - dir * 4.2, y, dir, 0, k);
  }
  ctx.globalAlpha = alpha;

  // The open teeth. Each sits a fixed distance along the fabric from where it left the slider.
  edges.forEach((e, side) => {
    const dir = side ? 1 : -1;
    const shift = side ? PITCH / 2 : 0;
    const first = Math.floor((travel - shift) / PITCH);
    let walked = 0;
    let at = (((travel - shift) % PITCH) + PITCH) % PITCH;
    let id = first;
    for (let i = 1; i < e.length; i++) {
      const dx = e[i][0] - e[i - 1][0];
      const dy = e[i][1] - e[i - 1][1];
      const len = Math.hypot(dx, dy);
      for (; at <= walked + len; at += PITCH, id--) {
        if (at < 12) continue;
        const t = (at - walked) / len;
        const x = e[i - 1][0] + dx * t;
        const y = e[i - 1][1] + dy * t;
        if (y < -12) return;
        // Left edge: the opening is to the right of the way the edge runs. Right edge: to the left.
        tooth(ctx, x, y, (dir * dy) / len, (-dir * dx) / len, id * 2 + side);
      }
      walked += len;
    }
  });
  ctx.globalAlpha = 1;
};
