import { BLOG_URL, EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_URL } from '../../data/profile';
import { CopyButton } from './copy-button';
import './contact.css';

const LINKS = [
  { href: BLOG_URL, label: 'Blog', external: false },
  { href: LINKEDIN_URL, label: 'LinkedIn', external: true },
  { href: GITHUB_URL, label: 'GitHub', external: true },
  { href: RESUME_URL, label: 'Resume', external: true },
];

export const Contact = () => {
  return (
    <section id="contact" data-screen-label="Contact" className="section">
      <div className="contact">
        <h2 className="contact__title">
          Interested in
          <br />
          working together?
        </h2>
        <div className="contact__email-row">
          <span className="contact__email-wrap">
            <a href={`mailto:${EMAIL}`} className="contact__email">
              {EMAIL}
            </a>
            <CopyButton />
          </span>
          <span className="contact__pointer">
            <svg aria-hidden="true" width="48" height="22" viewBox="0 0 64 30" className="contact__pointer-arrow">
              <path d="M62 18 C50 6 28 4 6 14 M6 14 L19 4 M6 14 L21 24" fill="none" stroke="#5A49D6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hand contact__pointer-note">fastest way to reach me</span>
          </span>
        </div>
        <div className="contact__foot">
          <div className="contact__links">
            {LINKS.map(({ href, label, external }) => (
              <a key={label} href={href} {...(external && { target: '_blank', rel: 'noopener' })} className="contact__link">
                {label}
              </a>
            ))}
          </div>
          <span className="contact__copyright">© {new Date().getFullYear()} alirezbhr</span>
        </div>
      </div>
    </section>
  );
};
