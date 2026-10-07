import { useEffect, useRef, useState } from 'react';
import to from 'await-to-js';
import { EMAIL } from '../../data/profile';
import { useToast } from '../toast/toast-context';

const NAG_AFTER = 5;

/** Copies the email. The doodle swaps to a tick for a moment; the fifth click gets a toast. */
export const CopyButton = () => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const clicks = useRef(0);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = async () => {
    clicks.current++;
    if (clicks.current === NAG_AFTER) showToast('copy');
    setCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 1800);

    if (!navigator.clipboard) return;
    // A blocked clipboard is not worth surfacing; the tick already says what happened.
    await to(navigator.clipboard.writeText(EMAIL));
  };

  const label = copied ? 'Email copied' : 'Copy email';

  return (
    <button type="button" onClick={copy} aria-label={label} title={label} data-copied={copied || undefined} className="copy-btn">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="copy-btn__icon">
        {copied ? (
          <path pathLength={1} d="M5.4 12.9 C7 14.2 8.6 15.8 10 17.3 C12.5 12.7 15.6 8.8 19.5 5.5" className="copy-btn__tick" />
        ) : (
          <>
            {/* Each sheet is one pen stroke that overshoots its starting corner. */}
            <path d="M9.6 7.4 C9.3 6.2 9.5 5 9.9 3.9 C12.8 3.5 16.2 4.1 19.6 3.7 C19.2 7.2 20 11 19.5 15.2 C18.6 15.5 17.6 15.3 16.6 15.6" />
            <path d="M4.6 8.6 C7.9 9.2 11.4 8.3 14.9 8.9 C14.4 12.5 15.3 16.4 14.7 20.2 C11.3 19.7 8.2 20.6 4.9 20 C5.4 16.3 4.4 12.6 5.3 7.9" />
            <path d="M7.4 12.7 C9 12.3 10.6 13 12.3 12.5 M7.5 16 C8.7 15.7 9.8 16.2 10.9 15.9" className="copy-btn__scribble" />
          </>
        )}
      </svg>
    </button>
  );
};
