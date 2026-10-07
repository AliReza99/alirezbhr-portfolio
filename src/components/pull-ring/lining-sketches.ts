import type { RoughOptions, RoughSVG } from '../../lib/rough';
import type { FrameDraw } from './use-rough-frames';

/**
 * rough.js drawings for what is sewn into the lining. Stitches are separate short lines
 * carrying `--i`, their place in the run, so the CSS can sew them on one after another.
 */

const INK = '#3B3A55';
const INK_DEEP = '#1A192A';
const CREAM = '#FBF6EF';
const CARD = '#FFFCF7';
const LILAC = '#A89AFE';
const PURPLE = '#5A49D6';
const CORAL = '#F4916B';
const POCKET = '#24233A';
const FAINT = 'rgba(251,246,239,.5)';

type Opt = (x?: RoughOptions) => RoughOptions;
type Pt = [number, number];

const DASH = 8;
const GAP = 5.5;

/** A run of stitches along a polyline. */
const sew = (rc: RoughSVG, o: Opt, pts: Pt[], stroke: string, from = 0): SVGElement[] => {
  const out: SVGElement[] = [];
  let i = from;
  for (let s = 1; s < pts.length; s++) {
    const [ax, ay] = pts[s - 1];
    const [bx, by] = pts[s];
    const len = Math.hypot(bx - ax, by - ay);
    const count = Math.max(1, Math.floor((len + GAP) / (DASH + GAP)));
    const pad = (len - count * DASH - (count - 1) * GAP) / 2;
    for (let k = 0; k < count; k++) {
      const t0 = (pad + k * (DASH + GAP)) / len;
      const t1 = t0 + DASH / len;
      const g = rc.line(ax + (bx - ax) * t0, ay + (by - ay) * t0, ax + (bx - ax) * t1, ay + (by - ay) * t1, o({ stroke, strokeWidth: 2, roughness: 0.5, bowing: 0.4, disableMultiStroke: true }));
      g.setAttribute('class', 'pull-ring__stitch');
      g.style.setProperty('--i', `${i++}`);
      out.push(g);
    }
  }
  return out;
};

const box = (x: number, y: number, w: number, h: number): Pt[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
  [x, y],
];

/** A woven label: a filled patch with a faint weave, stitched down all the way round. */
const woven =
  (fill: string, thread: string): FrameDraw =>
  (rc, w, h, o) => [
    rc.rectangle(2, 2, w - 4, h - 4, o({ fill, fillStyle: 'solid', stroke: INK, strokeWidth: 2.2, roughness: 0.9 })),
    rc.rectangle(5, 5, w - 10, h - 10, o({ stroke: 'none', fill: 'rgba(59,58,85,.09)', fillStyle: 'hachure', hachureAngle: 0, hachureGap: 5, fillWeight: 0.8, roughness: 0.6 })),
    ...sew(rc, o, box(10, 10, w - 20, h - 20), thread),
  ];

const cross = (rc: RoughSVG, o: Opt, w: number, h: number) => [
  rc.line(1, 2, w - 1, h - 2, o({ stroke: CORAL, strokeWidth: 2.2, roughness: 0.8 })),
  rc.line(w - 1, 2, 1, h - 2, o({ stroke: CORAL, strokeWidth: 2.2, roughness: 0.8 })),
];

const thin = (o: Opt) => o({ stroke: INK, strokeWidth: 1.7, roughness: 0.7 });

