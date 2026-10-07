import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { BLOG_URL, EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_URL } from '../../data/profile';
import { createGroup, randomSeed, roughSvg, roundCaps } from '../../lib/rough';
import './pull-ring.css';

const INK = '#3B3A55';

const WIDTH = 40;
const HEIGHT = 92;

export const PULL_LINKS = [
  { href: '/', label: 'Home', external: false },
  { href: BLOG_URL, label: 'Blog', external: false },
  { href: RESUME_URL, label: 'Resume', external: true },
  { href: GITHUB_URL, label: 'GitHub', external: true },
  { href: LINKEDIN_URL, label: 'LinkedIn', external: true },
  { href: `mailto:${EMAIL}`, label: 'Email', external: false },
];

/** A drag shorter than this counts as a click. */
const CLICK_SLACK = 5;
/** How far the sheet must travel from where the drag began to stay there. */
const COMMIT = 80;
/** Gap left under the ring when the sheet is all the way down. */
const REST_GAP = 20;

/**
 * Ring on a cord hanging from the top of the window. A click or a drag pulls a
 * full-screen sheet of links down over the page; the ring rides down with it and
 * closes it again. The ring leaves once the page above the basement has scrolled out.
 */
export const PullRing = () => {
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const [height, setHeight] = useState(0);
  const [hidden, setHidden] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ y: number; base: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const rc = roughSvg(svg);
    const seed = randomSeed();
    const line = { stroke: INK, strokeWidth: 2, roughness: 0.8, bowing: 0.6, disableMultiStroke: true };
    const g = createGroup();
    g.appendChild(rc.line(20, 0, 20, 58, { ...line, seed }));
    g.appendChild(rc.circle(20, 73, 28, { ...line, strokeWidth: 3.5, seed: seed + 1 }));
    svg.appendChild(roundCaps(g));
    return () => svg.replaceChildren();
  }, []);

  useLayoutEffect(() => {
    const measure = () => setHeight(sheetRef.current?.offsetHeight ?? 0);
    measure();
    addEventListener('resize', measure);
    return () => removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const mainBottom = document.querySelector('main')?.getBoundingClientRect().bottom ?? Infinity;
      setHidden(mainBottom < HEIGHT);
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);

  const clamp = (v: number) => Math.min(height, Math.max(0, v));
  const off = drag ?? (open ? height : 0);
  const pulled = open || drag !== null;
  /** The ring stops short of the bottom edge so it stays on screen. */
  const handleOff = Math.min(off, Math.max(0, height - HEIGHT - REST_GAP + 12));

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { y: e.clientY, base: open ? height : 0, moved: false };
  };

  const onPointerMove = (e: PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    const dy = e.clientY - g.y;
    if (Math.abs(dy) > CLICK_SLACK) g.moved = true;
    if (g.moved) setDrag(clamp(g.base + dy));
  };

  const onPointerUp = (e: PointerEvent) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g?.moved) return;
    // The click that follows a mouse drag is not a toggle; a touch drag sends none, so the flag clears itself.
    skipClick.current = true;
    setTimeout(() => (skipClick.current = false));
    const travelled = Math.abs(clamp(g.base + e.clientY - g.y) - g.base);
    setOpen(travelled > COMMIT ? g.base === 0 : g.base !== 0);
    setDrag(null);
  };

  const onClick = () => {
    if (skipClick.current) {
      skipClick.current = false;
      return;
    }
    setOpen((v) => !v);
  };

  const goHome = (e: MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollTo({ top: 0 });
  };

  return (
    <div
      className="pull-ring"
      data-pulled={pulled || undefined}
      data-dragging={drag !== null || undefined}
      style={{ '--off': `${off}px`, '--handle-off': `${handleOff}px`, '--p': height ? off / height : 0 }}
    >
      <div ref={sheetRef} className="pull-ring__sheet" role="dialog" aria-modal="true" aria-label="Site links" inert={!open}>
        <ul className="pull-ring__links">
          {PULL_LINKS.map(({ href, label, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external && { target: '_blank', rel: 'noopener' })}
                className="pull-ring__link"
                onClick={href === '/' ? goHome : undefined}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="pull-ring__handle"
        data-hidden={(hidden && !pulled) || undefined}
        aria-label={open ? 'Close site links' : 'Open site links'}
        aria-expanded={open}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
      >
        <span className="pull-ring__hang">
          <svg ref={svgRef} aria-hidden="true" width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} />
        </span>
      </button>
    </div>
  );
};
