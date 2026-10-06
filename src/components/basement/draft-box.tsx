import { useRef } from 'react';
import { useSketch } from '../../hooks/use-sketch';
import { timesThrown } from './basement-voice';

export type Draft = {
  v: number;
  note: string;
  /** How crooked it sits, in degrees. */
  tilt: number;
  /** Sideways slip off its spot, in px. */
  shift: number;
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

/** The two boxes that get tossed in a few seconds after the visitor arrives. */
export const THROWN_DRAFTS = [9, 8] as const;

/** How sloppy the stack is, 0 to 1. He restacks the top two every visit and cares a little less each time. */
const MESS = Math.min(timesThrown(), 5) / 5;

const spread = (range: number) => (Math.random() * 2 - 1) * range;

/**
 * Pile of abandoned portfolio drafts, v1 at the bottom left to v9 on top.
 * Stacked a little differently on every page load; the tossed ones land worst.
 */
export const DRAFT_ROWS: Draft[][] = (() => {
  let vi = 9;
  return [2, 3, 4].map((n) => {
    vi -= n;
    const start = vi;
    return Array.from({ length: n }, (_, k) => {
      const v = start + k + 1;
      const thrown = (THROWN_DRAFTS as readonly number[]).includes(v);
      return { v, note: DRAFT_NOTES[v] ?? '', tilt: spread((thrown ? 4 : 2) + MESS * 4), shift: spread(2 + MESS * 5) };
    });
  });
})();

type DraftBoxProps = {
  draft: Draft;
  onOpen: (v: number) => void;
};

export const DraftBox = ({ draft, onOpen }: DraftBoxProps) => {
  const boxRef = useRef<HTMLSpanElement>(null);
  const paperRef = useRef<HTMLSpanElement>(null);
  useSketch(boxRef, 'box', { boil: true });
  useSketch(paperRef, 'paper', { boil: true });
  const { v, note, tilt, shift } = draft;

  return (
    <button
      type="button"
      data-bv={v}
      onClick={() => onOpen(v)}
      aria-label={`Draft v${v}`}
      title={note}
      className="draft"
      style={{ rotate: `${tilt.toFixed(2)}deg`, translate: `${shift.toFixed(1)}px 0` }}
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
