import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { canAnimate, pickIndex, prefersReducedMotion } from '../../lib/motion';
import { createGroup, randomSeed, roughSvg, roundCaps } from '../../lib/rough';
import { useToast } from '../toast/toast-context';
import { FINDS, Lining, type Find } from './lining';
import { createZipper, PULL, type Zipper } from './zipper';
import './pull-ring.css';

const INK = '#3B3A55';
const LILAC = '#A89AFE';
const CREAM = '#FBF6EF';

/** A drag shorter than this counts as a click. */
const CLICK_SLACK = 5;
/** How far the slider must travel from where the drag began to carry on by itself. */
const COMMIT = 80;
/** One pull in this many snags. */
const SNAG_ODDS = 5;
/** Pulls in one visit that earn a remark. */
const FAN_PULLS = [7, 20];
const STORE = 'pull-ring-unzips';

const stored = (): number => {
  try {
    return Number(localStorage.getItem(STORE)) || 0;
  } catch {
    return 0;
  }
};

/** A pendulum that starts at `deg` and runs down. */
const swing = (el: Element | null, deg: number) => {
  if (!canAnimate(el) || Math.abs(deg) < 1) return;
  const frames = [1, -0.62, 0.38, -0.22, 0.11, -0.04, 0].map((k) => ({ rotate: `${(deg * k).toFixed(1)}deg`, easing: 'ease-in-out' }));
  el.animate(frames, { duration: 1700 });
};

/**
 * A zipper pull hanging from the top of the window. Pulling it down unzips the page: the two
 * halves part along a seam under the ring and the lining of the garment shows through, with
 * the site's links sewn into it. The pull rides the seam down and zips it shut again. It
 * leaves once the page above the basement has scrolled out.
 */
