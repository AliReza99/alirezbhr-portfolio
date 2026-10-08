import { ABOUT_ROWS } from '../../data/about';
import { SectionHeader } from '../ui/section-header';
import './about.css';

export const About = () => (
  <section id="about" data-screen-label="About" className="section">
    <SectionHeader title="About" />
    <dl className="about__rows">
      {ABOUT_ROWS.map((row) => (
        <div key={row.label} className="about__row">
          <dt className="about__label">{row.label}</dt>
          <dd className="about__text">{row.text}</dd>
        </div>
      ))}
    </dl>
  </section>
);
