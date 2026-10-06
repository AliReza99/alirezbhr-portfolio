import { useEffect } from 'react';
import { prefersReducedMotion } from '../lib/motion';

const SCALE = 2;
const TILE = 160;
const TILES = 8;
const FPS = 10;

/**
 * Very faint old-TV static behind the page. Noise tiles are generated once;
 * each frame is a single pattern fill on a half-resolution canvas, 10 times a second.
 */
export const useTvStatic = () => {
  useEffect(() => {
    const c = document.createElement('canvas');
    c.id = 'tv-static';
    c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    if (!ctx) {
      c.remove();
      return;
    }

    const patterns = Array.from({ length: TILES }, () => {
      const t = document.createElement('canvas');
      t.width = t.height = TILE;
      const tc = t.getContext('2d')!;
      const d = tc.createImageData(TILE, TILE);
      const p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        p[i] = p[i + 1] = p[i + 2] = v;
        p[i + 3] = 255;
      }
      tc.putImageData(d, 0, 0);
      return ctx.createPattern(t, 'repeat')!;
    });

    const draw = () => {
      const ox = (Math.random() * TILE) | 0;
      const oy = (Math.random() * TILE) | 0;
      ctx.setTransform(1, 0, 0, 1, -ox, -oy);
      ctx.fillStyle = patterns[(Math.random() * TILES) | 0];
      ctx.fillRect(0, 0, c.width + TILE, c.height + TILE);
    };
    const size = () => {
      c.width = Math.ceil(innerWidth / SCALE);
      c.height = Math.ceil(innerHeight / SCALE);
      draw();
    };
    size();
    addEventListener('resize', size);

    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      last = now;
      draw();
    };
    if (!prefersReducedMotion()) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', size);
      c.remove();
    };
  }, []);
};
