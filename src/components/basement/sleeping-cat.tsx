import { useEffect, useRef, useState } from 'react';
import { useSketch } from '../../hooks/use-sketch';
import { prefersReducedMotion } from '../../lib/motion';
import { WalkingCat, catWalkCycle, type WalkingCatHandle } from './walking-cat';

type SleepingCatProps = {
  /** While the basement is open her tail hangs down through the hatch. */
  basementOpen: boolean;
  onClick: () => void;
};

const ZZ = [
  { right: 14, top: -4, size: 20, delay: '0s' },
  { right: 4, top: -14, size: 16, delay: '1.2s' },
  { right: -4, top: -22, size: 13, delay: '2.4s' },
];

/** `waiting`: off the left edge of the screen until the visitor looks. `walking`: on her way to her spot. */
type Phase = 'waiting' | 'walking' | 'asleep';

/** Her box is this wide, and her head takes up the leading part of it. */
const WIDTH = 124;
const HEAD = 48;
/** How far past her spot she wanders before turning back. */
const OVERSHOOT = 90;
/** Walking speed, px per ms. */
const SPEED = 0.13;
const STEP_MS = 150;
/** The strip has to stay in view this long before she comes out, so scrolling past does not waste the walk. */
const LOOK_MS = 400;
/** How long a poke stops her mid-walk. */
const STARE_MS = 700;

/** She makes the walk once per page load, even if the strip is rebuilt. */
let settled = false;

/**
 * Vega, the cat on the floor strip. The first time, she pokes her head in from the left edge of the screen,
 * walks in past her spot, comes back, turns around on it and curls up. After that she is just asleep.
 */
export const SleepingCat = ({ basementOpen, onClick }: SleepingCatProps) => {
  const [phase, setPhase] = useState<Phase>(() => (settled || prefersReducedMotion() ? 'asleep' : 'waiting'));
  const rootRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const handle = useRef<WalkingCatHandle | null>(null);
  const stareRef = useRef(() => {});
  useSketch(ref, 'cat', { open: basementOpen });

  useEffect(() => {
    const root = rootRef.current;
    const walker = walkerRef.current;
    if (!root || !walker?.animate || !handle.current) return;
    const cycle = catWalkCycle(handle.current, STEP_MS);
    const legs = cycle.walk;
    const face = cycle.face;

    let gone = false;
    let anim: Animation | undefined;
    let stareTimer: number | undefined;
    let lookTimer: number | undefined;
    const pos = { x: 0 };
    const at = () => ({ translate: `${pos.x}px 0` });

    const move = (to: Partial<typeof pos>, ms: number, easing = 'linear') => {
      const from = at();
      Object.assign(pos, to);
      anim = walker.animate([from, at()], { duration: ms, easing, fill: 'forwards' });
      return anim.finished;
    };
    const hold = (ms: number) => move({}, ms);
    const walkTo = (x: number) => move({ x }, Math.abs(x - pos.x) / SPEED);

    // Poked on the way: she stops dead for a moment, then carries on.
    stareRef.current = () => {
      if (!anim || anim.playState !== 'running') return;
      const a = anim;
      const wasStepping = cycle.isWalking();
      a.pause();
      legs(false);
      clearTimeout(stareTimer);
      stareTimer = window.setTimeout(() => {
        a.play();
        if (wasStepping) legs(true);
      }, STARE_MS);
    };

    const arrive = async () => {
      // A phone has no room for the full detour.
      const room = document.documentElement.clientWidth - root.getBoundingClientRect().right - 8;
      const far = Math.max(24, Math.min(OVERSHOOT, room));
      // Her spot's distance from the left edge of the screen, which is what hides her.
      const edge = root.getBoundingClientRect().left;
      const peek = HEAD - WIDTH - edge;
      pos.x = -WIDTH - edge - 8;
      Object.assign(walker.style, at());
      setPhase('walking');
      // Just her head round the edge, a look, a small duck back, then in she comes.
      await move({ x: peek }, 420, 'ease-out');
      await hold(750);
      await move({ x: peek - 16 }, 200, 'ease-in-out');
      await hold(300);
      legs(true);
      await walkTo(far);
      legs(false);
      await hold(450);
      face(-1);
      await hold(220);
      legs(true);
      await walkTo(0);
      legs(false);
      // Once round on the spot before lying down.
      await hold(200);
      face(1);
      await hold(260);
      face(-1);
      await hold(260);
      face(1);
      await hold(320);
      await walker.animate([{ scale: '1 1' }, { scale: '1.06 0.72' }], { duration: 170, easing: 'ease-in', fill: 'forwards' }).finished;
      settled = true;
      setPhase('asleep');
      ref.current?.animate([{ scale: '1.06 0.72' }, { scale: '1 1' }], { duration: 320, easing: 'cubic-bezier(.3,1.5,.5,1)' });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(lookTimer);
        if (!entry.isIntersecting) return;
        lookTimer = window.setTimeout(() => {
          io.disconnect();
          // Cancelled animations reject: that is the visitor leaving mid-walk.
          arrive().catch(() => {
            if (!gone) setPhase('asleep');
          });
        }, LOOK_MS);
      },
      { threshold: 0.6 },
    );
    io.observe(root);

    return () => {
      gone = true;
      io.disconnect();
      clearTimeout(lookTimer);
      clearTimeout(stareTimer);
      cycle.stop();
      walker.getAnimations().forEach((a) => a.cancel());
      stareRef.current = () => {};
    };
  }, []);

  const asleep = phase === 'asleep';

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={asleep ? 'Vega the cat, sleeping' : 'Vega the cat'}
      onClick={asleep ? onClick : () => stareRef.current()}
      className="sleeping-cat"
    >
      <div ref={ref} data-catbreathe="" className="sleeping-cat__body" style={{ visibility: asleep ? undefined : 'hidden' }} />
      {!asleep && (
        <div ref={walkerRef} className="sleeping-cat__walker" style={{ visibility: phase === 'walking' ? undefined : 'hidden' }}>
          <WalkingCat handle={handle} />
        </div>
      )}
      {asleep &&
        ZZ.map((z) => (
          <span key={z.delay} data-zz="" aria-hidden="true" className="hand sleeping-cat__z" style={{ right: z.right, top: z.top, fontSize: z.size, '--zd': z.delay }}>
            z
          </span>
        ))}
    </div>
  );
};
