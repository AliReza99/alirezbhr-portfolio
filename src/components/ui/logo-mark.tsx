import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/motion';
import { createGroup, randomSeed, roughSvg, roundCaps } from '../../lib/rough';
import './logo-mark.css';

const INK = '#3B3A55';
const LILAC = '#A89AFE';

/** Pen strokes of a handwritten "AB": the A's two legs and bar, then the B's stem and bowls. The CSS slants them. */
const STROKES = ['M5 31 Q9 17 14.5 6 Q19 17 23 31', 'M8.5 22.5 Q14 20 20 22', 'M32 6.5 Q31 18 31.5 31', 'M31 7.5 C44 3 46 16 32.5 18 C49 16.5 49 33 31 31'];

/** How far the letters are extruded down and to the right, in viewBox units. */
const DEPTH = 3.2;

/**
 * The initials as chunky 3D lettering drawn with rough.js: a lilac stroke inside an ink
 * outline, on ink copies of itself stepping away for the depth. Three frames with
 * different seeds boil while the enclosing link is hovered.
 */
export const LogoMark = () => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const rc = roughSvg(svg);
    const base = randomSeed();

    const frames = [0, 1, 2].map((n) => {
      const frame = createGroup();
      // Every layer of a frame shares its seeds, so the copies of a stroke wobble the same way and stay stacked.
      const layer = (stroke: string, strokeWidth: number, shift: number) => {
        const g = createGroup();
        g.setAttribute('transform', `translate(${shift},${shift})`);
        STROKES.forEach((d, i) =>
          g.appendChild(rc.path(d, { stroke, strokeWidth, roughness: 0.9, bowing: 1, disableMultiStroke: true, seed: base + n * 13 + i })),
        );
        frame.appendChild(g);
      };
      for (let shift = DEPTH; shift > 0; shift -= 0.8) layer(INK, 7, shift);
      layer(INK, 7, 0);
      layer(LILAC, 3.2, 0);
      roundCaps(frame);
      frame.style.display = n ? 'none' : '';
      svg.appendChild(frame);
      return frame;
    });

    const host = prefersReducedMotion() ? null : svg.closest('a');
    let k = 0;
    let boil: number | undefined;
    const stop = () => clearInterval(boil);
    const enter = () => {
      stop();
      boil = window.setInterval(() => {
        k++;
        frames.forEach((g, n) => (g.style.display = n === k % 3 ? '' : 'none'));
      }, 160);
    };
    host?.addEventListener('mouseenter', enter);
    host?.addEventListener('mouseleave', stop);

    return () => {
      stop();
      host?.removeEventListener('mouseenter', enter);
      host?.removeEventListener('mouseleave', stop);
      svg.replaceChildren();
    };
  }, []);

  return <svg ref={ref} aria-hidden="true" viewBox="0 0 56 39" className="logo-mark" />;
};
