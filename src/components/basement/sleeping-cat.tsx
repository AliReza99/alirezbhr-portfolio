import { useRef } from 'react';
import { useSketch } from '../../hooks/use-sketch';

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

export const SleepingCat = ({ basementOpen, onClick }: SleepingCatProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useSketch(ref, 'cat', { open: basementOpen });

  return (
    <div role="img" aria-label="A cat, sleeping" onClick={onClick} className="sleeping-cat">
      <div ref={ref} data-catbreathe="" className="sleeping-cat__body" />
      {ZZ.map((z) => (
        <span key={z.delay} data-zz="" aria-hidden="true" className="hand sleeping-cat__z" style={{ right: z.right, top: z.top, fontSize: z.size, '--zd': z.delay }}>
          z
        </span>
      ))}
    </div>
  );
};
