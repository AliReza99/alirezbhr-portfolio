import { useEffect, useRef, useState } from 'react';
import { useSketch } from '../../hooks/use-sketch';
import { prefersReducedMotion } from '../../lib/motion';
import type { SketchType } from '../../lib/sketches';
import type { CatPoke } from './basement-voice';
import { WalkingCat, catWalkCycle, type WalkingCatHandle } from './walking-cat';

type SleepingCatProps = {
  /** While the basement is open her tail hangs down through the hatch. */
  basementOpen: boolean;
  /** How far right of her first spot she is sleeping, in px. */
  rest: number;
  onRest: (x: number) => void;
  onPoke: (poke: CatPoke) => void;
};

const ZZ = [
  { right: 14, top: -4, size: 20, delay: '0s' },
  { right: 4, top: -14, size: 16, delay: '1.2s' },
  { right: -4, top: -22, size: 13, delay: '2.4s' },
];

/** `waiting`: off the left edge of the screen until the visitor looks. `walking`: on her feet. `away`: poked off the page. */
type Phase = 'waiting' | 'walking' | 'asleep' | 'away';

/** How she lies: out cold, one eye open, or head up. */
type Pose = 'asleep' | 'peek' | 'up';
const POSES: [Pose, SketchType][] = [
  ['asleep', 'cat'],
  ['peek', 'catpeek'],
  ['up', 'catup'],
];

/**
 * What each poke in a row gets, starting over after the last. Only the twitch is on for now;
 * the full run is ['twitch', 'peek', 'peek', 'glare', 'move', 'glare', 'leave'].
 */
const LADDER: CatPoke[] = ['twitch'];
/** Left alone this long, she forgets she was being poked. */
const CALM_MS = 10000;
const PEEK_MS = 1100;
const GLARE_MS = 1500;
/** Holding the pointer on her this long is a pet, not a poke. */
const PET_MS = 450;
/** How long she keeps purring after the hand lifts. */
const PURR_MS = 1800;
/** How long she stays away once poked off the page. */
const AWAY_MS = 20000;

/** Her box is this wide. */
const WIDTH = 124;
/** How far she moves when poked off her spot. */
const SHIFT = 90;
/** Walking speed, px per ms. */
const SPEED = 0.13;
/** She leaves quicker than she came. */
const HUFF = 0.2;
const STEP_MS = 150;
/** The strip has to stay in view this long before she comes out, so scrolling past does not waste the walk. */
const LOOK_MS = 400;
/** How long a poke stops her mid-walk. */
const STARE_MS = 700;

const LIE_DOWN = [{ scale: '1 1' }, { scale: '1.06 0.72' }];
const SQUISH = [{ scale: '1 1' }, { scale: '1.07 0.86' }, { scale: '1 1' }];

/** She makes the walk once per page load, even if the strip is rebuilt. */
let settled = false;

