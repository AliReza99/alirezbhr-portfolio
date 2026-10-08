import { useEffect, useRef } from 'react';
import { DOODLES } from '../../data/doodles';
import { SectionHeader } from '../ui/section-header';
import { DoodleWord } from './doodle-word';
import './about.css';

const [boring, literature, running, mountains] = DOODLES;

export const About = () => {
  const paraRef = useRef<HTMLParagraphElement>(null);

  // Underlines draw in once, the first time the paragraph is mostly in view.
  useEffect(() => {
    const para = paraRef.current;
    if (!para || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          para.setAttribute('data-seen', '');
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(para);
    return () => io.disconnect();
  }, []);

  return (
    <section id="about" data-screen-label="About" className="section">
      <SectionHeader title="About" />
      <p ref={paraRef} className="about__text">
        I've spent 6 years building enterprise apps and automating myself out of <DoodleWord doodle={boring} />. Scaled small
        applications to super-application, achieved 12x performance improvements, built refactoring tools that save weeks.
        Outside code, I'm either reading <DoodleWord doodle={literature} />, <DoodleWord doodle={running} />, or{' '}
        <DoodleWord doodle={mountains} />.
      </p>
    </section>
  );
};
