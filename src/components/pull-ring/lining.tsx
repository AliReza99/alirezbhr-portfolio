import { useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode, type Ref } from 'react';
import { BLOG_URL, EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_URL } from '../../data/profile';
import { useSketch } from '../../hooks/use-sketch';
import { SpiderBody } from '../basement/spider';
import { LINING } from './lining-sketches';
import { useRoughFrames, type FrameDraw } from './use-rough-frames';
import './lining.css';

/** What turns up in the lining on a given pull. */
export const FINDS = ['coin', 'sock', 'cat', 'spider', 'ticket'] as const;
export type Find = (typeof FINDS)[number];

/** The lining is composed on a board of this size and scaled to fit the window. */
const BOARDS = { wide: [1200, 700], tall: [342, 700] } as const;
/** Room kept clear around the board: the tape at the sides, the slider and ring at the bottom. */
const MARGIN = { side: 26, top: 16, bottom: 132 };

const CARE: [sketch: FrameDraw, text: string][] = [
  [LINING.tub, 'Do not wash. It works on my machine.'],
  [LINING.iron, 'Do not iron. The wobbly lines are on purpose.'],
  [LINING.bleach, 'No bleach. The purple stays.'],
  [LINING.tumble, 'Tumble dry low. Scroll gently.'],
];

const NOTES: Record<Find, string> = {
  coin: 'found a coin. finders keepers.',
  sock: 'so that’s where it went.',
  cat: 'Vega was here first.',
  spider: 'she pays no rent.',
  ticket: 'kept the ticket anyway.',
};

const wear = (n: number) => {
  if (n <= 1) return 'Unzipped once. Still under warranty.';
  if (n < 6) return `Unzipped ${n} times. Handle with care.`;
  if (n < 12) return `Unzipped ${n} times. The teeth are getting loose.`;
  return `Unzipped ${n} times. Warranty void.`;
};

/** A rough.js drawing with content laid over it. */
const Sketch = ({ draw, className, children }: { draw: FrameDraw; className: string; children?: ReactNode }) => {
  const ref = useRef<HTMLSpanElement>(null);
  useRoughFrames(ref, draw);
  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
};

/** The loose end of the thread a label was sewn on with. */
const Tail = () => (
  <svg aria-hidden="true" viewBox="0 0 30 44" className="pull-ring__tail">
    <path d="M4 2 C16 8 -2 19 12 25 S22 34 25 42" />
  </svg>
);

type LabelProps = {
  href: string;
  name: string;
  note?: string;
  kind: string;
  draw: FrameDraw;
  external?: boolean;
  onClick?: (e: MouseEvent) => void;
};

/** A woven label that is a link. Its stitching boils and a corner lifts while it is hovered or focused. */
const Label = ({ href, name, note, kind, draw, external, onClick }: LabelProps) => (
  <a href={href} {...(external && { target: '_blank', rel: 'noopener' })} onClick={onClick} data-patch="" data-boil="" className={`pull-ring__label pull-ring__label--${kind}`}>
    <Sketch draw={draw} className="pull-ring__face">
      <span className="pull-ring__name">{name}</span>{' '}
      {note && <span className="hand pull-ring__note">{note}</span>}
    </Sketch>
    <Tail />
  </a>
);

/** Vega, borrowed from the floor above the basement, asleep in the pocket on top of the mail. */
const PocketCat = () => {
  const ref = useRef<HTMLSpanElement>(null);
  useSketch(ref, 'cat');
  return (
    <span aria-hidden="true" className="pull-ring__cat">
      <span ref={ref} data-catbreathe="" className="pull-ring__cat-body" />
    </span>
  );
};

type LiningProps = {
  ref: Ref<HTMLDivElement>;
  /** The zipper has left the top stop. */
  active: boolean;
  /** It is all the way down and the links can be used. */
  open: boolean;
  /** Pulls so far, this one included. */
  count: number;
  find: Find;
  onHome: (e: MouseEvent) => void;
};

/**
 * The inside of the garment, shown through the unzipped page: the links as sewn-on labels and
 * pocket contents, a care tag, and one lost thing that changes from pull to pull.
 */
