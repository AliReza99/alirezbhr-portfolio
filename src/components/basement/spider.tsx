import { useRef, type Ref } from 'react';
import { useSpider } from './use-spider';

type SpiderProps = {
  open: boolean;
  dark: boolean;
  holdStill: () => boolean;
};

const LEGS = ['M-2 6 L-7 2 L-10 5', 'M-3 7 L-8 6 L-11 9', 'M-3 8 L-8 10 L-10 13', 'M-2 9 L-6 13 L-7 15.5'];

/** The spider herself, head down. Drawn in `currentColor`; the pull ring's lining borrows her. */
export const SpiderBody = ({ ref, className }: { ref?: Ref<SVGSVGElement>; className?: string }) => (
  <svg ref={ref} viewBox="-12 -1 24 18" className={className}>
    <g fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round">
      {LEGS.map((d) => (
        <path key={d} d={d} />
      ))}
      <g transform="scale(-1,1)">
        {LEGS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </g>
    <circle cx="0" cy="5" r="4" fill="currentColor" />
    <circle cx="0" cy="10" r="2.2" fill="currentColor" />
  </svg>
);

/** Hangs head-down on a thread from the cobweb in the wall sketch. */
export const Spider = ({ open, dark, holdStill }: SpiderProps) => {
  const dropRef = useRef<HTMLSpanElement>(null);
  const bodyRef = useRef<SVGSVGElement>(null);
  useSpider({ dropRef, bodyRef, open, dark, holdStill });

  return (
    <span aria-hidden="true" className="spider">
      <span ref={dropRef} className="spider__drop">
        <span className="spider__thread" />
        <SpiderBody ref={bodyRef} className="spider__body" />
      </span>
    </span>
  );
};
