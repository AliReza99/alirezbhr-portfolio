import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import { SKILLS } from '../../data/skills';
import { prefersReducedMotion } from '../../lib/motion';
import { SectionHeader } from '../ui/section-header';
import { useToast } from '../toast/toast-context';
import { SkillLabel } from './skill-label';
import { useSkillDrag } from './use-skill-drag';
import './skills.css';

const CATEGORIES = SKILLS.map((c) => c.name);

type SkillProps = {
  name: string;
  slot: number;
  highlight: boolean;
  faded: boolean;
  /** Bounce when a drag shifts a different skill into this slot. */
  bounce: boolean;
};

const Skill = ({ name, slot, highlight, faded, bounce }: SkillProps) => {
  const ref = useRef<HTMLElement>(null);
  const prev = useRef(name);

  useLayoutEffect(() => {
    if (prev.current !== name && bounce && ref.current && !prefersReducedMotion())
      ref.current.animate([{ transform: 'translateY(-4px) rotate(-2deg)' }, { transform: 'none' }], {
        duration: 260,
        easing: 'cubic-bezier(.3,1.6,.5,1)',
      });
    prev.current = name;
  }, [name, bounce]);

  const Tag = highlight ? 'strong' : 'span';
  return (
    <Tag
      ref={ref}
      data-skill=""
      data-slot={slot}
      data-hl={highlight ? '' : undefined}
      className="skills__skill"
      style={faded ? { opacity: 0.25 } : undefined}
    >
      {name}
    </Tag>
  );
};

const Separator = () => (
  <span aria-hidden="true" className="skills__sep">
    {' · '}
  </span>
);

const DailyDrivers = () => (
  <span className="hand skills__note">
    <svg aria-hidden="true" width="30" height="14" viewBox="0 0 64 30" style={{ flex: 'none' }}>
      <path d="M62 18 C50 6 28 4 6 14 M6 14 L19 4 M6 14 L21 24" fill="none" stroke="#5A49D6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    daily drivers
  </span>
);

export const Skills = () => {
  const { showToast } = useToast();
  const listRef = useRef<HTMLUListElement>(null);
  const [orders, setOrders] = useState(() => SKILLS.map((c) => c.skills));
  const rerolls = useRef(0);

  const preview = useSkillDrag({
    listRef,
    orders,
    categories: CATEGORIES,
    commit: (row, order) => setOrders((all) => all.map((o, i) => (i === row ? order : o))),
    onReject: (s, c) => showToast('drag', { s, c }),
  });

  // Easter egg: the 10th bullet reroll gets a toast.
  const handleReroll = () => {
    rerolls.current++;
    if (rerolls.current === 10) setTimeout(() => showToast('bullet'), 450);
  };

  return (
    <section id="skills" data-screen-label="Skills" className="section">
      <SectionHeader title="Skills" note="my toolbox" />
      <div className="boxed">
        <span data-ext="" aria-hidden="true" />
        <div className="boxed__face skills__card">
          <ul ref={listRef} className="skills__list">
            {SKILLS.map((cat, row) => {
              const dragging = preview?.row === row;
              const items = dragging ? preview.order : orders[row];
              const skills = items.map((name, slot) => (
                <Fragment key={slot}>
                  {slot > 0 && <Separator />}
                  <Skill name={name} slot={slot} highlight={!!cat.core} faded={dragging && preview.slot === slot} bounce={dragging && preview.slot !== slot} />
                </Fragment>
              ));
              return (
                <li key={cat.name} data-skill-row={row} className="skills__row">
                  <SkillLabel name={cat.name} onReroll={handleReroll} />
                  <div className="skills__items">
                    {cat.core ? (
                      <span className="skills__core">
                        <span>{skills}</span>
                        <DailyDrivers />
                      </span>
                    ) : (
                      <span>{skills}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};
