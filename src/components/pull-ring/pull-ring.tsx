import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { canAnimate, prefersReducedMotion } from '../../lib/motion';
import { createGroup, randomSeed, roughSvg, roundCaps } from '../../lib/rough';
import { createCut, PULL, type Cut } from './cut';
import { Sheet } from './sheet';
import './pull-ring.css';

const INK = '#3B3A55';
const LILAC = '#A89AFE';
const CREAM = '#FBF6EF';
const CORAL = '#F4916B';

/** A drag shorter than this counts as a click. */
const CLICK_SLACK = 5;
/** How far the scissors must travel from where the drag began to carry on by themselves. */
const COMMIT = 80;
/** Across the box, where the pivot screw sits. */
const PIVOT_X = PULL.width / 2;

/**
 * One half of the scissors, drawn with its finger loop on the left and its blade leaning right.
 * The other half is the same drawing mirrored. They are separate drawings so each can turn on the pivot.
 */
const drawHalf = (svg: SVGSVGElement, blade: string, mirrored: boolean) => {
  const seed = randomSeed();
  const line = { stroke: INK, strokeWidth: 2, roughness: 0.7, bowing: 0.6, disableMultiStroke: true };
  const solid = (fill: string) => ({ ...line, fill, fillStyle: 'solid' });
  const rc = roughSvg(svg);
  const g = createGroup();
  if (mirrored) g.setAttribute('transform', `matrix(-1 0 0 1 ${PULL.width} 0)`);
  // The handle: a coral shank from the loop down to the pivot.
  g.appendChild(rc.path(`M8.5 27 L15 27 L26 ${PULL.apex - 1} L18 ${PULL.apex + 3} Z`, { ...solid(CORAL), seed }));
  // The blade, from the pivot out to the tip. The tip leans past the centre line so the two blades cross.
  g.appendChild(rc.path(`M15.5 ${PULL.apex - 3} L28.5 ${PULL.apex - 5} L26 97 Q25.3 101 24 98 Q17 80 15.5 ${PULL.apex + 8} Z`, { ...solid(blade), seed: seed + 1 }));
  // The finger loop is a ring: coral outside, the page showing through the hole.
  g.appendChild(rc.circle(12, 17, 20, { ...solid(CORAL), strokeWidth: 2.6, seed: seed + 2 }));
  g.appendChild(rc.circle(12, 17, 8.5, { ...solid(CREAM), strokeWidth: 1.6, seed: seed + 3 }));
  svg.appendChild(roundCaps(g));
};

/**
 * A pair of scissors hanging from the top of the window. Pulling them down cuts the page open
 * along a dashed line: the blades snip as they travel, the halves of the page curl back from
 * the cut and the page underneath shows through, with the site's links on it. The scissors
 * ride the cut down and back up, closing it again. They leave once the page above the
 * basement has scrolled out.
 */
