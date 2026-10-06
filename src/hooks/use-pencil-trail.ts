import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';

type Point = { x: number; y: number; t: number; brk: boolean; j: number };

/** Anything that is content, not empty page space. */
const BUSY = 'a,button,input,textarea,p,h1,h2,h3,h4,li,span,strong,em,img,svg,canvas,article,label,[role="status"]';
/** Pixels of pencil before the "you made a mess" toast. */
const MESS = 1500;

/**
 * Hold the mouse on empty page space to draw with a pencil. Lines stay for
 * the visit, scroll with the page and sit behind the content. Mouse only.
 */
export const usePencilTrail = (onMess: () => void) => {
  const onMessRef = useRef(onMess);
  onMessRef.current = onMess;

  useEffect(() => {
    if (prefersReducedMotion() || !matchMedia('(pointer: fine)').matches) return;
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    if (!ctx) return;
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:-1';
    document.body.appendChild(c);

    const pts: Point[] = [];
    let raf = 0;
    let dpr = 1;
    let last: Point | null = null;
    let drawing = false;
    let inked = 0;
    let messShown = false;

    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
    };
    size();

    const draw = () => {
      raf = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const sx = scrollX;
      const sy = scrollY;
      // A soft main stroke plus a thin, slightly offset wobbly one.
      (
        [
          [2.6, 0.45, 0],
          [1.3, 0.18, 1],
        ] as const
      ).forEach(([w, alpha, jj]) => {
        ctx.strokeStyle = `rgba(59,58,85,${alpha})`;
        ctx.lineWidth = w;
        ctx.beginPath();
        for (const p of pts) {
          const px = p.x - sx + p.j * jj;
          const py = p.y - sy - p.j * jj;
          if (p.brk) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });
    };
    const redraw = () => {
      if (!raf && pts.length) raf = requestAnimationFrame(draw);
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (!drawing || !(e.buttons & 1)) {
        last = null;
        return;
      }
      const now = performance.now();
      const x = e.clientX + scrollX;
      const y = e.clientY + scrollY;
      const brk = !last || now - last.t > 120;
      const dist = last && !brk ? Math.hypot(x - last.x, y - last.y) : 0;
      if (last && !brk && dist < 2) return;
      inked += dist;
      last = { x, y, t: now, brk, j: (Math.random() - 0.5) * 1.4 };
      pts.push(last);
      redraw();
    };
    const leave = () => {
      last = null;
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || (e.pointerType && e.pointerType !== 'mouse')) return;
      drawing = !(e.target instanceof Element) || !e.target.closest(BUSY);
      if (drawing) {
        e.preventDefault();
        last = null;
        move(e);
      }
    };
    const up = () => {
      drawing = false;
      last = null;
      if (inked > MESS && !messShown) {
        messShown = true;
        setTimeout(() => onMessRef.current(), 400);
      }
    };
    const resize = () => {
      size();
      redraw();
    };

    addEventListener('pointerdown', down);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
    addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    addEventListener('resize', resize);
    addEventListener('scroll', redraw, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointerdown', down);
      removeEventListener('pointerup', up);
      removeEventListener('pointercancel', up);
      removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      removeEventListener('resize', resize);
      removeEventListener('scroll', redraw);
      c.remove();
    };
  }, []);
};
