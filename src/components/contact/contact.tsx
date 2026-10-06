import { EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_URL } from '../../data/profile';
import { RoughArrow } from '../ui/rough-arrow';
import { SectionHeader } from '../ui/section-header';
import { CopyButton } from './copy-button';
import './contact.css';

type LiftLinkProps = {
  href: string;
  label: string;
};

/** Sits flat; on hover the face lifts up-left out of the page and reveals a hatched shadow. */
const LiftLink = ({ href, label }: LiftLinkProps) => (
  <a href={href} target="_blank" rel="noopener" className="lift-link">
    <span data-wob="" className="btn-shadow lift-link__shadow" />
    <span className="lift-link__face">
      <span>{label}</span>
      <RoughArrow dir="ne" still />
    </span>
  </a>
);

export const Contact = () => {
  return (
    <section id="contact" data-screen-label="Contact" className="section">
      <SectionHeader title="Get in Touch" note="say hi!" />
      <div className="contact">
        <p className="contact__lead">Interested in working together? Drop me a message and I'll get back to you soon.</p>
        <div className="contact__email-row">
          <a href={`mailto:${EMAIL}`} className="contact__email">
            {EMAIL}
          </a>
          <CopyButton />
          <span className="contact__pointer">
            <svg aria-hidden="true" width="48" height="22" viewBox="0 0 64 30" style={{ flex: 'none' }}>
              <path d="M62 18 C50 6 28 4 6 14 M6 14 L19 4 M6 14 L21 24" fill="none" stroke="#5A49D6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hand contact__pointer-note">fastest way to reach me</span>
          </span>
        </div>
        <div className="contact__rule" />
        <div className="contact__links">
          <LiftLink href={LINKEDIN_URL} label="LinkedIn" />
          <LiftLink href={GITHUB_URL} label="GitHub" />
          <LiftLink href={RESUME_URL} label="Resume" />
        </div>
      </div>
    </section>
  );
};