export const PullRing = () => {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [count, setCount] = useState(stored);
  const [find, setFind] = useState<Find>(FINDS[0]);
  const { showToast } = useToast();
  const handleRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clothRef = useRef<HTMLDivElement>(null);
  const hangRef = useRef<HTMLSpanElement>(null);
  const dangleRef = useRef<HTMLSpanElement>(null);
  const tabRef = useRef<SVGSVGElement>(null);
  const sliderRef = useRef<SVGSVGElement>(null);
  const zipper = useRef<Zipper | null>(null);
  const gesture = useRef<{ x: number; y: number; base: number; from: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  /** Which end a click should send the slider to next. */
  const want = useRef(false);
  /** The zipper is jammed and waiting for a second tug. */
  const stuck = useRef(false);
  /** Pulls since the page loaded. The first never snags. */
  const pulls = useRef(0);

  // The pull: tab and ring in one drawing, the slider body in another on top, so the tab can swing under it.
  useEffect(() => {
    const tab = tabRef.current;
    const slider = sliderRef.current;
    if (!tab || !slider) return;
    const seed = randomSeed();
    const line = { stroke: INK, strokeWidth: 2, roughness: 0.7, bowing: 0.6, disableMultiStroke: true };
    const solid = (fill: string) => ({ ...line, fill, fillStyle: 'solid' });
    let rc = roughSvg(tab);
    let g = createGroup();
    g.appendChild(rc.path('M17 26 Q16 20 22 20 Q28 20 27 26 L28.5 60 Q28 66 22 66 Q16 66 15.5 60 Z', { ...solid(CREAM), seed }));
    g.appendChild(rc.path('M20 54 Q20 50 22 50 Q24 50 24 54 L24 60 Q24 62 22 62 Q20 62 20 60 Z', { ...line, strokeWidth: 1.4, seed: seed + 1 }));
    g.appendChild(rc.circle(22, 80, 29, { ...line, strokeWidth: 3.5, seed: seed + 2 }));
    tab.appendChild(roundCaps(g));
    rc = roughSvg(slider);
    g = createGroup();
    g.appendChild(rc.path('M13 9 L31 9 Q35 9 35.5 13 L38 34 Q38 39 33 39 L11 39 Q6 39 6 34 L8.5 13 Q9 9 13 9 Z', { ...solid(LILAC), strokeWidth: 2.2, seed: seed + 3 }));
    g.appendChild(rc.path('M16.5 15 L27.5 15 L28.5 30 Q22 34 15.5 30 Z', { ...solid(CREAM), strokeWidth: 1.6, seed: seed + 4 }));
    slider.appendChild(roundCaps(g));
    return () => {
      tab.replaceChildren();
      slider.replaceChildren();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cloth = clothRef.current;
    const handle = handleRef.current;
    if (!canvas || !cloth || !handle) return;
    let lastFind = 0;
    let lastSnagged = false;
    const z = createZipper(
      { canvas, cloth, handle },
      {
        onActive: (on) => {
          setActive(on);
          // Locks scrolling. Where the scrollbar takes up room, the CSS keeps its gutter so the page does not shift.
          const root = document.documentElement;
          const gutter = innerWidth - root.clientWidth;
          if (on) {
            root.style.setProperty('--zip-gutter', `${gutter}px`);
            root.setAttribute('data-unzipped', gutter > 0 ? 'gutter' : '');
          } else {
            root.removeAttribute('data-unzipped');
            root.style.removeProperty('--zip-gutter');
          }
          if (!on) return;
          const n = ++pulls.current;
          setCount((c) => {
            try {
              localStorage.setItem(STORE, `${c + 1}`);
            } catch {
              // Private mode: the count lasts for this visit only.
            }
            return c + 1;
          });
          if (n > 1) setFind(FINDS[(lastFind = pickIndex(FINDS.length, lastFind))]);
          const snag = n > 1 && !lastSnagged && !prefersReducedMotion() && Math.random() < 1 / SNAG_ODDS;
          lastSnagged = snag;
          if (snag) z.arm(0.34 + Math.random() * 0.22);
        },
        onRest: (isOpen) => {
          want.current = isOpen;
          stuck.current = false;
          setOpen(isOpen);
          // A touch drag leaves focus on the page; it belongs on the ring while the lining is open.
          if (isOpen && !handle.parentElement?.contains(document.activeElement)) handle.focus({ preventScroll: true });
          if (isOpen && FAN_PULLS.includes(pulls.current)) showToast('zips', { n: `${pulls.current}` });
        },
        onSnag: () => {
          stuck.current = true;
          showToast('snag');
        },
        onBump: () => {
          if (canAnimate(hangRef.current)) hangRef.current.animate({ translate: ['0 0', '0 -5px', '0 3px', '0 0'] }, { duration: 340, easing: 'ease-out' });
          swing(dangleRef.current, 26);
        },
      },
    );
    zipper.current = z;
    return () => {
      z.destroy();
      zipper.current = null;
      document.documentElement.removeAttribute('data-unzipped');
      document.documentElement.style.removeProperty('--zip-gutter');
    };
  }, [showToast]);

  // A different find changes what there is to sew on.
  useEffect(() => zipper.current?.remeasure(), [find, active]);

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
    const z = zipper.current;
    if (!z) return;
    want.current = to;
    stuck.current = false;
    if (prefersReducedMotion()) z.jump(to ? 1 : 0);
    else z.zipTo(to ? 1 : 0);
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

  // While open, Tab stays among the links and the ring.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const stops = [...(clothRef.current?.querySelectorAll<HTMLElement>('a[href]') ?? []), handleRef.current!];
      const at = stops.indexOf(document.activeElement as HTMLElement);
      const next = at < 0 ? 0 : (at + (e.shiftKey ? -1 : 1) + stops.length) % stops.length;
      e.preventDefault();
      stops[next].focus({ preventScroll: true });
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    const z = zipper.current;
    if (!z || e.button > 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    z.grab();
    gesture.current = { x: e.clientX, y: e.clientY, base: z.apexY(), from: z.p, moved: false };
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    const z = zipper.current;
    if (!g || !z) return;
    const dy = e.clientY - g.y;
    if (Math.abs(dy) > CLICK_SLACK) g.moved = true;
    if (!g.moved || prefersReducedMotion()) return;
    z.dragTo(g.base + dy);
    // The tab leans toward the hand that holds the ring.
    const lean = Math.max(-30, Math.min(30, (e.clientX - g.x) * 0.4));
    e.currentTarget.style.setProperty('--zip-lean', `${lean.toFixed(1)}deg`);
  };

  const onPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    const z = zipper.current;
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
    const lean = parseFloat(e.currentTarget.style.getPropertyValue('--zip-lean')) || 0;
    e.currentTarget.style.removeProperty('--zip-lean');
    swing(dangleRef.current, lean);
    const dy = e.clientY - g.y;
    const far = Math.abs(dy) > COMMIT;
    if (prefersReducedMotion()) {
      if (far) send(dy > 0);
    } else if (z.jammed) z.release(dy < -COMMIT ? 0 : null);
    else z.release(far ? (dy > 0 ? 1 : 0) : g.from > 0.5 ? 1 : 0);
  };

  const onClick = () => {
    if (skipClick.current) {
      skipClick.current = false;
      return;
    }
    // A click on a jammed zipper is the second tug: it carries on down.
    send(stuck.current || !want.current);
  };

  const goHome = (e: MouseEvent) => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: 'instant' });
    close();
  };

  return (
    <div className="pull-ring" data-pulled={active || undefined} data-open={open || undefined}>
      <Lining ref={clothRef} active={active} open={open} count={count} find={find} onHome={goHome} />
      <canvas ref={canvasRef} aria-hidden="true" className="pull-ring__seam" />

      <button
        ref={handleRef}
        type="button"
        className="pull-ring__handle"
        data-hidden={(hidden && !active) || undefined}
        aria-label={open ? 'Zip the page back up' : 'Unzip the page to see the site links'}
        aria-expanded={open}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
      >
        <span ref={hangRef} className="pull-ring__hang">
          <span ref={dangleRef} className="pull-ring__dangle">
            <svg ref={tabRef} aria-hidden="true" width={PULL.width} height={PULL.height} viewBox={`0 0 ${PULL.width} ${PULL.height}`} />
          </span>
          <svg ref={sliderRef} aria-hidden="true" className="pull-ring__slider" width={PULL.width} height={PULL.height} viewBox={`0 0 ${PULL.width} ${PULL.height}`} />
        </span>
      </button>
    </div>
  );
};
