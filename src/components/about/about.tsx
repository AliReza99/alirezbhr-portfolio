import { ABOUT_PARAGRAPHS } from '../../data/about';
import { SectionHeader } from '../ui/section-header';
import './about.css';

export const About = () => (
  <section id="about" data-screen-label="About" className="section">
    <SectionHeader title="About" />
    <div className="about__body">
      {ABOUT_PARAGRAPHS.map((text) => (
        <p key={text} className="about__text">
          {text}
        </p>
      ))}
    </div>
  </section>
);
