import { useEffect, useRef, type RefObject } from 'react';
import { prefersReducedMotion } from '../../lib/motion';
import { createGroup, createSvg, randomSeed, roughSvg, roundCaps } from '../../lib/rough';

type RoughFrameProps = {
  /** The hovered card (an anchor) that starts and stops the boil. */
  hostRef: RefObject<HTMLElement | null>;
  /** The image box; a sketchy divider is drawn along its bottom edge. */
  imageRef: RefObject<HTMLElement | null>;
};

/** Hand-drawn border plus image divider that boils between three frames while the card is hovered. */
export const RoughFrame = ({ hostRef, imageRef }: RoughFrameProps) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = hostRef.current;
    const img = imageRef.current;
    if (!el || !host || !img) return;
    const svg = createSvg();
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible';
    el.appendChild(svg);
    const base = randomSeed();
    const reduce = prefersReducedMotion();
    let frames: SVGGElement[] = [];
    let key = '';
    let k = 0;
    let boil: number | undefined;

    const build = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const y = 2 + img.offsetTop + img.offsetHeight - 1;
      const next = `${w}x${h}x${y}`;
      if (!w || next === key) return;
      key = next;
      svg.replaceChildren();
      frames = [];
      const rc = roughSvg(svg);
      for (let n = 0; n < 3; n++) {
        const g = createGroup();
        const o = { stroke: '#3B3A55', strokeWidth: 2.2, roughness: 1.1, bowing: 1.2, seed: base + n * 13 };
        g.appendChild(rc.rectangle(1.5, 1.5, w - 3, h - 3, o));
        g.appendChild(rc.line(1.5, y, w - 1.5, y + (n - 1) * 0.8, { ...o, seed: o.seed + 5 }));
        roundCaps(g);
        g.style.display = n ? 'none' : '';
        svg.appendChild(g);
        frames.push(g);
      }
    };
    const show = () => frames.forEach((g, n) => (g.style.display = n === k % 3 ? '' : 'none'));
    const stop = () => clearInterval(boil);
    const enter = () => {
      build();
      stop();
      if (!reduce)
        boil = window.setInterval(() => {
          k++;
          show();
        }, 160);
    };

    host.addEventListener('mouseenter', enter);
    host.addEventListener('focus', enter);
    host.addEventListener('mouseleave', stop);
    host.addEventListener('blur', stop);
    build();
    return () => {
      stop();
      host.removeEventListener('mouseenter', enter);
      host.removeEventListener('focus', enter);
      host.removeEventListener('mouseleave', stop);
      host.removeEventListener('blur', stop);
      svg.remove();
    };
  }, [hostRef, imageRef]);

  return <span ref={ref} data-rbox="" aria-hidden="true" style={{ transform: 'translate(var(--p),var(--p))' }} />;
};