export const PullRing = () => {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const handleRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const hangRef = useRef<HTMLSpanElement>(null);
  const bladeARef = useRef<SVGSVGElement>(null);
  const bladeBRef = useRef<SVGSVGElement>(null);
  const cut = useRef<Cut | null>(null);
  const gesture = useRef<{ y: number; base: number; from: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  /** Which end a click should send the scissors to next. */
  const want = useRef(false);

  // The scissors: two halves in two drawings of the same box, so each turns on the pivot by itself. The screw sits on top.
  useEffect(() => {
    const a = bladeARef.current;
    const b = bladeBRef.current;
    if (!a || !b) return;
    drawHalf(a, CREAM, false);
    drawHalf(b, LILAC, true);
    const rc = roughSvg(b);
    const screw = createGroup();
    screw.appendChild(rc.circle(PIVOT_X, PULL.apex, 8, { stroke: INK, strokeWidth: 2, roughness: 0.5, disableMultiStroke: true, fill: INK, fillStyle: 'solid', seed: randomSeed() }));
    b.appendChild(roundCaps(screw));
    return () => {
      a.replaceChildren();
      b.replaceChildren();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const sheet = sheetRef.current;
    const handle = handleRef.current;
    if (!canvas || !sheet || !handle) return;
    const c = createCut(
      { canvas, sheet, handle },
      {
        onActive: (on) => {
          setActive(on);
          // Locks scrolling. Where the scrollbar takes up room, the CSS keeps its gutter so the page does not shift.
          const root = document.documentElement;
          const gutter = innerWidth - root.clientWidth;
          if (on) {
            root.style.setProperty('--cut-gutter', `${gutter}px`);
            root.setAttribute('data-cut', gutter > 0 ? 'gutter' : '');
          } else {
            root.removeAttribute('data-cut');
            root.style.removeProperty('--cut-gutter');
          }
        },
        onRest: (isOpen) => {
          want.current = isOpen;
          setOpen(isOpen);
          // A touch drag leaves focus on the page; it belongs on the scissors while the links are open.
          if (isOpen && !handle.parentElement?.contains(document.activeElement)) handle.focus({ preventScroll: true });
        },
        onBump: () => {
          if (canAnimate(hangRef.current)) hangRef.current.animate({ translate: ['0 0', '0 -5px', '0 3px', '0 0'] }, { duration: 340, easing: 'ease-out' });
        },
      },
    );
    cut.current = c;
    return () => {
      c.destroy();
      cut.current = null;
      document.documentElement.removeAttribute('data-cut');
      document.documentElement.style.removeProperty('--cut-gutter');
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const mainBottom = document.querySelector('main')?.getBoundingClientRect().bottom ?? Infinity;
      setHidden(mainBottom < PULL.height);
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  }, []);

  const send = useCallback((to: boolean) => {
    const z = cut.current;
    if (!z) return;
    want.current = to;
    if (prefersReducedMotion()) z.jump(to ? 1 : 0);
    else z.cutTo(to ? 1 : 0);
  }, []);

  const close = useCallback(() => {
    handleRef.current?.focus({ preventScroll: true });
    send(false);
  }, [send]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [active, close]);

  // While open, Tab stays among the links and the scissors.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const stops = [...(sheetRef.current?.querySelectorAll<HTMLElement>('a[href]') ?? []), handleRef.current!];
      const at = stops.indexOf(document.activeElement as HTMLElement);
      const next = at < 0 ? 0 : (at + (e.shiftKey ? -1 : 1) + stops.length) % stops.length;
      e.preventDefault();
      stops[next].focus({ preventScroll: true });
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    const z = cut.current;
    if (!z || e.button > 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    z.grab();
    gesture.current = { y: e.clientY, base: z.apexY(), from: z.p, moved: false };
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    const z = cut.current;
    if (!g || !z) return;
    const dy = e.clientY - g.y;
    if (Math.abs(dy) > CLICK_SLACK) g.moved = true;
    if (!g.moved || prefersReducedMotion()) return;
    z.dragTo(g.base + dy);
  };

  const onPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    const z = cut.current;
    gesture.current = null;
    if (!g || !z) return;
    if (!g.moved) {
      // A plain click comes next and decides. A cancelled touch sends none, so it goes back.
      if (e.type === 'pointercancel') send(want.current);
      else z.release(null);
      return;
    }
    // The click that follows a mouse drag is not a toggle; a touch drag sends none, so the flag clears itself.
    skipClick.current = true;
    setTimeout(() => (skipClick.current = false));
    const dy = e.clientY - g.y;
    const far = Math.abs(dy) > COMMIT;
    if (prefersReducedMotion()) {
      if (far) send(dy > 0);
    } else z.release(far ? (dy > 0 ? 1 : 0) : g.from > 0.5 ? 1 : 0);
  };

  const onClick = () => {
    if (skipClick.current) {
      skipClick.current = false;
      return;
    }
    send(!want.current);
  };

  const goHome = (e: MouseEvent) => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: 'instant' });
    close();
  };

  return (
    <div className="pull-ring" data-pulled={active || undefined} data-open={open || undefined}>
      <Sheet ref={sheetRef} active={active} open={open} onHome={goHome} />
      <canvas ref={canvasRef} aria-hidden="true" className="pull-ring__cut" />

      <button
        ref={handleRef}
        type="button"
        className="pull-ring__handle"
        data-hidden={(hidden && !active) || undefined}
        aria-label={open ? 'Close the site links' : 'Cut the page open to see the site links'}
        aria-expanded={open}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
      >
        <span ref={hangRef} className="pull-ring__hang">
          <svg ref={bladeARef} aria-hidden="true" className="pull-ring__half pull-ring__half--a" width={PULL.width} height={PULL.height} viewBox={`0 0 ${PULL.width} ${PULL.height}`} />
          <svg ref={bladeBRef} aria-hidden="true" className="pull-ring__half pull-ring__half--b" width={PULL.width} height={PULL.height} viewBox={`0 0 ${PULL.width} ${PULL.height}`} />
          <span aria-hidden="true" className="pull-ring__stub" />
        </span>
      </button>
    </div>
  );
};
