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
  faded: boolean;
  /** Bounce when a drag shifts a different skill into this slot. */
  bounce: boolean;
};

const Skill = ({ name, slot, faded, bounce }: SkillProps) => {
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

  return (
    <span
      ref={ref}
      data-skill=""
      data-slot={slot}
      className="skills__skill"
      style={faded ? { opacity: 0.25 } : undefined}
    >
      {name}
    </span>
  );
};

const Separator = () => (
  <span aria-hidden="true" className="skills__sep">
    {' · '}
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
      <SectionHeader title="Skills" />
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
                  <Skill name={name} slot={slot} faded={dragging && preview.slot === slot} bounce={dragging && preview.slot !== slot} />
                </Fragment>
              ));
              return (
                <li key={cat.name} data-skill-row={row} className="skills__row">
                  <SkillLabel name={cat.name} onReroll={handleReroll} />
                  <div className="skills__items">
                    <span>{skills}</span>
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