export const LINING: Record<string, FrameDraw> = {
  cream: woven(CREAM, PURPLE),
  lilac: woven(LILAC, INK),

  /** The care tag is only sewn along its top edge, with two rows. */
  care: (rc, w, h, o) => [
    rc.rectangle(2, 2, w - 4, h - 4, o({ fill: CARD, fillStyle: 'solid', stroke: INK, strokeWidth: 2, roughness: 0.8 })),
    ...sew(rc, o, [[9, 9], [w - 9, 9]], PURPLE),
    ...sew(rc, o, [[9, 16], [w - 9, 16]], PURPLE, 4),
  ],

  /** A size label: a folded loop, sewn at one end. */
  size: (rc, w, h, o) => [
    rc.rectangle(2, 2, w - 4, h - 4, o({ fill: CORAL, fillStyle: 'solid', stroke: INK, strokeWidth: 2, roughness: 0.8 })),
    ...sew(rc, o, [[9, 7], [9, h - 7]], INK_DEEP),
  ],

  /** Front of the inner pocket: a welt across the top and a stitched U below it. */
  pocket: (rc, w, h, o) => [
    rc.path(`M2 2 L${w - 2} 2 L${w - 2} ${h - 30} Q${w - 2} ${h - 2} ${w - 30} ${h - 2} L30 ${h - 2} Q2 ${h - 2} 2 ${h - 30} Z`, o({ fill: POCKET, fillStyle: 'solid', stroke: FAINT, strokeWidth: 1.8, roughness: 0.8 })),
    rc.line(3, 20, w - 3, 20, o({ stroke: FAINT, strokeWidth: 1.4, roughness: 0.6 })),
    ...sew(rc, o, [[12, 32], [12, h - 30], [30, h - 12], [w - 30, h - 12], [w - 12, h - 30], [w - 12, 32]], LILAC),
  ],

  /** A folded sheet: the resume, with a few lines of it showing. */
  paper: (rc, w, h, o) => [
    rc.path(`M2 2 L${w - 16} 2 L${w - 2} 16 L${w - 2} ${h - 2} L2 ${h - 2} Z`, o({ fill: CARD, fillStyle: 'solid', stroke: INK, strokeWidth: 2, roughness: 0.8 })),
    rc.path(`M${w - 16} 2 L${w - 16} 16 L${w - 2} 16`, thin(o)),
    ...[0, 1, 2, 3].map((k) => rc.line(12, h * 0.44 + k * 13, w - (k % 2 ? 30 : 14), h * 0.44 + k * 13, o({ stroke: 'rgba(59,58,85,.4)', strokeWidth: 1.5, roughness: 0.8 }))),
  ],

  envelope: (rc, w, h, o) => [
    rc.rectangle(2, 2, w - 4, h - 4, o({ fill: CARD, fillStyle: 'solid', stroke: INK, strokeWidth: 2, roughness: 0.8 })),
    rc.path(`M3 ${h - 3} L${w * 0.5} ${h * 0.5} L${w - 3} ${h - 3}`, thin(o)),
    rc.rectangle(w - (w < 120 ? 23 : 34), 9, w < 120 ? 15 : 24, w < 120 ? 18 : 28, o({ stroke: PURPLE, strokeWidth: 1.6, roughness: 0.9, fill: 'rgba(168,154,254,.5)', fillStyle: 'hachure', hachureGap: 3.5 })),
  ],

  /** The little bag a spare button comes in. */
  bag: (rc, w, h, o) => [
    rc.rectangle(3, 3, w - 6, h - 6, o({ stroke: FAINT, strokeWidth: 1.6, roughness: 1, fill: 'rgba(251,246,239,.07)', fillStyle: 'solid' })),
    rc.line(4, 16, w - 4, 16, o({ stroke: FAINT, strokeWidth: 3, roughness: 0.5 })),
    rc.circle(w / 2, h * 0.6, w * 0.46, o({ fill: CORAL, fillStyle: 'solid', stroke: CREAM, strokeWidth: 1.8, roughness: 0.7 })),
    rc.circle(w / 2, h * 0.6, w * 0.3, o({ stroke: INK_DEEP, strokeWidth: 1.2, roughness: 0.7 })),
    ...[
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].map(([a, b]) => rc.circle(w / 2 + a * 4.5, h * 0.6 + b * 4.5, 3.6, o({ fill: INK_DEEP, fillStyle: 'solid', stroke: INK_DEEP, roughness: 0.4 }))),
    rc.path(`M${w * 0.5} ${h * 0.6 + w * 0.23} q8 12 -4 20 t6 14`, o({ stroke: LILAC, strokeWidth: 1.5, roughness: 0.6 })),
  ],

  coin: (rc, w, h, o) => [
    rc.ellipse(w / 2, h / 2, w - 4, h - 4, o({ fill: '#F2C76B', fillStyle: 'solid', stroke: CREAM, strokeWidth: 2, roughness: 0.7 })),
    rc.ellipse(w / 2, h / 2, w - 16, h - 16, o({ stroke: '#8A6A1E', strokeWidth: 1.4, roughness: 0.8 })),
    rc.path(`M${w * 0.42} ${h * 0.36} L${w * 0.6} ${h * 0.36} M${w * 0.44} ${h * 0.36} L${w * 0.42} ${h * 0.5} Q${w * 0.62} ${h * 0.46} ${w * 0.6} ${h * 0.6} Q${w * 0.5} ${h * 0.7} ${w * 0.4} ${h * 0.62}`, o({ stroke: '#8A6A1E', strokeWidth: 2, roughness: 0.5 })),
  ],

  sock: (rc, w, h, o) => {
    const d = `M${w * 0.12} 4 L${w * 0.5} 4 L${w * 0.52} ${h * 0.5} Q${w * 0.56} ${h * 0.62} ${w * 0.78} ${h * 0.64} Q${w - 3} ${h * 0.68} ${w - 4} ${h * 0.82} Q${w - 6} ${h - 3} ${w * 0.7} ${h - 3} L${w * 0.3} ${h - 3} Q${w * 0.08} ${h - 6} ${w * 0.1} ${h * 0.66} Z`;
    return [
      rc.path(d, o({ fill: LILAC, fillStyle: 'solid', stroke: CREAM, strokeWidth: 2, roughness: 0.8 })),
      rc.line(w * 0.12, 16, w * 0.5, 16, o({ stroke: INK_DEEP, strokeWidth: 3, roughness: 0.6 })),
      rc.line(w * 0.12, 26, w * 0.5, 26, o({ stroke: INK_DEEP, strokeWidth: 3, roughness: 0.6 })),
      rc.path(`M${w * 0.14} ${h * 0.7} Q${w * 0.2} ${h * 0.9} ${w * 0.34} ${h - 5}`, o({ stroke: INK_DEEP, strokeWidth: 1.6, roughness: 0.6 })),
      rc.path(`M${w * 0.82} ${h * 0.67} Q${w * 0.76} ${h * 0.82} ${w * 0.8} ${h - 5}`, o({ stroke: INK_DEEP, strokeWidth: 1.6, roughness: 0.6 })),
    ];
  },

  ticket: (rc, w, h, o) => [
    rc.rectangle(2, 2, w - 4, h - 4, o({ fill: CREAM, fillStyle: 'solid', stroke: INK, strokeWidth: 2, roughness: 0.9 })),
    rc.line(w * 0.74, 5, w * 0.74, h - 5, o({ stroke: INK, strokeWidth: 1.4, roughness: 0.6, strokeLineDash: [4, 5] })),
    rc.path(`M${w * 0.8} ${h * 0.3} L${w * 0.93} ${h * 0.3} M${w * 0.8} ${h * 0.5} L${w * 0.93} ${h * 0.5} M${w * 0.8} ${h * 0.7} L${w * 0.9} ${h * 0.7}`, thin(o)),
  ],

  /** A thread that came loose and never got trimmed. */
  thread: (rc, w, h, o) => [
    rc.curve(
      [
        [w * 0.2, 2],
        [w * 0.7, h * 0.18],
        [w * 0.25, h * 0.4],
        [w * 0.8, h * 0.6],
        [w * 0.4, h * 0.8],
        [w * 0.6, h - 2],
      ],
      o({ stroke: LILAC, strokeWidth: 1.8, roughness: 0.7 }),
    ),
  ],

  /** Care symbols. Each fits a 30 by 26 box. */
  tub: (rc, w, h, o) => [rc.path(`M2 7 L${w - 2} 7 L${w - 6} ${h - 3} L6 ${h - 3} Z`, thin(o)), rc.path(`M5 12 q4 -4 7 0 t7 0 t6 0`, thin(o)), ...cross(rc, o, w, h)],
  iron: (rc, w, h, o) => [rc.path(`M3 ${h - 4} L${w - 3} ${h - 4} Q${w - 4} 8 ${w * 0.45} 7 L${w * 0.3} 7 M3 ${h - 4} Q4 ${h * 0.55} ${w * 0.5} ${h * 0.5} L${w - 5} ${h * 0.5}`, thin(o)), ...cross(rc, o, w, h)],
  bleach: (rc, w, h, o) => [rc.path(`M${w / 2} 3 L${w - 3} ${h - 3} L3 ${h - 3} Z`, thin(o)), ...cross(rc, o, w, h)],
  tumble: (rc, w, h, o) => [rc.rectangle(4, 2, w - 8, h - 4, thin(o)), rc.circle(w / 2, h / 2, h - 9, thin(o)), rc.circle(w / 2, h / 2, 2.5, o({ fill: INK, fillStyle: 'solid', stroke: INK, roughness: 0.4 }))],
};
