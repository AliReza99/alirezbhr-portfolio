import { createGroup, SVG_NS, type RoughOptions, type RoughSVG } from './rough';

/**
 * rough.js sketches drawn into `data-bd` elements (mostly the basement).
 * Each returns the SVG nodes for one frame; frames differ only by seed,
 * which gives the line-boil when cycled.
 */
export type SketchContext = {
  /** Basement light is off. */
  dark: boolean;
  /** Basement is open (the cat's tail hangs down through the hatch). */
  open: boolean;
};

export type SketchFn = (rc: RoughSVG, w: number, h: number, o: (x?: RoughOptions) => RoughOptions, ctx: SketchContext) => SVGElement[];

export type SketchType = 'wall' | 'floor' | 'ladder' | 'ladink' | 'box' | 'paper' | 'sign' | 'cat' | 'climb' | 'cord' | 'socket' | 'bulb';

/** Sketches that sit behind their element's own content. */
export const BACK_SKETCHES: readonly SketchType[] = ['box', 'paper', 'sign', 'socket', 'bulb'];

const CREAM = '#FBF6EF';
const INK = '#3B3A55';
const INK_DEEP = '#1A192A';

/** The ladder tips poking up through the floor at the bottom of the page. */
const ladderTop = (rc: RoughSVG, h: number, o: (x?: RoughOptions) => RoughOptions, c: string) => {
  const r = [rc.line(18, 4, 15, h, o({ stroke: c, strokeWidth: 3, bowing: 1.2 })), rc.line(78, 4, 81, h, o({ stroke: c, strokeWidth: 3, bowing: 1.2 }))];
  for (let y = 24, k = 0; y < h - 8; y += 38, k++) r.push(rc.line(17, y, 80, y + (k % 2 ? 2 : -2), o({ stroke: c, strokeWidth: 2.6 })));
  return r;
};