const CatPose = ({ type, open, shown }: { type: SketchType; open: boolean; shown: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  useSketch(ref, type, { open });
  return <div ref={ref} className="sleeping-cat__pose" style={{ visibility: shown ? undefined : 'hidden' }} />;
};

/**
 * Vega, the cat on the floor strip. The first time, she walks in from the left edge of the screen
 * to her spot and curls up. After that she is asleep, and each
 * poke in a row annoys her more: a twitch, an eye, a glare, another spot, and then she walks out for a while.
 * Holding the pointer on her pets her instead.
 */
export const SleepingCat = ({ basementOpen, rest, onRest, onPoke }: SleepingCatProps) => {
  const [phase, setPhase] = useState<Phase>(() => (settled || prefersReducedMotion() ? 'asleep' : 'waiting'));
  const [pose, setPose] = useState<Pose>('asleep');
  const [purring, setPurring] = useState(false);
  /** Bumped to start the z's over. */
  const [zRun, setZRun] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const handle = useRef<WalkingCatHandle | null>(null);
  const acts = useRef({ stare: () => {}, move: () => {}, leave: () => {} });
  const live = useRef({ rest, onRest });
  live.current = { rest, onRest };
  const pokes = useRef(0);
  const pet = useRef({ on: false, endedAt: 0 });
  const timers = useRef<{ calm?: number; pose?: number; hold?: number; purr?: number }>({});

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
    let awayTimer: number | undefined;
    let io: IntersectionObserver | undefined;
    // Where the walker is, from where the sleeping cat lies.
    const pos = { x: 0 };
    const at = () => ({ translate: `${pos.x}px 0` });

    const move = (to: Partial<typeof pos>, ms: number, easing = 'linear') => {
      const from = at();
      Object.assign(pos, to);
      anim = walker.animate([from, at()], { duration: ms, easing, fill: 'forwards' });
      return anim.finished;
    };
    const hold = (ms: number) => move({}, ms);
    const walkTo = (x: number, speed = SPEED) => move({ x }, Math.abs(x - pos.x) / speed);
    /** Puts the walker at `x`, clear of whatever the last walk left on it. */
    const place = (x: number) => {
      walker.getAnimations().forEach((a) => a.cancel());
      pos.x = x;
      Object.assign(walker.style, at());
    };
    /** How far off her spot the left edge of the screen hides all of her. */
    const offstage = () => -WIDTH - root.getBoundingClientRect().left - 8;
    /** How far right of her first spot there is room to sleep. A phone has very little. */
    const farSpot = () => Math.max(24, Math.min(SHIFT, document.documentElement.clientWidth - (root.getBoundingClientRect().right - live.current.rest) - 8));

    /** Curls up where the walker stands, `x` px from her first spot. */
    const lieDown = async (x: number) => {
      await walker.animate(LIE_DOWN, { duration: 170, easing: 'ease-in', fill: 'forwards' }).finished;
      settled = true;
      live.current.onRest(x);
      setPhase('asleep');
      bodyRef.current?.animate([...LIE_DOWN].reverse(), { duration: 320, easing: 'cubic-bezier(.3,1.5,.5,1)' });
    };

    const getUp = async () => {
      place(0);
      face(1);
      setPhase('walking');
      await walker.animate([...LIE_DOWN].reverse(), { duration: 260, easing: 'cubic-bezier(.3,1.5,.5,1)' }).finished;
      await hold(260);
    };

    // Poked on the way: she stops dead for a moment, then carries on.
    const stare = () => {
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
      place(offstage());
      face(1);
      setPhase('walking');
      legs(true);
      await walkTo(0);
      legs(false);
      await hold(240);
      await lieDown(live.current.rest);
    };

    /** Poked once too often: she gets up and sleeps on her other spot. */
    const relocate = async () => {
      const from = live.current.rest;
      const to = from ? 0 : farSpot();
      await getUp();
      if (to < from) {
        face(-1);
        await hold(200);
      }
      legs(true);
      await walkTo(to - from);
      legs(false);
      await hold(240);
      if (to < from) {
        face(1);
        await hold(260);
      }
      await lieDown(to);
    };

    /** Poked there as well: she walks out the way she came in, and is back on her first spot later. */
    const leave = async () => {
      await getUp();
      face(-1);
      await hold(380);
      legs(true);
      await walkTo(offstage(), HUFF);
      legs(false);
      setPhase('away');
      live.current.onRest(0);
      awayTimer = window.setTimeout(watch, AWAY_MS);
    };

    // Cancelled animations reject: that is the visitor leaving mid-walk.
    const run = (walk: () => Promise<void>) => () => {
      walk().catch(() => {
        if (!gone) setPhase('asleep');
      });
    };

    /** She comes in once the strip has been looked at for a moment. */
    const watch = () => {
      io = new IntersectionObserver(
        ([entry]) => {
          clearTimeout(lookTimer);
          if (!entry.isIntersecting) return;
          lookTimer = window.setTimeout(() => {
            io?.disconnect();
            run(arrive)();
          }, LOOK_MS);
        },
        { threshold: 0.6 },
      );
      io.observe(root);
    };
    if (!settled && !prefersReducedMotion()) watch();
    acts.current = { stare, move: run(relocate), leave: run(leave) };

    return () => {
      gone = true;
      io?.disconnect();
      clearTimeout(lookTimer);
      clearTimeout(stareTimer);
      clearTimeout(awayTimer);
      Object.values(timers.current).forEach(clearTimeout);
      cycle.stop();
      walker.getAnimations().forEach((a) => a.cancel());
      acts.current = { stare: () => {}, move: () => {}, leave: () => {} };
    };
  }, []);

  const asleep = phase === 'asleep';

  const poke = () => {
    if (!asleep) return acts.current.stare();
    // Lifting the hand after a pet is not a poke.
    if (performance.now() - pet.current.endedAt < 400) return;
    const t = timers.current;
    clearTimeout(t.calm);
    clearTimeout(t.pose);
    if (prefersReducedMotion()) return onPoke('twitch');
    t.calm = window.setTimeout(() => (pokes.current = 0), CALM_MS);
    const mood = LADDER[pokes.current++];
    if (pokes.current === LADDER.length) pokes.current = 0;
    setPose(mood === 'peek' ? 'peek' : mood === 'glare' ? 'up' : 'asleep');
    if (mood === 'twitch') {
      bodyRef.current?.animate(SQUISH, { duration: 280, easing: 'ease-out' });
      setZRun((n) => n + 1);
    } else if (mood === 'peek') t.pose = window.setTimeout(() => setPose('asleep'), PEEK_MS);
    else if (mood === 'glare')
      t.pose = window.setTimeout(() => {
        setPose('asleep');
        bodyRef.current?.animate(SQUISH, { duration: 280, easing: 'ease-out' });
      }, GLARE_MS);
    else acts.current[mood]();
    onPoke(mood);
  };

  const press = () => {
    if (!asleep || pose !== 'asleep') return;
    const t = timers.current;
    clearTimeout(t.hold);
    t.hold = window.setTimeout(() => {
      clearTimeout(t.purr);
      pet.current.on = true;
      // A pet settles her: the poking is forgiven.
      pokes.current = 0;
      setPurring(true);
    }, PET_MS);
  };

  const release = () => {
    const t = timers.current;
    clearTimeout(t.hold);
    if (!pet.current.on) return;
    pet.current = { on: false, endedAt: performance.now() };
    t.purr = window.setTimeout(() => setPurring(false), PURR_MS);
  };

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={asleep ? 'Vega the cat, sleeping' : phase === 'away' ? 'Vega the cat has left' : 'Vega the cat'}
      onClick={poke}
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      className={`sleeping-cat${phase === 'away' ? ' sleeping-cat--away' : ''}`}
    >
      <div
        ref={bodyRef}
        data-catbreathe=""
        className={`sleeping-cat__body${purring ? ' sleeping-cat__body--purring' : ''}`}
        style={{ visibility: asleep ? undefined : 'hidden' }}
      >
        {POSES.map(([name, type]) => (
          // The tail only finds the hatch from her first spot.
          <CatPose key={name} type={type} open={basementOpen && !rest} shown={pose === name} />
        ))}
      </div>
      <div ref={walkerRef} className="sleeping-cat__walker" style={{ visibility: phase === 'walking' ? undefined : 'hidden' }}>
        <WalkingCat handle={handle} />
      </div>
      {asleep && pose === 'peek' && (
        <span aria-hidden="true" className="hand sleeping-cat__z" style={{ right: ZZ[0].right, top: ZZ[0].top, fontSize: ZZ[0].size }}>
          ?
        </span>
      )}
      {asleep &&
        pose === 'asleep' &&
        ZZ.map((z) => (
          <span key={`${zRun}${z.delay}`} data-zz="" aria-hidden="true" className="hand sleeping-cat__z" style={{ right: z.right, top: z.top, fontSize: z.size, '--zd': z.delay }}>
            {purring ? 'purr' : 'z'}
          </span>
        ))}
    </div>
  );
};
