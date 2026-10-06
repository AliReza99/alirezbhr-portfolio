import { useEffect, useRef, type CSSProperties } from 'react';
import { randomSeed, roughSvg, roundCaps } from '../../lib/rough';

type RoughArrowProps = {
  /** `e` points right, `ne` points up-right. */
  dir: 'e' | 'ne';
  style?: CSSProperties;
};

const CRISP = {
  e: 'M3 12 H20.5 M14.5 6 L20.5 12 L14.5 18',
  ne: 'M5.5 18.5 L18 6 M9 6 H18 V15',
};

const SKETCH = {
  e: ['M2.5 12.5 Q11 11 20.5 12', 'M14.5 5.5 L20.5 12 L14.5 18.5'],
  ne: ['M4.5 19.5 Q10 13 18.5 5.5', 'M9.5 5.5 L18.5 5 L18 14'],
};

/**
 * A clean arrow that wipes into a boiling rough.js sketch while its
 * enclosing link or button is hovered (wipe itself is pure CSS).
 */
export const RoughArrow = ({ dir, style }: RoughArrowProps) => {
  const hostRef = useRef<HTMLSpanElement>(null);
  const sketchRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = hostRef.current;
    const svg = sketchRef.current;
    if (!el || !svg) return;
    const base = randomSeed();
    let k = 0;
    let boil: number | undefined;

    const draw = () => {
      svg.replaceChildren();
      const rc = roughSvg(svg);
      SKETCH[dir].forEach((d, i) => {
        svg.appendChild(
          roundCaps(rc.path(d, { stroke: 'currentColor', strokeWidth: 2.6, roughness: 1.2, bowing: 2, seed: base + (k % 3) * 7 + i })),
        );
      });
    };
    draw();

    const host = el.closest('a,button') ?? el.parentElement;
    if (!host) return;
    const stop = () => clearInterval(boil);
    const enter = () => {
      stop();
      boil = window.setInterval(() => {
        k++;
        draw();
      }, 160);
    };
    host.addEventListener('mouseenter', enter);
    host.addEventListener('mouseleave', stop);
    return () => {
      stop();
      host.removeEventListener('mouseenter', enter);
      host.removeEventListener('mouseleave', stop);
    };
  }, [dir]);

  return (
    <span ref={hostRef} data-rarrow={dir} style={{ display: 'grid', width: '1em', height: '1em', flex: 'none', ...style }}>
      <svg data-ac="" viewBox="0 0 24 24">
        <path d={CRISP[dir]} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
      <svg data-ar="" viewBox="0 0 24 24" ref={sketchRef} />
    </span>
  );
};
