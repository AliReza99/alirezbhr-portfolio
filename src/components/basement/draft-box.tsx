import { useRef } from 'react';
import { useSketch } from '../../hooks/use-sketch';

export type Draft = {
  v: number;
  note: string;
};

const DRAFT_NOTES: Record<number, string> = {
  1: 'just an <h1>',
  2: 'dark mode phase',
  3: 'parallax on everything',
  4: '14 gradients',
  5: 'Comic Sans, ironically',
  6: 'mobile, half done',
  7: 'lost in a merge',
  8: 'too many toasts',
  9: 'so close',
};

/** Pile of abandoned portfolio drafts, v1 at the bottom left to v9 on top. */
export const DRAFT_ROWS: Draft[][] = (() => {
  let vi = 9;
  return [2, 3, 4].map((n) => {
    vi -= n;
    const start = vi;
    return Array.from({ length: n }, (_, k) => ({ v: start + k + 1, note: DRAFT_NOTES[start + k + 1] ?? '' }));
  });
})();

/** The two boxes that get tossed in a few seconds after the visitor arrives. */
export const THROWN_DRAFTS = [9, 8] as const;

type DraftBoxProps = {
  draft: Draft;
  onOpen: (v: number) => void;
};

export const DraftBox = ({ draft, onOpen }: DraftBoxProps) => {
  const boxRef = useRef<HTMLSpanElement>(null);
  const paperRef = useRef<HTMLSpanElement>(null);
  useSketch(boxRef, 'box', { boil: true });
  useSketch(paperRef, 'paper', { boil: true });
  const { v, note } = draft;

  return (
    <button
      type="button"
      data-bv={v}
      onClick={() => onOpen(v)}
      aria-label={`Draft v${v}`}
      title={note}
      className="draft"
      style={{ rotate: `${(((v * 37) % 11) - 5) * 0.7}deg`, translate: `${((v * 53) % 7) - 3}px 0` }}
    >
      <span ref={boxRef} className="draft__box">
        <span ref={paperRef} className="draft__label">
          v{v}
        </span>
        <span className="draft__note">{note}</span>
      </span>
    </button>
  );
};
