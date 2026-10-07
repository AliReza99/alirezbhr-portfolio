import { createGroup, type RoughOptions, type RoughSVG } from './rough';

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

export type SketchType = 'wall' | 'floor' | 'ladder' | 'ladink' | 'box' | 'paper' | 'sign' | 'cat' | 'catpeek' | 'catup' | 'catstep' | 'catstride' | 'cord' | 'socket' | 'bulb';

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

const FUR = '#FFFDF8';

/** Where each leg's foot lands, front pair then back pair. The tops stay tucked under the body. */
const CAT_LEGS: [top: number, foot: number][] = [
  [46, 38],
  [54, 60],
  [88, 82],
  [96, 104],
];

/**
 * The same cat as the sleeping one, up on her feet and awake. Drawn in the same 124-wide box and
 * mirrored the same way, so she faces right. `stride` is how far the feet are thrown: 1 is mid-step, 0 is legs together.
 */
const standingCat = (rc: RoughSVG, w: number, o: (x?: RoughOptions) => RoughOptions, stride: number): SVGElement[] => {
  const g = createGroup();
  const k = w / 124;
  g.setAttribute('transform', `translate(${w},0) scale(${-k},${k})`);
  const fill = o({ fill: FUR, fillStyle: 'solid', stroke: INK, strokeWidth: 2.2, roughness: 0.9 });
  const thin = o({ stroke: INK, strokeWidth: 1.6, roughness: 0.6 });
  const limb = o({ stroke: INK, strokeWidth: 6.5, roughness: 0.4 });
  const limbIn = o({ stroke: FUR, strokeWidth: 2.6, roughness: 0.4 });
  const tail = stride ? 'M102 34 C116 31 119 16 111 6' : 'M102 34 C117 32 121 18 115 7';
  const legs = CAT_LEGS.flatMap(([top, foot]) => {
    const x = top + (foot - top) * (stride ? 1 : 0.15);
    return [rc.line(top, 46, x, 64, limb), rc.line(top, 46, x, 64, limbIn)];
  });
  [
    rc.path(tail, o({ stroke: INK, strokeWidth: 5.5, roughness: 0.5 })),
    rc.path(tail, o({ stroke: FUR, strokeWidth: 2, roughness: 0.5 })),
    ...legs,
    rc.path('M38 30 C56 21 92 21 103 31 C110 39 107 50 98 52 L46 52 C37 50 33 40 38 30 Z', fill),
    rc.path('M66 25 Q70 30 68 37', thin),
    rc.path('M80 25 Q84 30 82 37', thin),
    rc.path('M93 28 Q96 33 94 39', thin),
    rc.path('M12 20 L14 4 L25 13 Z', fill),
    rc.path('M30 11 L40 2 L42 18 Z', fill),
    rc.ellipse(28, 28, 34, 30, fill),
    rc.circle(21.5, 27, 3.4, o({ stroke: INK, fill: INK, fillStyle: 'solid', strokeWidth: 1, roughness: 0.4 })),
    rc.circle(34.5, 27, 3.4, o({ stroke: INK, fill: INK, fillStyle: 'solid', strokeWidth: 1, roughness: 0.4 })),
    rc.path('M27 33 L28 34.5 L29 33', thin),
    rc.line(14, 32, 4, 30, thin),
    rc.line(14, 35, 5, 37, thin),
    rc.line(42, 32, 52, 30, thin),
  ].forEach((p) => g.appendChild(p));
  return [g];
};

/**
 * The cat curled up, facing right. Her tail hangs through the hatch while the basement is open.
 * `peek` opens one eye. `up` lifts her head off the floor, both eyes open and not pleased.
 */
