import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { FAL_TEASES, FALS } from '../../data/fals';
import { pickIndex } from '../../lib/motion';
import { SectionHeader } from '../ui/section-header';
import { useToast } from '../toast/toast-context';
import { FalDialog } from './fal-dialog';
import './education.css';

const isTouch = () => window.matchMedia('(hover: none)').matches;

export const Education = () => {
  const { showToast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const cornerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [falIdx, setFalIdx] = useState(0);
  // Touch screens open on the second hint, which reads better with no hover before it.
  const [tease, setTease] = useState(() => (isTouch() ? 1 : 0));
  const [hintOn, setHintOn] = useState(false);
  const [peek, setPeek] = useState(false);
  const teaseSeen = useRef(false);
  const draws = useRef(0);

  const nextTease = () => {
    if (teaseSeen.current) setTease((t) => (t + 1) % FAL_TEASES.length);
    teaseSeen.current = true;
  };

  // Each new hover of the card shows the next hint.
  const handleHover = () => {
    if (!isTouch()) nextTease();
  };

  const unfold = () => {
    nextTease();
    setPeek(false);
    setHintOn(true);
  };

  // Touch screens have no hover, so a tap on the card unfolds the corner and shows the next hint.
  const handleTap = (e: MouseEvent<HTMLDivElement>) => {
    if (isTouch() && !cornerRef.current?.contains(e.target as Node)) unfold();
  };

  // On touch the first tap on a folded corner only unfolds it. Keyboard and screen reader clicks open the fāl directly.
  const handleCorner = (e: MouseEvent<HTMLButtonElement>) => {
    if (isTouch() && !hintOn && e.detail !== 0) unfold();
    else openFal();
  };

  // On touch the fold peeks each time the card scrolls mostly into view.
  // Scrolling the card out of view folds the corner back over the hint.
  useEffect(() => {
    const card = cardRef.current;
    if (!card || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setHintOn(false);
          setPeek(false);
        } else if (entry.intersectionRatio >= 0.6) {
          setPeek(true);
        }
      },
      { threshold: [0, 0.6] },
    );
    io.observe(card);
    return () => io.disconnect();
  }, []);

  const openFal = () => {
    const first = draws.current === 0;
    setFalIdx((cur) => (first ? 0 : pickIndex(FALS.length, cur)));
    draws.current++;
    if (draws.current === 6) setTimeout(() => showToast('fal'), 2600);
    setOpen(true);
  };

  const close = useCallback(() => {
    setOpen(false);
    setHintOn(false);
  }, []);

  return (
    <section id="education" data-screen-label="Education" className="section">
      <SectionHeader title="Education" />
      <div className="education">
        <div
          ref={cardRef}
          data-falcard=""
          data-hint={hintOn ? '' : undefined}
          data-peek={peek && !hintOn ? '' : undefined}
          onMouseEnter={handleHover}
          onClick={handleTap}
          className="boxed education__card"
        >
          <span data-ext="" aria-hidden="true" />
          <div className="boxed__face education__face">
            <div className="education__text">
              <h3 className="education__school">Shiraz University</h3>
              <span className="education__degree">B.Sc. Computer Engineering</span>
            </div>
            <button
              ref={cornerRef}
              type="button"
              onClick={handleCorner}
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
