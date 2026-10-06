import { useRef, type PointerEvent } from 'react';
import { EMAIL, RESUME_URL } from '../../data/profile';
import { MorphLabel } from '../ui/morph-label';
import { RoughArrow } from '../ui/rough-arrow';
import { useToast } from '../toast/toast-context';
import './hero.css';

const HOVERS_TO_TEASE = 5;

export const Hero = () => {
  const { showToast } = useToast();
  const hovers = useRef(0);

  const onHover = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    hovers.current++;
    if (hovers.current === HOVERS_TO_TEASE) showToast('touch');
  };

  return (
    <section id="top" data-screen-label="Hero" className="hero">
      <div className="hero__intro">
        <span className="hand hero__greeting">Hi, I'm Alireza Bahrani</span>
        <h1 className="hero__title">Frontend engineer who loves building fast, scalable applications.</h1>
      </div>
      <div className="hero__actions">
        <a href={`mailto:${EMAIL}`} className="press-btn" onPointerEnter={onHover}>
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
};