export const SKETCHES: Record<SketchType, SketchFn> = {
  floor: (rc, w, h, o) => [
    rc.rectangle(-6, 8, w + 12, h, o({ stroke: 'none', fill: 'rgba(251,246,239,.13)', fillStyle: 'hachure', hachureGap: 10, hachureAngle: -18, fillWeight: 1.3 })),
    rc.line(0, 2, w, 2, o({ stroke: CREAM, strokeWidth: 2.4, roughness: 0.5, bowing: 0.3 })),
  ],

  wall: (rc, w, h, o) => {
    const st = o({ stroke: 'rgba(251,246,239,.17)', strokeWidth: 1.4, roughness: 1.7 });
    const r: SVGElement[] = [];
    // A few loose patches of sketched bricks; a phone-width wall only has room for two.
    const patches: [number, number][] = [
      [0.05, 0.42],
      [0.52, 0.47],
      [0.74, 0.2],
      [0.86, 0.6],
      [0.3, 0.14],
    ];
    patches.slice(0, w < 600 ? 2 : 5).forEach(([fx, fy], q) => {
      const x = fx * w;
      const y = fy * h;
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3 - (i % 2); j++) if ((i + j + q) % 4) r.push(rc.rectangle(x + j * 46 + (i % 2) * 23, y + i * 22, 42, 18, st));
    });
    // Cobweb in the top-right corner, with a spider.
    const cx = w - 6;
    const cy = 34;
    const ln = Math.min(110, w * 0.22);
    const web = o({ stroke: 'rgba(251,246,239,.28)', strokeWidth: 1.1, roughness: 1 });
    const an = [95, 120, 145, 170].map((a) => (a * Math.PI) / 180);
    an.forEach((a) => r.push(rc.line(cx, cy, cx + Math.cos(a) * ln, cy + Math.sin(a) * ln, web)));
    [0.35, 0.62, 0.9].forEach((t) => r.push(rc.curve(an.map((a) => [cx + Math.cos(a) * ln * t, cy + Math.sin(a) * ln * t] as [number, number]), web)));
    const sx = cx + Math.cos(an[1]) * ln * 0.62;
    const sy = cy + Math.sin(an[1]) * ln * 0.62;
    r.push(rc.line(sx, sy, sx, sy + 46, web));
    r.push(rc.circle(sx, sy + 50, 8, o({ stroke: 'rgba(251,246,239,.4)', fill: 'rgba(251,246,239,.4)', fillStyle: 'solid' })));
    // A crack.
    r.push(
      rc.linearPath(
        [
          [w * 0.2, h * 0.58],
          [w * 0.215, h * 0.63],
          [w * 0.205, h * 0.67],
          [w * 0.225, h * 0.72],
          [w * 0.218, h * 0.76],
        ],
        o({ stroke: 'rgba(251,246,239,.22)', strokeWidth: 1.3 }),
      ),
    );
    return r;
  },

  ladder: (rc, _w, h, o) => {
    const r = [rc.line(18, 0, 15, h, o({ stroke: CREAM, strokeWidth: 3, bowing: 1.5 })), rc.line(78, 0, 81, h, o({ stroke: CREAM, strokeWidth: 3, bowing: 1.5 }))];
    for (let y = 12, k = 0; y < h - 8; y += 38, k++) r.push(rc.line(17, y, 80, y + (k % 2 ? 2 : -2), o({ stroke: CREAM, strokeWidth: 2.6 })));
    return r;
  },

  ladink: (rc, _w, h, o) => ladderTop(rc, h, o, INK_DEEP),

  box: (rc, w, h, o) => [
    rc.rectangle(1, 1, w - 2, h - 2, o({ fill: '#B48D63', fillStyle: 'solid', stroke: INK_DEEP, strokeWidth: 2, roughness: 1.1 })),
    rc.line(2, h * 0.3, w - 2, h * 0.3, o({ stroke: INK_DEEP, strokeWidth: 1.5 })),
    rc.rectangle(w * 0.38, 1, w * 0.24, h * 0.3, o({ stroke: 'rgba(26,25,42,.55)', strokeWidth: 1, fill: 'rgba(240,222,186,.85)', fillStyle: 'solid', roughness: 0.8 })),
  ],

  paper: (rc, w, h, o) => [rc.rectangle(1, 1, w - 2, h - 2, o({ fill: '#FFFCF7', fillStyle: 'solid', stroke: INK, strokeWidth: 1.3, roughness: 1.2 }))],

  sign: (rc, w, h, o) => [
    rc.rectangle(8, 10, w - 4, h - 4, o({ stroke: 'none', fill: 'rgba(0,0,0,.5)', fillStyle: 'hachure', hachureGap: 3, hachureAngle: -45, fillWeight: 1.2 })),
    rc.rectangle(1, 1, w - 2, h - 2, o({ fill: CREAM, fillStyle: 'solid', stroke: INK_DEEP, strokeWidth: 2.6, roughness: 1.3 })),
    rc.circle(10, 10, 6, o({ stroke: INK_DEEP, fill: INK_DEEP, fillStyle: 'solid' })),
    rc.circle(w - 10, 10, 6, o({ stroke: INK_DEEP, fill: INK_DEEP, fillStyle: 'solid' })),
  ],

  /** Curled-up sleeping cat, facing right. Her tail hangs through the hatch while the basement is open. */
  cat: (rc, w, _h, o, { open }) => {
    const F = '#FFFDF8';
    const g = createGroup();
    const k = w / 124;
    g.setAttribute('transform', `translate(${w},0) scale(${-k},${k})`);
    const fill = o({ fill: F, fillStyle: 'solid', stroke: INK, strokeWidth: 2.2, roughness: 0.9 });
    const line = o({ stroke: INK, strokeWidth: 2, roughness: 0.8 });
    const thin = o({ stroke: INK, strokeWidth: 1.6, roughness: 0.6 });
    // One curve each: rough.js jitters every segment's ends, so a two-segment tail comes apart at the joint.
    const d = open ? 'M104 60 C122 72 102 102 119 118' : 'M108 62 C100 73 56 73 44 61';
    const tail = rc.path(d, o({ stroke: INK, strokeWidth: 5.5, roughness: 0.5 }));
    const tailIn = rc.path(d, o({ stroke: F, strokeWidth: 2, roughness: 0.5 }));
    [
      rc.path('M16 66 C10 42 32 24 62 24 C92 24 112 40 112 66 Z', fill),
      tail,
      tailIn,
      rc.path('M70 29 Q75 35 73 42', thin),
      rc.path('M84 31 Q88 37 86 43', thin),
      rc.path('M97 37 Q100 42 98 48', thin),
      rc.path('M16 42 L18 26 L29 35 Z', fill),
      rc.path('M34 33 L44 24 L46 40 Z', fill),
      rc.ellipse(32, 50, 34, 30, fill),
      rc.path('M22 49 Q25.5 52.5 29 49', line),
      rc.path('M35 49 Q38.5 52.5 42 49', line),
      rc.path('M31 55 L32 56.5 L33 55', thin),
      rc.line(18, 54, 8, 52, thin),
      rc.line(18, 57, 9, 59, thin),
      rc.line(46, 54, 56, 52, thin),
    ].forEach((p) => g.appendChild(p));
    return [g];
  },

  /** Two paws of tapered claw marks dragging down off the LinkedIn button. */
  climb: (_rc, w, h, o) => {
    const r: SVGElement[] = [];
    let s = o().seed ?? 1;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const sliver = (x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, t0: number, t1: number, wd: number) => {
      const L: [number, number][] = [];
      const R: [number, number][] = [];
      const N = 14;
      for (let k = 0; k <= N; k++) {
        const t = t0 + ((t1 - t0) * k) / N;
        const u = 1 - t;
        const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
        const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
        const dx = 2 * u * (cx - x0) + 2 * t * (x1 - cx);
        const dy = 2 * u * (cy - y0) + 2 * t * (y1 - cy);
        const m = Math.hypot(dx, dy) || 1;
        const half = ((wd * Math.pow(1 - t, 0.7) + 0.15) * (0.8 + rnd() * 0.4)) / 2;
        L.push([x - (dy / m) * half, y + (dx / m) * half]);
        R.unshift([x + (dy / m) * half, y - (dx / m) * half]);
      }
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', `M${L.concat(R).map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L')} Z`);
      p.setAttribute('fill', '#16161C');
      return p;
    };
    (
      [
        [w * 0.2, 2, 1, 0.95],
        [w * 0.66, 4, -1, 0.7],
      ] as const
    ).forEach(([bx, by, d, len]) => {
      for (let i = 0; i < 4; i++) {
        const outer = i === 0 || i === 3;
        const x0 = bx + i * 5.5 + (rnd() - 0.5) * 1.5;
        const y0 = by + (outer ? 3 : 0) + rnd() * 2;
        const Lh = h * len * (outer ? 0.78 : 1) * (0.85 + rnd() * 0.2);
        const x1 = x0 + d * (4 + i * 1.5);
        const cx = x0 + d * (1 + rnd() * 2);
        const wd = outer ? 2.2 : 3;
        if (rnd() < 0.45) {
          // The claw skipped: leave a small break in the mark.
          const gap = 0.5 + rnd() * 0.12;
          r.push(sliver(x0, y0, cx, y0 + Lh / 2, x1, y0 + Lh, 0, gap, wd));
          r.push(sliver(x0, y0, cx, y0 + Lh / 2, x1, y0 + Lh, gap + 0.07, 1, wd));
        } else r.push(sliver(x0, y0, cx, y0 + Lh / 2, x1, y0 + Lh, 0, 1, wd));
      }
      for (let k = 0; k < 3; k++) {
        const c = document.createElementNS(SVG_NS, 'circle');
        c.setAttribute('cx', (bx + rnd() * 22 - 3).toFixed(1));
        c.setAttribute('cy', (by + 6 + rnd() * 10).toFixed(1));
        c.setAttribute('r', (0.5 + rnd() * 0.7).toFixed(2));
        c.setAttribute('fill', '#16161C');
        r.push(c);
      }
    });
    return r;
  },

  cord: (rc, _w, h, o) => [rc.line(2, 0, 2, h, o({ stroke: CREAM, strokeWidth: 1.6, roughness: 0.4, bowing: 0.3 }))],

  socket: (rc, w, h, o) => [rc.rectangle(1, 0, w - 2, h, o({ fill: '#3A3A3A', fillStyle: 'solid', stroke: CREAM, strokeWidth: 1.8 }))],

  bulb: (rc, w, h, o, { dark }) => [
    rc.ellipse(w / 2, h / 2, w, h, o({ fill: dark ? '#555555' : '#FFD58A', fillStyle: 'solid', stroke: CREAM, strokeWidth: 1.8 })),
    rc.ellipse(w * 0.4, h * 0.36, w * 0.38, h * 0.36, o({ stroke: 'none', fill: dark ? 'rgba(251,246,239,.18)' : '#FFF8E4', fillStyle: 'hachure', hachureGap: 2.5, fillWeight: 1 })),
    rc.linearPath(
      [
        [w * 0.3, h * 0.66],
        [w * 0.4, h * 0.5],
        [w * 0.5, h * 0.66],
        [w * 0.6, h * 0.5],
        [w * 0.7, h * 0.66],
      ],
      o({ stroke: dark ? '#8C8C8C' : '#E8763E', strokeWidth: 1.4, roughness: 0.6 }),
    ),
  ],
};
