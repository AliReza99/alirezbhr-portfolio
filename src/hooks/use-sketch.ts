import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion } from '../lib/motion';
import { createGroup, createSvg, randomSeed, roughSvg, roundCaps, type RoughOptions } from '../lib/rough';
import { BACK_SKETCHES, SKETCHES, type SketchType } from '../lib/sketches';

type UseSketchOptions = {
  dark?: boolean;
  open?: boolean;
  /** Boil the lines while the enclosing button is hovered. */
  boil?: boolean;
};

/**
 * Draws a rough.js sketch into `ref`, sized to the element. Three frames are
 * drawn with different seeds; hovering the enclosing button cycles them.
 * Redraws when the element resizes or the light/open state changes.
 */
export const useSketch = (ref: RefObject<HTMLElement | null>, type: SketchType, { dark = false, open = false, boil = false }: UseSketchOptions = {}) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fn = SKETCHES[type];
    const base = randomSeed();
    let svg: SVGSVGElement | null = null;
    let frames: SVGGElement[] = [];
    let size = '';
    let k = 0;
    let boilTimer: number | undefined;

    const draw = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (!w || !h || `${w}x${h}` === size) return;
      size = `${w}x${h}`;
      svg?.remove();
      svg = createSvg();
      svg.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;overflow:visible;pointer-events:none;z-index:${BACK_SKETCHES.includes(type) ? -1 : 0}`;
      el.appendChild(svg);
      const rc = roughSvg(svg);
      frames = [0, 1, 2].map((n) => {
        const g = createGroup();
        const o = (x: RoughOptions = {}): RoughOptions => ({ roughness: 1.2, bowing: 1.2, seed: base + n * 17, ...x });
        fn(rc, w, h, o, { dark, open }).forEach((p) => g.appendChild(p));
        roundCaps(g);
        g.style.display = n ? 'none' : '';
        svg!.appendChild(g);
        return g;
      });
    };

    let resizeTimer: number | undefined;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(draw, size ? 200 : 0);
    });
    ro.observe(el);
    draw();

    const host = boil && !prefersReducedMotion() ? el.closest('button') : null;
    const stop = () => clearInterval(boilTimer);
    const enter = () => {
      stop();
      boilTimer = window.setInterval(() => {
        k++;
        frames.forEach((g, n) => (g.style.display = n === k % 3 ? '' : 'none'));
      }, 160);
    };
    host?.addEventListener('mouseenter', enter);
    host?.addEventListener('mouseleave', stop);

    return () => {
      ro.disconnect();
      clearTimeout(resizeTimer);
      stop();
      host?.removeEventListener('mouseenter', enter);
      host?.removeEventListener('mouseleave', stop);
      svg?.remove();
    };
  }, [ref, type, dark, open, boil]);
};
