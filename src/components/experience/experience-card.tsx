import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { Role } from '../../data/experience';
import { canAnimate } from '../../lib/motion';
import { EXPAND_ANIMATIONS } from './expand-animations';
import { RichText } from './rich-text';

type ExperienceCardProps = {
  role: Role;
  index: number;
  defaultOpen: boolean;
  onOpen: () => void;
};

export const ExperienceCard = ({ role, index, defaultOpen, onOpen }: ExperienceCardProps) => {
  // `open` controls the panel; `minus` is the toggle icon, which flips mid-animation.
  const [open, setOpen] = useState(defaultOpen);
  const [minus, setMinus] = useState(defaultOpen);
  const busy = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLButtonElement>(null);
  const plusRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Highlights sweep in once, the first time each is fully visible (staggered per list).
  useEffect(() => {
    const ul = listRef.current;
    if (!ul) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-hl-on', '');
            io.unobserve(e.target);
          }
        }),
      { threshold: 1 },
    );
    ul.querySelectorAll<HTMLElement>('[data-hl]').forEach((el, i) => {
      el.style.transitionDelay = `${220 + i * 50}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    if (busy.current) return;
    const willOpen = !open;
    const card = cardRef.current;
    const header = headerRef.current;
    const plus = plusRef.current;
    const panel = panelRef.current;
    if (willOpen) onOpen();

    if (!card || !header || !plus || !panel || !canAnimate(plus)) {
      setOpen(willOpen);
      setMinus(willOpen);
      return;
    }

    busy.current = true;
    const done = () => {
      busy.current = false;
    };

    if (willOpen) {
      // Commit the open layout synchronously so the panel's full height can be measured.
      flushSync(() => setOpen(true));
      EXPAND_ANIMATIONS[index % EXPAND_ANIMATIONS.length]({ plus, panel, card, header, done, flip: () => setMinus(true) });
      return;
    }

    const hc = panel.offsetHeight;
    setMinus(false);
    const anim = panel.animate([{ height: `${hc}px` }, { height: '0px' }], {
      duration: 300,
      easing: 'cubic-bezier(.65,0,.15,1)',
      fill: 'forwards',
    });
    anim.onfinish = () => {
      flushSync(() => setOpen(false));
      anim.cancel();
      done();
    };
  };

  return (
    <article className="boxed">
      <span data-ext="" aria-hidden="true" />
      <div ref={cardRef} className="boxed__face">
        <button ref={headerRef} type="button" onClick={toggle} aria-expanded={open} className="role__header">
          <div className="role__heading">
            <h3 className="role__title">{role.title}</h3>
            <span className="role__company">{role.company}</span>
            <p className="role__summary">
              <RichText segments={role.summary} />
            </p>
          </div>
          <span ref={plusRef} aria-hidden="true" className="role__toggle">
            <span className="role__toggle-bar" />
            <span className="role__toggle-bar role__toggle-bar--v" style={{ transform: `rotate(${minus ? '90deg' : '0deg'})` }} />
          </span>
        </button>
        <div ref={panelRef} className="role__panel" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
          <div className="role__panel-inner">
            <ul ref={listRef} data-dash="" className="role__list">
              {role.bullets.map((b, i) => (
                <li key={i} className="role__item">
                  <span data-tick="" style={{ marginTop: 5 }} />
                  <span style={{ textWrap: 'pretty' }}>
                    <RichText segments={b} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
};
