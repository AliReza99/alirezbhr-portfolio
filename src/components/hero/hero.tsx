import { EMAIL, RESUME_URL } from '../../data/profile';
import { MorphLabel } from '../ui/morph-label';
import { RoughArrow } from '../ui/rough-arrow';
import './hero.css';

export const Hero = () => (
  <section id="top" data-screen-label="Hero" className="hero">
    <div className="hero__intro">
      <span className="hand hero__greeting">Hi, I'm Alireza Bahrani</span>
      <h1 className="hero__title">Frontend engineer who loves building fast, scalable applications.</h1>
    </div>
    <div className="hero__actions">
      <a href={`mailto:${EMAIL}`} className="press-btn">
        <span data-wob="" className="btn-shadow press-btn__shadow" />
        <span className="press-btn__face press-btn__face--primary">
          <MorphLabel>Get in touch</MorphLabel>
          <RoughArrow dir="e" style={{ width: '1.1em' }} />
        </span>
      </a>
      <a href={RESUME_URL} target="_blank" rel="noopener" className="press-btn">
        <span data-wob="" className="btn-shadow press-btn__shadow" />
        <span className="press-btn__face">
          <MorphLabel>Resume</MorphLabel>
          <RoughArrow dir="ne" />
        </span>
      </a>
    </div>
  </section>
);
