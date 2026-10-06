import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import type { Fal } from '../../data/fals';
import { canAnimate } from '../../lib/motion';

type FalDialogProps = {
  open: boolean;
  fal: Fal;
  number: number;
  /** The folded corner the slip flies out of and back into. */
  originRef: RefObject<HTMLElement | null>;
  onClose: () => void;
};

const fromOrigin = (origin: HTMLElement | null, el: HTMLElement) => {
  const b = origin?.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  if (!b) return 'translate(0,-40px) scale(.5)';
  return `translate(${b.left + b.width / 2 - r.left - r.width / 2}px,${b.top + b.height / 2 - r.top - r.height / 2}px) rotate(12deg) scale(.12)`;
};

export const FalDialog = ({ open, fal, number, originRef, onClose }: FalDialogProps) => {
  const slipRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Fly out of the corner and write the lines in; fly back on close.
  useLayoutEffect(() => {
    const el = slipRef.current;
    if (!el) return;
    if (open && !wasOpen.current) {
      closeRef.current?.focus({ preventScroll: true });
      if (canAnimate(el)) {
        el.getAnimations().forEach((a) => a.cancel());
        const delay = 300;
        el.animate([{ opacity: 0, transform: fromOrigin(originRef.current, el) }, { opacity: 1, transform: 'none' }], {
          duration: 720,
          delay,
          easing: 'cubic-bezier(.3,1.25,.5,1)',
          fill: 'backwards',
        });
        el.querySelectorAll('[data-fl]').forEach((line, i) =>
          line.animate([{ clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% -2% -20% 0)' }], {
            duration: 750,
            delay: delay + 380 + i * 620,
            easing: 'cubic-bezier(.5,0,.3,1)',
            fill: 'backwards',
          }),
        );
      }
    } else if (!open && wasOpen.current && canAnimate(el)) {
      el.getAnimations().forEach((a) => a.cancel());
      el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: fromOrigin(originRef.current, el) }], {
        duration: 420,
        easing: 'cubic-bezier(.5,0,.6,1)',
        fill: 'forwards',
      });
    }
    wasOpen.current = open;
  }, [open, originRef]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Your fāl-e Hāfez"
      aria-hidden={!open}
      className="fal"
      style={{ opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden', transition: `opacity .35s ease, visibility 0s linear ${open ? '0s' : '.4s'}` }}
    >
      <div onClick={onClose} aria-hidden="true" className="fal__backdrop" />
      <div ref={slipRef} className="fal__slip">
        <div className="fal__paper">
          <span data-ext="" aria-hidden="true" />
          <span data-tape="" aria-hidden="true" style={{ '--tw': '110px', '--tr': '3deg', '--ta': '80deg' }} />
          <div className="fal__sheet">
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="close-x fal__close">
              <span />
              <span />
            </button>
            <span className="fal__number">fāl no. {number}</span>
            <span data-fl="" className="fal__line">
              {fal[0]}
            </span>
            <span data-fl="" className="fal__line fal__line--indent">
              {fal[1]}
            </span>
            <span data-fl="" className="fal__meaning">
              meaning: {fal[2]}
            </span>
            <span className="fal__sign">
              <span style={{ transform: 'rotate(-3deg)' }}>— Hāfez, probably</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
