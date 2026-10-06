import { useCallback, useRef, useState } from 'react';
import { FAL_TEASES, FALS } from '../../data/fals';
import { pickIndex } from '../../lib/motion';
import { SectionHeader } from '../ui/section-header';
import { useToast } from '../toast/toast-context';
import { FalDialog } from './fal-dialog';
import './education.css';

export const Education = () => {
  const { showToast } = useToast();
  const cornerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [falIdx, setFalIdx] = useState(0);
  const [tease, setTease] = useState(0);
  const teaseSeen = useRef(false);
  const draws = useRef(0);

  // Each new hover of the card shows the next hint.
  const handleHover = () => {
    if (teaseSeen.current) setTease((t) => (t + 1) % FAL_TEASES.length);
    teaseSeen.current = true;
  };

  const openFal = () => {
    setFalIdx((cur) => pickIndex(FALS.length, cur));
    draws.current++;
    if (draws.current === 6) setTimeout(() => showToast('fal'), 2600);
    setOpen(true);
  };

  const close = useCallback(() => setOpen(false), []);

  return (
    <section id="education" data-screen-label="Education" className="section">
      <SectionHeader title="Education" note="where it started" />
      <div className="education">
        <div data-falcard="" onMouseEnter={handleHover} className="boxed education__card">
          <span data-ext="" aria-hidden="true" />
          <div className="boxed__face education__face">
            <div className="education__text">
              <h3 className="education__school">Shiraz University</h3>
              <span className="education__degree">B.Sc. Computer Engineering</span>
            </div>
            <button
              ref={cornerRef}
              type="button"
              onClick={openFal}
              aria-label="Open a fāl-e Hāfez fortune"
              aria-expanded={open}
              className="education__corner"
            >
              <span data-falhint="" aria-hidden="true" className="hand education__hint">
                <span style={{ paddingTop: 12 }}>{FAL_TEASES[tease]}</span>
                <svg width="30" height="20" viewBox="0 0 64 30" style={{ flex: 'none', overflow: 'visible', transform: 'scaleX(-1) rotate(-28deg)' }}>
                  <path d="M62 18 C50 6 28 4 6 14 M6 14 L19 4 M6 14 L21 24" fill="none" stroke="#5A49D6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <svg data-falfold="" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" className="education__fold">
                <path d="M2 2 H38 V38 Z" fill="#FBF6EF" />
                <path d="M2 2 L38 38 H2 Z" fill="#F2E7D8" stroke="#3B3A55" strokeWidth="2" strokeLinejoin="round" />
                <path d="M7 31 L24 31" fill="none" stroke="#3B3A55" strokeOpacity=".35" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <FalDialog open={open} fal={FALS[falIdx]} number={falIdx + 1} originRef={cornerRef} onClose={close} />
    </section>
  );
};
