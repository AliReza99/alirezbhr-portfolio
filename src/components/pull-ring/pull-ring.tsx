import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { canAnimate, prefersReducedMotion } from '../../lib/motion';
import { createGroup, randomSeed, roughSvg, roundCaps } from '../../lib/rough';
import { createTear, PULL, type Tear } from './tear';
import { Sheet } from './sheet';
import './pull-ring.css';

const INK = '#3B3A55';
const TAB = '#FFFCF7';
const HOLE = '#FBF6EF';

/** A drag shorter than this counts as a click. */
const CLICK_SLACK = 5;
/** How far the tab must travel from where the drag began to carry on by itself. */
const COMMIT = 80;

/** Across the box, the middle of the tab. */
const MID = PULL.width / 2;
/** Half the tab's width. */
const HALF = 22;
/** Top of the tab, past the top of the box so it comes out of the page edge. */
const TOP = -6;
/** Bottom of the tab, round. */
const BOTTOM = 120;

/** The tongue of the tab as a path, `dx` and `dy` to the side. The hard shadow is the same shape. */
const tongue = (dx = 0, dy = 0) => {
  const l = MID - HALF + dx;
  const r = MID + HALF + dx;
  const b = BOTTOM + dy;
  return `M${l} ${TOP + dy} L${l} ${b - 26} Q${l} ${b} ${MID + dx} ${b} Q${r} ${b} ${r} ${b - 26} L${r} ${TOP + dy} Z`;
};

/** The pull tab, like the one on a parcel's tear strip: a tongue of paper with a finger hole, on a hard hatched shadow. */
const drawTab = (svg: SVGSVGElement) => {
  const seed = randomSeed();
  const line = { stroke: INK, strokeWidth: 2, roughness: 0.7, bowing: 0.6, disableMultiStroke: true };
  const rc = roughSvg(svg);
  const g = createGroup();
  g.appendChild(rc.path(tongue(4, 4), { ...line, strokeWidth: 1, fill: INK, fillStyle: 'hachure', hachureGap: 3, hachureAngle: -45, fillWeight: 1, seed }));
  g.appendChild(rc.path(tongue(), { ...line, fill: TAB, fillStyle: 'solid', seed: seed + 1 }));
  g.appendChild(rc.circle(MID, BOTTOM - 25, 21, { ...line, strokeWidth: 2.2, fill: HOLE, fillStyle: 'solid', seed: seed + 2 }));
  svg.appendChild(roundCaps(g));
};

/**
 * A paper pull tab hanging from the top of the window. Pulling it down tears the page open
 * along a perforation: the torn edges are ragged and rimmed in white, and the page underneath
 * shows through, with the site's links on it. The tab rides the tear down and back up,
 * closing it again. It leaves once the page above the basement has scrolled out.
 */
export const PullRing = () => {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const handleRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const hangRef = useRef<HTMLSpanElement>(null);
  const tabRef = useRef<SVGSVGElement>(null);
  const tear = useRef<Tear | null>(null);
  const gesture = useRef<{ y: number; base: number; from: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  /** Which end a click should send the tab to next. */
  const want = useRef(false);

  useEffect(() => {
    const svg = tabRef.current;
    if (!svg) return;
    drawTab(svg);
    return () => svg.replaceChildren();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const sheet = sheetRef.current;
    const handle = handleRef.current;
    if (!canvas || !sheet || !handle) return;
    const c = createTear(
      { canvas, sheet, handle },
      {
        onActive: (on) => {
          setActive(on);
          // Locks scrolling. Where the scrollbar takes up room, the CSS keeps its gutter so the page does not shift.
          const root = document.documentElement;
          const gutter = innerWidth - root.clientWidth;
          if (on) {
            root.style.setProperty('--tear-gutter', `${gutter}px`);
            root.setAttribute('data-torn', gutter > 0 ? 'gutter' : '');
          } else {
            root.removeAttribute('data-torn');
            root.style.removeProperty('--tear-gutter');
          }
        },
        onRest: (isOpen) => {
          want.current = isOpen;
          setOpen(isOpen);
          // A touch drag leaves focus on the page; it belongs on the tab while the links are open.
          if (isOpen && !handle.parentElement?.contains(document.activeElement)) handle.focus({ preventScroll: true });
        },
        onBump: () => {
          if (canAnimate(hangRef.current)) hangRef.current.animate({ translate: ['0 0', '0 -5px', '0 3px', '0 0'] }, { duration: 340, easing: 'ease-out' });
        },
      },
    );
    tear.current = c;
    return () => {
      c.destroy();
      tear.current = null;
      document.documentElement.removeAttribute('data-torn');
      document.documentElement.style.removeProperty('--tear-gutter');
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
    const z = tear.current;
    if (!z) return;
    want.current = to;
    if (prefersReducedMotion()) z.jump(to ? 1 : 0);
    else z.tearTo(to ? 1 : 0);
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

  // While open, Tab stays among the links and the tab.
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
    const z = tear.current;
    if (!z || e.button > 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    z.grab();
    gesture.current = { y: e.clientY, base: z.apexY(), from: z.p, moved: false };
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    const z = tear.current;
    if (!g || !z) return;
    const dy = e.clientY - g.y;
    if (Math.abs(dy) > CLICK_SLACK) g.moved = true;
    if (!g.moved || prefersReducedMotion()) return;
    z.dragTo(g.base + dy);
  };

  const onPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    const z = tear.current;
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
      <canvas ref={canvasRef} aria-hidden="true" className="pull-ring__tear" />

      <button
        ref={handleRef}
        type="button"
        className="pull-ring__handle"
        data-hidden={(hidden && !active) || undefined}
        aria-label={open ? 'Close the site links' : 'Tear the page open to see the site links'}
        aria-expanded={open}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
      >
        <span ref={hangRef} className="pull-ring__hang">
          <svg ref={tabRef} aria-hidden="true" width={PULL.width} height={PULL.height} viewBox={`0 0 ${PULL.width} ${PULL.height}`} />
          <span aria-hidden="true" className="hand pull-ring__tab-label">
            pull
          </span>
        </span>
      </button>
    </div>
  );
};
