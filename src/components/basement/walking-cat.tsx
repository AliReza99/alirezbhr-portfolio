import { useRef, type RefObject } from 'react';
import { useSketch } from '../../hooks/use-sketch';

export type WalkingCatHandle = {
  flip: HTMLDivElement | null;
  step: HTMLDivElement | null;
  stride: HTMLDivElement | null;
};

/**
 * The cat on her feet, facing right: two sketches of her, legs together and mid-step, stacked in
 * the parent's box. `catWalkCycle` swaps them. The parent moves her; this only draws her.
 */
export const WalkingCat = ({ handle }: { handle: RefObject<WalkingCatHandle | null> }) => {
  const stepRef = useRef<HTMLDivElement>(null);
  const strideRef = useRef<HTMLDivElement>(null);
  useSketch(stepRef, 'catstep');
  useSketch(strideRef, 'catstride');

  return (
    <div
      ref={(flip) => {
        handle.current = { flip, step: stepRef.current, stride: strideRef.current };
      }}
      className="walking-cat"
    >
      <div ref={stepRef} className="walking-cat" />
      <div ref={strideRef} className="walking-cat" style={{ visibility: 'hidden' }} />
    </div>
  );
};

/** Her walk cycle: the two sketches swapped on a timer. Each stride hops her `lift` px off the floor. */
export const catWalkCycle = ({ flip, step, stride }: WalkingCatHandle, stepMs: number, lift = 5) => {
  let striding = false;
  let walking = false;
  let timer: number | undefined;
  const pose = (on: boolean) => {
    striding = on;
    if (stride) stride.style.visibility = on ? '' : 'hidden';
    if (step) step.style.visibility = on ? 'hidden' : '';
    if (flip) flip.style.translate = on ? `0 ${-lift}px` : '0 0';
  };
  // Eased, so the hop has an up and a down instead of two flat levels.
  if (flip) flip.style.transition = `translate ${Math.round(stepMs * 0.6)}ms ease-out`;
  return {
    isWalking: () => walking,
    /** Start or stop the legs. Stopped, she stands with them together. */
    walk: (on: boolean) => {
      clearInterval(timer);
      walking = on;
      if (on) timer = window.setInterval(() => pose(!striding), stepMs);
      else pose(false);
    },
    /** 1 faces right, -1 left. */
    face: (dir: 1 | -1) => {
      if (flip) flip.style.scale = `${dir} 1`;
    },
    stop: () => clearInterval(timer),
  };
};
