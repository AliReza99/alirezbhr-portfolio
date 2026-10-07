import { useEffect, useRef, type RefObject } from 'react';
import { canAnimate } from '../../lib/motion';
import { lureLines, lureNudge, neverBeenDown } from './basement-voice';
import { modalOpen } from './use-basement-tease';

type UseLadderLureOptions = {
  /** Ladder tips poking up from the floor strip. */
  ladderRef: RefObject<HTMLElement | null>;
  /** The basement is shut and nothing else is going on at the ladder. */
  isQuiet: () => boolean;
  /** A line of his leaks up through the floor. */
  onWhisper: (line: string) => void;
};

/** First bump after the ladder comes into view. Someone who has never been down gets it almost at once. */
const FIRST_MS = 2500;
const EAGER_FIRST_MS = 700;
/** Gap between bumps, plus up to JITTER_MS. Longer once he has nothing left to say. */
const GAP_MS = 6000;
const EAGER_GAP_MS = 3500;
const LATE_GAP_MS = 11000;
const JITTER_MS = 3000;
const EAGER_JITTER_MS = 1500;
/** The first bumps of each arrival come at the eager pace, whoever it is. */
const ARRIVAL_BEATS = 3;
/** Each comeback rattles the ladder this much harder, up to MAX_PUSHES of them. */
const PUSH = 0.45;
const MAX_PUSHES = 3;
/** Something else is going on at the ladder: look again this soon. */
const RETRY_MS = 2000;
/** After a push or pull at the end of the page, stay out of the tease's way this long: its hold and its shove back up. */
const HOLD_MS = 2300;
/** Share of the strip that has to be on screen for the ladder to count as seen. */
const IN_VIEW = 0.9;
/** His line comes up just after the bump that caused it. */
const WHISPER_DELAY_MS = 350;

/**
 * Until the visitor has found the basement on this page load, somebody down
 * there keeps walking into the ladder. The tips jump every few seconds while
 * they are on screen, and every other bump gets a word out of him. He runs out
 * of words; the bumping carries on, slower. Knocking or getting in ends it.
 * For someone who has never been down it all comes sooner and closer together,
 * and the very first bump already gets a word.
 *
 * Scrolling away and coming back starts it over, louder: a bump almost at once,
 * harder than the last arrival's, with a line telling them not to touch the
 * ladder, then a few quick bumps before it settles again.
 */
export const useLadderLure = (opts: UseLadderLureOptions) => {
  const latest = useRef(opts);
  latest.current = opts;
  const control = useRef({ hush: () => {}, stop: () => {} });

  useEffect(() => {
    const tips = latest.current.ladderRef.current;
    const strip = tips?.parentElement;
    if (!tips || !strip) return;
    const lines = lureLines();
    const eager = neverBeenDown();
    let timer: number | undefined;
    let sayTimer: number | undefined;
    let bump: Animation | undefined;
    let beats = 0;
    let said = 0;
    let inView = false;
    /** Fully off screen since the last arrival, so the next time in view is a new one. */
    let away = true;
    let arrivals = 0;
    let sinceArrival = 0;
    /** The line this arrival opens with, until it is said. */
    let nudge: string | undefined;
    let lastNudge: string | undefined;
    let stopped = false;

    const plan = (ms: number) => {
      clearTimeout(timer);
      if (!stopped && inView) timer = window.setTimeout(beat, ms);
    };

    const stop = () => {
      stopped = true;
      clearTimeout(timer);
      clearTimeout(sayTimer);
      bump?.cancel();
      io.disconnect();
    };

    const beat = () => {
      if (document.hidden || modalOpen() || !latest.current.isQuiet()) return plan(RETRY_MS);
      if (!canAnimate(tips)) {
        // Nothing moves, so he says one thing per arrival and leaves it at that.
        if (!sinceArrival++) latest.current.onWhisper(nudge ?? lines[lines.length - 1]);
        nudge = undefined;
        return;
      }
      const lean = Math.random() < 0.5 ? -1 : 1;
      const hard = 1 + Math.min(arrivals - 1, MAX_PUSHES) * PUSH;
      // `rotate` and `translate`, so the lift the tease keeps in `transform` survives.
      bump = tips.animate(
        [
          { translate: '0 0', rotate: '0deg' },
          { translate: `0 ${-6 * hard}px`, rotate: `${lean * 1.5 * hard}deg`, offset: 0.18 },
          { translate: `0 ${2 * hard}px`, rotate: `${-lean * hard}deg`, offset: 0.45 },
          { translate: `0 ${-2 * hard}px`, rotate: `${lean * 0.5 * hard}deg`, offset: 0.7 },
          { translate: '0 0', rotate: '0deg' },
        ],
        { duration: 520, easing: 'ease-out' },
      );
      let line = nudge;
      nudge = undefined;
      if (!line && (beats % 2 === 1) !== eager && said < lines.length) line = lines[said++];
      beats++;
      if (line) sayTimer = window.setTimeout(() => inView && latest.current.isQuiet() && latest.current.onWhisper(line), WHISPER_DELAY_MS);
      const quick = eager || ++sinceArrival < ARRIVAL_BEATS;
      const gap = quick ? EAGER_GAP_MS : said >= lines.length ? LATE_GAP_MS : GAP_MS;
      plan(gap + Math.random() * (quick ? EAGER_JITTER_MS : JITTER_MS));
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const was = inView;
        inView = entry.intersectionRatio >= IN_VIEW - 0.01;
        if (!entry.isIntersecting) away = true;
        if (!inView) return clearTimeout(timer);
        if (was) return;
        if (!away) return plan(RETRY_MS);
        away = false;
        sinceArrival = 0;
        if (arrivals++) nudge = lastNudge = lureNudge(arrivals - 2, lastNudge);
        plan(arrivals > 1 || eager ? EAGER_FIRST_MS : FIRST_MS);
      },
      { threshold: [0, IN_VIEW] },
    );
    io.observe(strip);

    control.current.hush = () => plan(HOLD_MS);
    control.current.stop = stop;
    return stop;
  }, []);

  return control.current;
};
