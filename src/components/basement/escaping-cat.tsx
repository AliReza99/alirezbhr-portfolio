import { useEffect, useRef } from 'react';
import { WalkingCat, catWalkCycle, type WalkingCatHandle } from './walking-cat';

type EscapingCatProps = {
  /** Where her eyes were when the light came on, in px from the basement's left edge. */
  from: number;
  /** Lights out again mid-run: only her eyes show. */
  dark: boolean;
  onOut: () => void;
};

/** Her head sits this far into her 124px box when she faces left. */
const HEAD_X = 28;
const WIDTH = 124;
/** Caught in the light: how long she stays frozen before bolting. */
const FREEZE_MS = 550;
/** px per ms: quicker than her stroll upstairs. */
const RUN = 0.32;
const STEP_MS = 90;
/** How high each running stride throws her, and how high the fright does. */
const LIFT = 8;
const STARTLE = 18;

/**
 * The light came back on before she was out. She is caught on the basement floor, freezes,
 * then bolts off the left side of the room.
 */
export const EscapingCat = ({ from, dark, onOut }: EscapingCatProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const handle = useRef<WalkingCatHandle | null>(null);
  const out = useRef(onOut);
  out.current = onOut;

  useEffect(() => {
    const root = rootRef.current;
    if (!root?.animate || !handle.current) return;
    const cycle = catWalkCycle(handle.current, STEP_MS, LIFT);
    const pos = { x: from - HEAD_X };
    const at = () => ({ translate: `${pos.x}px 0` });
    const move = (to: Partial<typeof pos>, ms: number, easing = 'linear') => {
      const start = at();
      Object.assign(pos, to);
      return root.animate([start, at()], { duration: ms, easing, fill: 'forwards' }).finished;
    };

    const run = async () => {
      Object.assign(root.style, at());
      cycle.face(-1);
      await move({}, FREEZE_MS);
      // A jump on the spot, then she is off.
      const x = `${pos.x}px`;
      await root.animate([{ translate: `${x} 0` }, { translate: `${x} ${-STARTLE}px`, easing: 'ease-in' }, { translate: `${x} 0` }], { duration: 240, easing: 'ease-out' }).finished;
      cycle.walk(true);
      const off = -WIDTH - 16;
      await move({ x: off }, Math.abs(off - pos.x) / RUN, 'ease-in');
      out.current();
    };
    // Cancelled animations reject: the basement was torn down mid-run.
    run().catch(() => {});

    return () => {
      cycle.stop();
      root.getAnimations().forEach((a) => a.cancel());
    };
  }, [from]);

  return (
    <div ref={rootRef} aria-hidden="true" className={dark ? 'basement__runaway basement__runaway--dark' : 'basement__runaway'}>
      <WalkingCat handle={handle} />
      <span className="basement__runaway-eyes">
        <span data-beye="" />
        <span data-beye="" />
      </span>
    </div>
  );
};
