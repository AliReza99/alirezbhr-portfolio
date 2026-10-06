import { useRef, useState, type MouseEvent, type Ref } from 'react';
import { useSketch } from '../../hooks/use-sketch';

type LampProps = {
  ref?: Ref<HTMLDivElement>;
  dark: boolean;
  visible: boolean;
  onToggle: (e: MouseEvent<HTMLButtonElement>) => void;
};

const Socket = ({ width, height, marginTop }: { width: number; height: number; marginTop?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  useSketch(ref, 'socket');
  return <span ref={ref} className="lamp__part" style={{ width, height, marginTop }} />;
};

/** Ceiling plate, cord and a pull-to-toggle bulb. `ref` is the part that swings: everything below the plate. */
export const Lamp = ({ ref, dark, visible, onToggle }: LampProps) => {
  const cordRef = useRef<HTMLSpanElement>(null);
  const bulbRef = useRef<HTMLSpanElement>(null);
  // The hint has done its job after the first pull.
  const [pulled, setPulled] = useState(false);
  useSketch(cordRef, 'cord');
  useSketch(bulbRef, 'bulb', { dark, boil: true });

  return (
    <div className="lamp" style={{ visibility: visible ? 'visible' : 'hidden' }}>
      <div className="lamp__base">
        <Socket width={44} height={12} />
        <Socket width={16} height={8} marginTop={-1} />
      </div>
      <div ref={ref} className="lamp__swing">
        <button
          type="button"
          onClick={(e) => {
            setPulled(true);
            onToggle(e);
          }}
          aria-label="Pull the light"
          className="lamp__pull"
        >
          <span ref={cordRef} className="lamp__cord" />
          <Socket width={18} height={14} />
          <span ref={bulbRef} className="lamp__bulb" style={{ boxShadow: dark ? 'none' : '0 0 46px 20px rgba(255,214,150,.38)' }} />
        </button>
        {!pulled && (
          <span className="hand lamp__hint">
            <span className="lamp__hint-arrow">←</span> pull me
          </span>
        )}
      </div>
    </div>
  );
};
