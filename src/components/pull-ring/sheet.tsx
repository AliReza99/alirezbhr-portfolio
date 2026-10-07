import type { CSSProperties, MouseEvent, Ref } from 'react';
import { BLOG_URL, EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_URL } from '../../data/profile';
import './sheet.css';

type Link = {
  name: string;
  note: string;
  href: string;
  external?: boolean;
  home?: boolean;
};

const LINKS: readonly Link[] = [
  { name: 'Home', note: 'top of the page', href: '/', home: true },
  { name: 'Blog', note: 'things I wrote down', href: BLOG_URL },
  { name: 'Resume', note: 'the one-page version', href: RESUME_URL, external: true },
  { name: 'GitHub', note: 'code, mostly', href: GITHUB_URL, external: true },
  { name: 'LinkedIn', note: 'the formal me', href: LINKEDIN_URL, external: true },
  { name: 'Email', note: 'say hi', href: `mailto:${EMAIL}` },
];

type SheetProps = {
  /** The clipped element: the cut is its clip-path. */
  ref: Ref<HTMLDivElement>;
  /** The scissors have left the top stop. */
  active: boolean;
  /** They are all the way down and the links can be used. */
  open: boolean;
  onHome: (e: MouseEvent) => void;
};

/** The page underneath, shown through the cut: the site's links as cards on dot-grid paper. */
export const Sheet = ({ ref, active, open, onHome }: SheetProps) => (
  <div className="pull-ring__sheet" role="dialog" aria-modal="true" aria-label="Site links" aria-hidden={!active} inert={!open} data-open={open || undefined}>
    <div ref={ref} className="pull-ring__page">
      <div className="pull-ring__content">
        <h2 className="hand pull-ring__title">the other side of the page</h2>
        <div className="pull-ring__cards">
          {LINKS.map(({ name, note, href, external, home }, i) => (
            <a
              key={name}
              href={href}
              {...(external && { target: '_blank', rel: 'noopener' })}
              onClick={home ? onHome : undefined}
              className="pull-ring__card"
              style={{ '--i': i } as CSSProperties}
            >
              <span aria-hidden="true" className="btn-shadow pull-ring__card-shadow" />
              <span className="pull-ring__card-face">
                <span className="pull-ring__card-name">{name}</span>
                <span className="hand pull-ring__card-note">{note}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  </div>
);
