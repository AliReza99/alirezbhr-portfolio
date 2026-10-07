import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion } from '../../lib/motion';
import { createGroup, createSvg, randomSeed, roughSvg, roundCaps, type RoughOptions, type RoughSVG } from '../../lib/rough';

export type FrameDraw = (rc: RoughSVG, w: number, h: number, o: (x?: RoughOptions) => RoughOptions) => SVGElement[];

/**
 * Draws a rough.js sketch behind the content of `ref`, sized to it, as three frames with
 * different seeds. The frames cycle while the nearest `[data-boil]` ancestor is hovered or
 * holds focus. Unlike `useSketch` this takes the drawing itself and follows keyboard focus.
 */
export const useRoughFrames = (ref: RefObject<HTMLElement | null>, draw: FrameDraw) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const base = randomSeed();
    let svg: SVGSVGElement | null = null;
    let frames: SVGGElement[] = [];
    let size = '';

    const paint = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (!w || !h || `${w}x${h}` === size) return;
      size = `${w}x${h}`;
      svg?.remove();
      svg = createSvg();
      svg.setAttribute('class', 'pull-ring__sketch');
      svg.setAttribute('width', `${w}`);
      svg.setAttribute('height', `${h}`);
      el.prepend(svg);
      const rc = roughSvg(svg);
      frames = [0, 1, 2].map((n) => {
        const g = createGroup();
        const o = (x: RoughOptions = {}): RoughOptions => ({ roughness: 1, bowing: 1, seed: base + n * 17, ...x });
        draw(rc, w, h, o).forEach((node) => g.appendChild(node));
        roundCaps(g);
        g.style.display = n ? 'none' : '';
        svg!.appendChild(g);
        return g;
      });
    };

    const ro = new ResizeObserver(paint);
    ro.observe(el);
    paint();

    const host = prefersReducedMotion() ? null : el.closest('[data-boil]');
    let k = 0;
    let timer: number | undefined;
    const stop = () => clearInterval(timer);
    const start = () => {
      stop();
      timer = window.setInterval(() => {
        k++;
        frames.forEach((g, n) => (g.style.display = n === k % 3 ? '' : 'none'));
      }, 150);
    };
    // Checked a tick later: focus has not left yet when `focusout` fires.
    const leave = () => setTimeout(() => !host?.matches(':hover, :focus-within') && stop());
    host?.addEventListener('pointerenter', start);
    host?.addEventListener('pointerleave', leave);
    host?.addEventListener('focusin', start);
    host?.addEventListener('focusout', leave);

    return () => {
      ro.disconnect();
      stop();
      host?.removeEventListener('pointerenter', start);
      host?.removeEventListener('pointerleave', leave);
      host?.removeEventListener('focusin', start);
      host?.removeEventListener('focusout', leave);
      svg?.remove();
    };
  }, [ref, draw]);
};