export const Lining = ({ ref, active, open, count, find, onHome }: LiningProps) => {
  const [board, setBoard] = useState({ tall: false, scale: 1 });

  useLayoutEffect(() => {
    const fit = () => {
      const w = document.documentElement.clientWidth;
      const h = innerHeight;
      const tall = w < 720 || w < h * 0.85;
      const [bw, bh] = BOARDS[tall ? 'tall' : 'wide'];
      const scale = Math.min((w - MARGIN.side * 2) / bw, (h - MARGIN.top - MARGIN.bottom) / bh, tall ? 1.5 : 1.3);
      setBoard((b) => (b.tall === tall && b.scale === scale ? b : { tall, scale }));
    };
    fit();
    addEventListener('resize', fit);
    return () => removeEventListener('resize', fit);
  }, []);

  return (
    <div className="pull-ring__lining" role="dialog" aria-modal="true" aria-label="Site links" aria-hidden={!active} inert={!open}>
      <div ref={ref} className="pull-ring__cloth">
        <div className="pull-ring__board" data-tall={board.tall || undefined} style={{ '--board-scale': board.scale }}>
          <Label href="/" name="Home" note="top of the page" kind="home" draw={LINING.cream} onClick={onHome} />
          <Label href={BLOG_URL} name="Blog" note="things I wrote down" kind="blog" draw={LINING.lilac} />
          <Label href={GITHUB_URL} name="GitHub" kind="github" draw={LINING.cream} external />
          <Label href={LINKEDIN_URL} name="LinkedIn" kind="linkedin" draw={LINING.cream} external />

          <div data-patch="" data-boil="" className="pull-ring__size">
            <Sketch draw={LINING.size} className="pull-ring__face">
              <span className="pull-ring__size-name">Size 100vw</span>
              <span className="pull-ring__size-note">fits most screens</span>
            </Sketch>
          </div>

          <div data-patch="" data-boil="" className="pull-ring__care">
            <Sketch draw={LINING.care} className="pull-ring__face">
              <span className="pull-ring__care-title">Care instructions</span>
              <ul className="pull-ring__care-list">
                {CARE.map(([draw, text]) => (
                  <li key={text}>
                    <Sketch draw={draw} className="pull-ring__care-symbol" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <span className="pull-ring__care-wear">{wear(count)}</span>
              <span className="pull-ring__care-made">100% hand-drawn. 0% navbar.</span>
            </Sketch>
          </div>

          <div data-patch="" className="pull-ring__pocket">
            <a href={RESUME_URL} target="_blank" rel="noopener" data-boil="" className="pull-ring__slip pull-ring__slip--resume">
              <Sketch draw={LINING.paper} className="pull-ring__face">
                <span className="pull-ring__slip-name">Resume</span>
              </Sketch>
            </a>
            <a href={`mailto:${EMAIL}`} data-boil="" className="pull-ring__slip pull-ring__slip--email">
              <Sketch draw={LINING.envelope} className="pull-ring__face">
                <span className="pull-ring__slip-name">Email</span>
              </Sketch>
            </a>
            {find === 'cat' && <PocketCat />}
            <Sketch draw={LINING.pocket} className="pull-ring__pocket-front">
              <span className="hand pull-ring__pocket-note">inner pocket. receipts and other evidence.</span>
            </Sketch>
          </div>

          <div data-patch="" className="pull-ring__spare">
            <Sketch draw={LINING.bag} className="pull-ring__spare-bag" />
            <span className="hand pull-ring__aside">spare button. it does nothing.</span>
          </div>

          <Sketch draw={LINING.thread} className="pull-ring__thread" />

          {find === 'spider' ? (
            <div aria-hidden="true" className="pull-ring__spider">
              <span className="pull-ring__spider-thread" />
              <SpiderBody className="pull-ring__spider-body" />
              <span className="hand pull-ring__aside">{NOTES.spider}</span>
            </div>
          ) : (
            <div key={find} data-patch="" className={`pull-ring__lost pull-ring__lost--${find}`}>
              {find === 'coin' && <Sketch draw={LINING.coin} className="pull-ring__coin" />}
              {find === 'sock' && <Sketch draw={LINING.sock} className="pull-ring__sock" />}
              {find === 'ticket' && (
                <Sketch draw={LINING.ticket} className="pull-ring__ticket">
                  <span className="pull-ring__ticket-title">Admit one</span>
                  <span className="pull-ring__ticket-text">Portfolio v3, never shipped</span>
                </Sketch>
              )}
              <span className="hand pull-ring__aside">{NOTES[find]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