const curledCat = (rc: RoughSVG, w: number, o: (x?: RoughOptions) => RoughOptions, open: boolean, pose: 'asleep' | 'peek' | 'up'): SVGElement[] => {
  const g = createGroup();
  const k = w / 124;
  g.setAttribute('transform', `translate(${w},0) scale(${-k},${k})`);
  const fill = o({ fill: FUR, fillStyle: 'solid', stroke: INK, strokeWidth: 2.2, roughness: 0.9 });
  const line = o({ stroke: INK, strokeWidth: 2, roughness: 0.8 });
  const thin = o({ stroke: INK, strokeWidth: 1.6, roughness: 0.6 });
  // One curve each: rough.js jitters every segment's ends, so a two-segment tail comes apart at the joint.
  const d = open ? 'M104 60 C122 72 102 102 119 118' : 'M108 62 C100 73 56 73 44 61';
  const shut = (x: number) => rc.path(`M${x - 3.5} 49 Q${x} 52.5 ${x + 3.5} 49`, line);
  const eye = (x: number) => rc.circle(x, 49.5, 3.4, o({ stroke: INK, fill: INK, fillStyle: 'solid', strokeWidth: 1, roughness: 0.4 }));
  const eyes = {
    asleep: () => [shut(25.5), shut(38.5)],
    peek: () => [shut(25.5), eye(38.5)],
    up: () => [eye(25.5), eye(38.5), rc.line(21, 44, 28.5, 46.5, thin), rc.line(43, 44, 35.5, 46.5, thin)],
  }[pose]();
  const head = createGroup();
  if (pose === 'up') head.setAttribute('transform', 'translate(-3,-12)');
  [
    rc.path('M16 42 L18 26 L29 35 Z', fill),
    rc.path('M34 33 L44 24 L46 40 Z', fill),
    rc.ellipse(32, 50, 34, 30, fill),
    ...eyes,
    rc.path('M31 55 L32 56.5 L33 55', thin),
    rc.line(18, 54, 8, 52, thin),
    rc.line(18, 57, 9, 59, thin),
    rc.line(46, 54, 56, 52, thin),
  ].forEach((p) => head.appendChild(p));
  [
    rc.path('M16 66 C10 42 32 24 62 24 C92 24 112 40 112 66 Z', fill),
    rc.path(d, o({ stroke: INK, strokeWidth: 5.5, roughness: 0.5 })),
    rc.path(d, o({ stroke: FUR, strokeWidth: 2, roughness: 0.5 })),
    rc.path('M70 29 Q75 35 73 42', thin),
    rc.path('M84 31 Q88 37 86 43', thin),
    rc.path('M97 37 Q100 42 98 48', thin),
    head,
  ].forEach((p) => g.appendChild(p));
  return [g];
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
    // Cobweb in the top-right corner. The spider hangs from the second spoke; `.spider` repeats these numbers.
    const cx = w - 6;
    const cy = 34;
    const ln = Math.min(110, w * 0.22);
    const web = o({ stroke: 'rgba(251,246,239,.28)', strokeWidth: 1.1, roughness: 1 });
    const an = [95, 120, 145, 170].map((a) => (a * Math.PI) / 180);
    an.forEach((a) => r.push(rc.line(cx, cy, cx + Math.cos(a) * ln, cy + Math.sin(a) * ln, web)));
    [0.35, 0.62, 0.9].forEach((t) => r.push(rc.curve(an.map((a) => [cx + Math.cos(a) * ln * t, cy + Math.sin(a) * ln * t] as [number, number]), web)));
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
    // The two lid flaps, meeting at a seam in the middle.
    rc.line(2, h * 0.3, w - 2, h * 0.3, o({ stroke: INK_DEEP, strokeWidth: 1.5 })),
    rc.line(w * 0.5, 3, w * 0.5, h * 0.3, o({ stroke: INK_DEEP, strokeWidth: 1.2, bowing: 0.6 })),
  ],

  paper: (rc, w, h, o) => [rc.rectangle(1, 1, w - 2, h - 2, o({ fill: '#FFFCF7', fillStyle: 'solid', stroke: INK, strokeWidth: 1.3, roughness: 1.2 }))],

  /** A dark screwed-on plate with a cream rim, so it does not read as one of the cream speech bubbles. */
  sign: (rc, w, h, o) => [
    rc.rectangle(1, 1, w - 2, h - 2, o({ fill: '#2C2B40', fillStyle: 'solid', stroke: CREAM, strokeWidth: 2, roughness: 1 })),
    rc.circle(8, 8, 3.5, o({ stroke: CREAM, fill: CREAM, fillStyle: 'solid', roughness: 0.6 })),
    rc.circle(w - 8, 8, 3.5, o({ stroke: CREAM, fill: CREAM, fillStyle: 'solid', roughness: 0.6 })),
  ],

  cat: (rc, w, _h, o, { open }) => curledCat(rc, w, o, open, 'asleep'),
  catpeek: (rc, w, _h, o, { open }) => curledCat(rc, w, o, open, 'peek'),
  catup: (rc, w, _h, o, { open }) => curledCat(rc, w, o, open, 'up'),

  /** The cat walking: legs together, then mid-step. Swapping the two is her walk. */
  catstep: (rc, w, _h, o) => standingCat(rc, w, o, 0),
  catstride: (rc, w, _h, o) => standingCat(rc, w, o, 1),

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
