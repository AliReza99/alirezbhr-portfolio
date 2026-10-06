import { useEffect, useRef, useState } from 'react';
import to from 'await-to-js';
import { EMAIL } from '../../data/profile';
import { canAnimate } from '../../lib/motion';
import { MorphLabel } from '../ui/morph-label';
import { useToast } from '../toast/toast-context';

const FULL = 5;

const inkLevel = (ink: number) => (ink === 0 ? '-6px' : ink >= FULL ? 'calc(100% + 6px)' : `${ink * 20}%`);

/** Copies the email. Every click raises the ink a fifth; once full it stays pressed in. */
export const CopyButton = () => {
  const { showToast } = useToast();
  const [ink, setInk] = useState(0);
  const [copied, setCopied] = useState(false);
  const inkRef = useRef<HTMLSpanElement>(null);
  const clicks = useRef(0);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = async () => {
    setInk((n) => Math.min(FULL, n + 1));
    // Slosh the ink surface.
    if (canAnimate(inkRef.current))
      inkRef.current.animate([{ '--wv': '1.5px' }, { '--wv': '4px', offset: 0.25 }, { '--wv': '-2.5px', offset: 0.55 }, { '--wv': '1.5px' }], {
        duration: 1000,
        easing: 'ease-out',
      });
    clicks.current++;
    if (clicks.current === FULL) showToast('copy');
    setCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 1800);

    if (!navigator.clipboard) return;
    // A blocked clipboard is not worth surfacing; the label already says what happened.
    await to(navigator.clipboard.writeText(EMAIL));
  };

  const label = copied ? 'Copied ✓' : 'Copy';

  return (
    <button type="button" onClick={copy} className="copy-btn">
      <span data-wob="" className="btn-shadow copy-btn__shadow" />
      <span className="copy-btn__face" style={{ transform: ink >= FULL ? 'translate(3px,3px)' : 'none' }}>
        <MorphLabel>{label}</MorphLabel>
        <span ref={inkRef} aria-hidden="true" className="copy-btn__ink" style={{ '--lv': inkLevel(ink) }}>
          <MorphLabel hideCursive={false}>{label}</MorphLabel>
        </span>
      </span>
    </button>
  );
};
