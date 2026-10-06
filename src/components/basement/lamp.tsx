import { useRef, type MouseEvent, type Ref } from 'react';
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

/** Ceiling plate, cord and a pull-to-toggle bulb, gently swinging. */
export const Lamp = ({ ref, dark, visible, onToggle }: LampProps) => {
  const cordRef = useRef<HTMLSpanElement>(null);
  const bulbRef = useRef<HTMLButtonElement>(null);
  useSketch(cordRef, 'cord');
  useSketch(bulbRef, 'bulb', { dark, boil: true });

  return (
    <div ref={ref} className="lamp" style={{ visibility: visible ? 'visible' : 'hidden' }}>
      <Socket width={44} height={12} />
      <Socket width={16} height={8} marginTop={-1} />
      <span ref={cordRef} className="lamp__cord" />
      <Socket width={18} height={14} />
      <button
        ref={bulbRef}
        type="button"
        onClick={onToggle}
        aria-label="Pull the light"
        className="lamp__bulb"
        style={{ boxShadow: dark ? 'none' : '0 0 46px 20px rgba(255,214,150,.38)' }}
      />
      <span className="hand lamp__hint">{dark ? 'turn it back on. please.' : '← pull me'}</span>
    </div>
  );
};
