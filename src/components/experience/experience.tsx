import { useRef, useState } from 'react';
import { ROLES } from '../../data/experience';
import { SectionHeader } from '../ui/section-header';
import { useToast } from '../toast/toast-context';
import { ExperienceCard } from './experience-card';
import './experience.css';

export const Experience = () => {
  const { showToast } = useToast();
  const opens = useRef(0);
  // Phones start with every card collapsed so the section stays a short list of roles.
  const [startCollapsed] = useState(() => matchMedia('(max-width: 600px)').matches);

  // Easter egg: the 4th expand of any card gets a teasing toast, once per visit.
  const handleOpen = () => {
    opens.current++;
    if (opens.current === 4) setTimeout(() => showToast('exp'), 1250);
  };

  return (
    <section id="work" data-screen-label="Experience" className="section">
      <SectionHeader title="Experience" />
      <div className="experience__list">
        {ROLES.map((role, i) => (
          <ExperienceCard key={`${role.company}-${i}`} role={role} index={i} defaultOpen={i === 0 && !startCollapsed} onOpen={handleOpen} />
        ))}
      </div>
    </section>
  );
};
