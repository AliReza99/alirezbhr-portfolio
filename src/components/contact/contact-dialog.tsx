import { useEffect, useRef } from 'react';
import { EMAIL, GITHUB_URL, LINKEDIN_URL, TELEGRAM_URL } from '../../data/profile';
import { MorphLabel } from '../ui/morph-label';
import { RoughArrow } from '../ui/rough-arrow';
import { CopyButton } from './copy-button';
import './contact-dialog.css';

const LINKS = [
  { href: LINKEDIN_URL, label: 'LinkedIn' },
  { href: GITHUB_URL, label: 'GitHub' },
  { href: TELEGRAM_URL, label: 'Telegram' },
];

type ContactDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const ContactDialog = ({ open, onClose }: ContactDialogProps) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus moves into the card while it is open and back to the opener after.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('keydown', onKey);
      if (opener instanceof HTMLElement) opener.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="contact-dialog-title" aria-hidden={!open} data-open={open || undefined} className="contact-dialog">
      <div onClick={onClose} aria-hidden="true" className="contact-dialog__backdrop" />
      <div className="contact-dialog__card">
        <span data-ext="" aria-hidden="true" />
        <div className="contact-dialog__face">
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="close-x contact-dialog__close">
            <span />
            <span />
          </button>
          <h2 id="contact-dialog-title" className="contact-dialog__title">
            Get in touch
          </h2>
          <p className="contact-dialog__text">Interested in working together? Drop me a message and I'll get back to you soon.</p>
          <span className="contact-dialog__email-wrap">
            <a href={`mailto:${EMAIL}`} className="contact-dialog__email">
              {EMAIL}
            </a>
            <CopyButton />
          </span>
          <a href={`mailto:${EMAIL}`} className="press-btn contact-dialog__send">
            <span data-wob="" className="btn-shadow press-btn__shadow" />
            <span className="press-btn__face press-btn__face--primary">
              <MorphLabel>Send an email</MorphLabel>
              <RoughArrow dir="e" style={{ width: '1.1em' }} />
            </span>
          </a>
          <div className="contact-dialog__links">
            {LINKS.map(({ href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener" className="contact-dialog__link">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
