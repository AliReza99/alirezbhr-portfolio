import { useEffect, useRef } from 'react';
import { canAnimate } from '../../lib/motion';
import { roughSvg, roundCaps, type RoughOptions, type RoughSVG } from '../../lib/rough';

const INK = '#5A49D6';
const C = 8;

const star = (n: number): [number, number][] =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const r = i % 2 ? 3 : 7.5;
    return [C + r * Math.cos(a), C + r * Math.sin(a)];
  });

type ShapeFn = (rc: RoughSVG, o: (x?: RoughOptions) => RoughOptions) => SVGGElement;

const SHAPES: ShapeFn[] = [
  (rc, o) => rc.polygon(star(5), o({ fill: INK, fillStyle: 'zigzag', hachureGap: 2.2, fillWeight: 1 })),
  (rc, o) => rc.circle(C, C, 11, o({ fill: INK, fillStyle: 'cross-hatch', hachureGap: 2.6, fillWeight: 1 })),
  (rc, o) =>
    rc.polygon(
      [
        [C, 1.5],
        [14.5, C],
        [C, 14.5],
        [1.5, C],
      ],
      o({ fill: INK, fillStyle: 'hachure', hachureGap: 2.4, hachureAngle: Math.random() * 180 }),
    ),
  (rc, o) => rc.path('M8 1.5 V14.5 M1.5 8 H14.5 M3.4 3.4 L12.6 12.6 M12.6 3.4 L3.4 12.6', o({ strokeWidth: 1.5 })),
  (rc, o) =>
    rc.path('M8 8 m0 0 c1.6 0 1.8 2.6 0 2.8 c-2.6 .2 -3.6 -3 -1.8 -4.8 c2.4 -2.4 6.6 -.6 6.6 2.6 c0 3.8 -4.4 5.8 -7.6 4', o({ strokeWidth: 1.5, roughness: 0.6 })),
  // Stroke-only code glyphs.
  (rc, o) => rc.path('M6 2 L4.5 14 M11.5 2 L10 14 M2.5 5.5 H14 M2 10.5 H13.5', o({ strokeWidth: 1.5 })),
];

const randomRotation = () => Math.round(Math.random() * 60 - 30);

type SkillLabelProps = {
  name: string;
  onReroll: () => void;
};

/** Category name with a random rough.js doodle bullet. Clicking anywhere on it rerolls the bullet. */
export const SkillLabel = ({ name, onReroll }: SkillLabelProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const state = useRef({ shape: -1, rot: randomRotation() });

  const draw = () => {
    const svg = svgRef.current;
    if (!svg) return;
    let k: number;
    do k = Math.floor(Math.random() * SHAPES.length);
    while (k === state.current.shape);
    state.current.shape = k;
    svg.replaceChildren();
    const rc = roughSvg(svg);
    const R = Math.random;
    const o = (x: RoughOptions = {}): RoughOptions => ({
      stroke: INK,
      strokeWidth: 1.6,
      roughness: 0.9 + R() * 1.2,
      bowing: R() * 2,
      seed: Math.floor(R() * 1e5),
      ...x,
    });
    svg.appendChild(roundCaps(SHAPES[k](rc, o)));
  };

  useEffect(() => {
    draw();
    const svg = svgRef.current;
    if (svg) svg.style.transform = `rotate(${state.current.rot}deg)`;
  }, []);

  const reroll = () => {
    draw();
    const svg = svgRef.current;
    const r0 = state.current.rot;
    const rot = randomRotation();
    state.current.rot = rot;
    if (svg) {
      svg.style.transform = `rotate(${rot}deg)`;
      if (canAnimate(svg))
        svg.animate(
          [
            { transform: `rotate(${r0 - 120}deg) scale(.3)` },
            { transform: `rotate(${rot + 12}deg) scale(1.35)`, offset: 0.6 },
            { transform: `rotate(${rot}deg) scale(1)` },
          ],
          { duration: 420, easing: 'cubic-bezier(.3,1.3,.5,1)' },
        );
    }
    onReroll();
  };

  return (
    <span data-rcat="" className="skills__label" onClick={reroll}>
      <span data-rbullet="" className="skills__bullet">
        <svg ref={svgRef} aria-hidden="true" viewBox="0 0 16 16" className="skills__bullet-svg" />
      </span>
      {name}
    </span>
  );
};
