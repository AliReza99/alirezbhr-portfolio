import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { useSketch } from '../../hooks/use-sketch';
import { canAnimate, prefersReducedMotion } from '../../lib/motion';
import { useBasement } from './basement-context';
import { CAT_LEFT } from './basement-scenarios';
import { BasementVoice, catTalk, knockLines, knocksToOpen, type CatPoke } from './basement-voice';
import { DRAFT_ROWS, DraftBox, THROWN_DRAFTS } from './draft-box';
import { EscapingCat } from './escaping-cat';
import { Lamp } from './lamp';
import { SleepingCat } from './sleeping-cat';
import { Spider } from './spider';
import { throwBox } from './throw-box';
import { useBasementTease } from './use-basement-tease';
import { useLadderLure } from './use-ladder-lure';
import './basement.css';

/** How long each line of a cat chat stays up before the next one; the fade in `knock-says` ends just before. */
const CAT_TURN_MS = 2100;

/**
 * Easter egg below the footer. The page pushes back when you reach the end, and
 * a ladder pokes up through the floor; knocking on it enough drops you into a
 * basement full of abandoned portfolio drafts,
 * a light you can pull, an invisible tired voice and a cat that wants out.
 */
export const Basement = () => {
  const { catUp, setCatUp } = useBasement();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [catGone, setCatGone] = useState(false);
  /** How far along the strip from her first spot the cat sleeps, once poking has moved her. */
  const [catX, setCatX] = useState(0);
  const [escape, setEscape] = useState<{ from: number } | null>(null);
  const [says, setSays] = useState<{ key: number; line: string; cat: boolean; faint: boolean } | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const tipsRef = useRef<HTMLDivElement>(null);
  const tipsSketchRef = useRef<HTMLSpanElement>(null);
  const knockBtnRef = useRef<HTMLButtonElement>(null);
  const upBtnRef = useRef<HTMLButtonElement>(null);
  const knockAnim = useRef<Animation | undefined>(undefined);
  const glowRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const ladderRef = useRef<HTMLSpanElement>(null);
  const signRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const darkOverlayRef = useRef<HTMLDivElement>(null);
  const lampRef = useRef<HTMLDivElement>(null);
  const talkRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<HTMLSpanElement>(null);

  useSketch(tipsSketchRef, 'ladink');
  useSketch(wallRef, 'wall');
  useSketch(ladderRef, 'ladder');
  useSketch(signRef, 'sign');
  useSketch(floorRef, 'floor');

  // Mutable mirror of state for timers and listeners, plus in-flight flags.
  const live = useRef({ open, dark, catUp, talking: !!says, busy: false, catGoing: false, catRunning: false, catGone: false, flips: 0, lastFlip: 0, discos: 0, deepSaid: false });
  live.current.open = open;
  live.current.dark = dark;
  live.current.catUp = catUp;
  live.current.talking = !!says;
  const timers = useRef<number[]>([]);
  const catTimer = useRef<number | undefined>(undefined);
  const darkTimer = useRef<number | undefined>(undefined);
  const upTimer = useRef<number | undefined>(undefined);
  const knockTimer = useRef<number | undefined>(undefined);
  const catTimers = useRef<number[]>([]);
  const sayKey = useRef(0);
  const knockSet = useRef<string[]>([]);
  const knockShown = useRef(0);
  const leaveWarned = useRef(false);

  const voiceRef = useRef<BasementVoice | null>(null);
  voiceRef.current ??= new BasementVoice({
    container: () => talkRef.current,
    isOpen: () => live.current.open,
    isDark: () => live.current.dark,
  });
  const voice = voiceRef.current;

  useEffect(
    () => () => {
      voice.clear();
      timers.current.forEach(clearTimeout);
      clearTimeout(catTimer.current);
      clearTimeout(darkTimer.current);
      clearTimeout(upTimer.current);
      clearTimeout(knockTimer.current);
      catTimers.current.forEach(clearTimeout);
    },
    [voice],
  );

  /** One line on the floor strip: his by the ladder, the cat's over her head. `faint` is him overheard, not talking to them. */
  const show = (line: string, cat = false, faint = false) => setSays({ key: ++sayKey.current, line, cat, faint });

  const lure = useLadderLure({
    ladderRef: tipsRef,
    isQuiet: () => !live.current.open && !live.current.busy && !live.current.talking && !knockBtnRef.current?.matches(':hover'),
    onWhisper: (line) => {
      show(line, false, true);
      clearTimeout(knockTimer.current);
      knockTimer.current = window.setTimeout(() => setSays(null), 2600);
    },
  });

  const hushCat = () => {
    catTimers.current.forEach(clearTimeout);
    catTimers.current = [];
  };

  const markCatGone = (gone: boolean) => {
    live.current.catGone = gone;
    setCatGone(gone);
  };

  const lightsFlicker = () => {
    const ov = darkOverlayRef.current;
    const lamp = lampRef.current;
    if (prefersReducedMotion() || !ov?.animate) return;
    ov.animate(
      [
        { opacity: 1 },
        { opacity: 1, offset: 0.3 },
        { opacity: 0.3, offset: 0.34 },
        { opacity: 1, offset: 0.4 },
        { opacity: 0.1, offset: 0.55 },
        { opacity: 0.85, offset: 0.6 },
        { opacity: 0, offset: 0.74 },
        { opacity: 0 },
      ],
      { duration: 1900 },
    );
    lamp?.animate([{ transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }], {
      duration: 2400,
      iterations: Infinity,
      direction: 'alternate',
      easing: 'ease-in-out',
    });
  };

  const throwLastDrafts = () => {
    const [before, after] = voice.throwLines();
    // Not always the same box first, and never quite the same rhythm.
    const order = Math.random() < 0.35 ? [...THROWN_DRAFTS].reverse() : THROWN_DRAFTS;
    voice.later(() => {
      voice.say(before);
      // The boxes wait for him to finish announcing them, however long the hello before it ran.
      voice.after(() => {
        let at = 0;
        order.forEach((v) => {
          timers.current.push(
            window.setTimeout(() => {
              const box = sectionRef.current?.querySelector<HTMLElement>(`[data-bv="${v}"]`);
              if (box) throwBox(box);
            }, at),
          );
          at += 500 + Math.random() * 400;
        });
        voice.later(() => voice.say(after), 2200);
      });
    }, 5000);
  };

  const openBasement = (knocked = false, lastWordSaid = false) => {
    if (live.current.open || live.current.busy) return;
    lure.stop();
    hushCat();
    const owed = knocked && !lastWordSaid ? knockSet.current[knockSet.current.length - 1] : undefined;
    if (owed && knockShown.current < knockSet.current.length) {
      // The opening click has a line of its own: let it show, then drop them in.
      live.current.busy = true;
      show(owed);
      clearTimeout(knockTimer.current);
      knockTimer.current = window.setTimeout(() => {
        live.current.busy = false;
        openBasement(true, true);
      }, 1800);
      return;
    }
    live.current.busy = true;
    const tips = tipsRef.current;
    const reduce = prefersReducedMotion();
    // The ladder may still be hiding from the last knock.
    knockAnim.current?.cancel();
    clearTimeout(knockTimer.current);

    const go = () => {
      const hadFocus = document.activeElement === knockBtnRef.current;
      flushSync(() => {
        setOpen(true);
        setDark(false);
        setSays(null);
      });
      // The knock button is gone now; keep keyboard visitors on the ladder.
      if (hadFocus) upBtnRef.current?.focus({ preventScroll: true });
      tips?.getAnimations().forEach((a) => a.cancel());
      if (tips) tips.style.transform = '';
      if (!reduce)
        THROWN_DRAFTS.forEach((v) => {
          const box = sectionRef.current?.querySelector<HTMLElement>(`[data-bv="${v}"]`);
          if (box) box.style.visibility = 'hidden';
        });
      requestAnimationFrame(() => {
        const sec = sectionRef.current;
        if (sec) scrollTo({ top: sec.getBoundingClientRect().top + scrollY, behavior: reduce ? 'instant' : 'smooth' });
        lightsFlicker();
        markCatGone(live.current.catUp);
        voice.start(live.current.catUp, knocked);
        knockSet.current = [];
        knockShown.current = 0;
        if (!reduce) throwLastDrafts();
        timers.current.push(window.setTimeout(() => (live.current.busy = false), 1400));
      });
    };

    if (tips?.animate && !reduce) {
      tips.animate([{ transform: tips.style.transform || 'none' }, { transform: 'translateY(-44px)' }, { transform: 'translateY(0)' }], {
        duration: 420,
        easing: 'cubic-bezier(.3,1.2,.5,1)',
        fill: 'forwards',
      });
      timers.current.push(window.setTimeout(go, 380));
    } else go();
  };

  /** The ladder was clicked and nobody is letting them in yet. */
  const knockBack = (n: number) => {
    lure.stop();
    if (!knockSet.current.length) knockSet.current = knockLines();
    knockShown.current = n;
    const lines = knockSet.current;
    const last = n >= lines.length;
    hushCat();
    show(lines[Math.min(n, lines.length) - 1]);
    clearTimeout(knockTimer.current);
    knockTimer.current = window.setTimeout(() => setSays(null), 2600);
    const tips = tipsRef.current;
    if (!canAnimate(tips)) return;
    knockAnim.current?.cancel();
    // `rotate` and `translate`, so the lift the tease keeps in `transform` survives.
    knockAnim.current = last
      ? // Yanked down out of sight, then it creeps back up.
        tips.animate([{ translate: '0 90px', offset: 0.1 }, { translate: '0 90px', offset: 0.72, easing: 'cubic-bezier(.3,1.2,.5,1)' }], { duration: 2600 })
      : tips.animate(
          [0, -1, 1.2, -0.8, 0.5, 0].map((k) => ({ rotate: `${k * n * 1.6}deg` })),
          { duration: 300 + n * 120, easing: 'ease-out' },
        );
  };

  const knockLadder = useBasementTease({
    wrapRef,
    ladderRef: tipsRef,
    glowRef,
    hintRef,
    isOpen: () => live.current.open,
    isBusy: () => live.current.busy,
    knocksToOpen,
    onOpen: openBasement,
    onKnock: knockBack,
    onDeep: () => {
      if (live.current.deepSaid) return;
      live.current.deepSaid = true;
      voice.react('deep', ['there’s no sub-basement.', 'stop scrolling. please.'], 0);
    },
    onStir: () => lure.hush(),
  });

  /** Poking the sleeping cat gets him talking through the floor, and her answering. Down in the basement he says it in person. */
  const pokeCat = (poke: CatPoke) => {
    if (live.current.busy) return;
    if (live.current.open) return poke === 'leave' ? voice.react('catleft', CAT_LEFT, 0) : voice.catPoked();
    // The second and third poke only get an eye from her: the chat already going carries on.
    if (poke === 'peek' && catTimers.current.length) return;
    clearTimeout(knockTimer.current);
    hushCat();
    const talk = catTalk(poke);
    talk.forEach(([who, line], i) => catTimers.current.push(window.setTimeout(() => show(line, who === 'cat'), i * CAT_TURN_MS)));
    catTimers.current.push(
      window.setTimeout(
        () => {
          catTimers.current = [];
          setSays(null);
        },
        (talk.length - 1) * CAT_TURN_MS + 2600,
      ),
    );
  };

  const goUpstairs = () => {
    // First click: he objects. Clicking again leaves.
    if (!leaveWarned.current) {
      leaveWarned.current = true;
      voice.say(['wait, already?', 'I was about to get to the good part.'], true);
      return;
    }
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const done = () => {
      removeEventListener('scrollend', done);
      clearTimeout(upTimer.current);
      live.current.deepSaid = false;
      leaveWarned.current = false;
      // Leaving right after arriving cancels the timer that would have cleared this.
      live.current.busy = false;
      voice.clear();
      clearTimeout(catTimer.current);
      catTimer.current = undefined;
      setOpen(false);
      setDark(false);
      markCatGone(live.current.catUp);
    };
    addEventListener('scrollend', done);
    upTimer.current = window.setTimeout(done, 2500);
    scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** The cat is out of the basement and asleep on the floor strip. */
  const catArrives = () => {
    live.current.catGoing = false;
    live.current.catRunning = false;
    setEscape(null);
    voice.darkLineUsed = true;
    markCatGone(true);
    setCatUp(true);
    voice.later(() => voice.say(['…was that a cat?', 'we don’t have a cat.']), 900);
  };

  /** In the dark, the cat's eyes look around, slide along the floor and out the left side of the room. She turns up on top, coming in from the same side. */
  const catLeaves = () => {
    if (live.current.catGone || live.current.catGoing) return;
    live.current.catGoing = true;
    voice.darkLineUsed = true;
    const el = eyesRef.current;
    const gone = catArrives;
    const sec = sectionRef.current;
    if (!el?.animate || prefersReducedMotion() || !sec) return gone();
    const er = el.getBoundingClientRect();
    const dx = sec.getBoundingClientRect().left - 24 - er.right;
    const walk = Math.min(1800, 500 + Math.abs(dx) * 3);
    const T = walk + 250;
    el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)', offset: 0.3 }, { transform: 'translateX(4px)', offset: 0.7 }, { transform: 'translateX(0)' }], {
      duration: 900,
      easing: 'ease-in-out',
    }).onfinish = () => {
      if (!live.current.open) return;
      if (!live.current.dark) {
        el.style.opacity = '0';
        return gone();
      }
      el.animate(
        [
          { transform: 'translateX(0)', opacity: 1, easing: 'cubic-bezier(.4,0,.6,1)' },
          { transform: `translateX(${dx}px)`, opacity: 1, offset: walk / T },
          { transform: `translateX(${dx}px)`, opacity: 0 },
        ],
        { duration: T, fill: 'forwards' },
      ).onfinish = gone;
    };
  };

  const toggleLight = (e: MouseEvent<HTMLButtonElement>) => {
    const lamp = e.currentTarget.parentElement;
    if (lamp?.animate && !prefersReducedMotion())
      lamp.animate([{ translate: '0 0' }, { translate: '0 10px' }, { translate: '0 0' }], { duration: 260, easing: 'cubic-bezier(.3,1.6,.5,1)' });
    const nowDark = !live.current.dark;
    flushSync(() => setDark(nowDark));
    // Off and on twice in a row is a disco. A pause between pulls starts the count over.
    // He only says so twice; after that he gives up.
    const now = performance.now();
    live.current.flips = now - live.current.lastFlip < 3000 ? live.current.flips + 1 : 1;
    live.current.lastFlip = now;
    if (live.current.flips % 4 === 0 && live.current.discos < 2) {
      live.current.discos++;
      return voice.react('disco', ['it’s not a disco.'], 0);
    }
    if (nowDark) {
      // Once the lights go out the cat starts to leave. If they come back on first, she shows up asleep on top at once.
      if (!live.current.catGone && catTimer.current === undefined)
        catTimer.current = window.setTimeout(() => {
          catTimer.current = undefined;
          if (live.current.open) catLeaves();
        }, 2200);
      voice.react('dark', ['hey!', 'turn the lights back on.'], 2500);
      clearTimeout(darkTimer.current);
      darkTimer.current = window.setTimeout(() => {
        if (live.current.dark && live.current.open) voice.say('…I can’t see my boxes.');
      }, 6000);
    } else {
      // Lights back on before she is out: she is caught where her eyes were, and bolts off the left side.
      if (!live.current.catGone && !live.current.catRunning && (live.current.catGoing || catTimer.current !== undefined)) {
        clearTimeout(catTimer.current);
        catTimer.current = undefined;
        const eyes = eyesRef.current;
        const sec = sectionRef.current?.getBoundingClientRect();
        // Measured before the slide is cancelled, which would snap her eyes back to the pile.
        const er = eyes?.getBoundingClientRect();
        if (eyes) {
          eyes.style.opacity = '0';
          eyes.getAnimations().forEach((a) => {
            a.onfinish = null;
            a.cancel();
          });
        }
        if (!er || !sec || prefersReducedMotion()) catArrives();
        else {
          live.current.catGoing = true;
          live.current.catRunning = true;
          setEscape({ from: er.left + er.width / 2 - sec.left });
          return voice.react('lit', ['thank you.', '…wait.'], 0);
        }
      }
      voice.react('lit', ['thank you.'], 2500);
    }
  };

  return (
    <>
      <div className="basement-strip" style={{ '--cat-x': `${catX}px` }}>
        {!open && <button ref={knockBtnRef} type="button" onClick={knockLadder} aria-label="Basement ladder" className="basement-strip__knock" />}
        <div aria-hidden="true" className="basement-strip__clip">
          <div ref={tipsRef} data-blad="" className="basement-strip__ladder">
            <span ref={tipsSketchRef} className="fill" />
          </div>
        </div>
        <span aria-live="polite" className="basement-strip__says">
          {says && !says.cat && (
            <span key={says.key} aria-hidden={says.faint || undefined} className={says.faint ? 'basement-strip__whisper' : undefined}>
              {says.line}
            </span>
          )}
        </span>
        <span aria-live="polite" className="basement-strip__says basement-strip__says--cat">
          {says?.cat && <span key={says.key}>{says.line}</span>}
        </span>
        {catUp && <SleepingCat basementOpen={open} rest={catX} onRest={setCatX} onPoke={pokeCat} />}
      </div>
      <div ref={wrapRef} aria-hidden={!open} inert={!open} className="basement-wrap" style={{ height: open ? 'auto' : undefined }}>
        <section ref={sectionRef} data-screen-label="Basement" aria-label="The basement" className="basement">
          <div ref={wallRef} aria-hidden="true" className="fill" />
          <Spider open={open} dark={dark} holdStill={() => !!talkRef.current?.childElementCount} />
          <span ref={glowRef} data-bglow="" aria-hidden="true" className="basement__glow" />
          <span aria-hidden="true" className="basement__shade" />
          {!open && <span ref={hintRef} aria-hidden="true" className="basement__pull-hint" />}
          <button
            ref={upBtnRef}
            type="button"
            onClick={goUpstairs}
            onMouseEnter={() => voice.react('ladder', ['leaving already?'], 12000)}
            aria-label="Back upstairs"
            className="basement__ladder-btn"
          >
            <span ref={ladderRef} className="basement__ladder" />
            <span className="basement__ladder-label" style={{ visibility: open ? 'visible' : 'hidden' }}>
              back upstairs ↑
            </span>
          </button>
          <div className="basement__room">
            <div className="basement__sign-row">
              <div ref={signRef} className="basement__sign">
                <span className="basement__sign-title">STAFF ONLY</span>
                <span className="basement__sign-sub">B1 · DRAFTS &amp; REGRETS</span>
              </div>
            </div>
            <div className="basement__pile-wrap">
              <div className="basement__pile">
                {DRAFT_ROWS.map((row) => (
                  <div key={row[0].v} className="basement__row">
                    {row.map((d) => (
                      <DraftBox key={d.v} draft={d} onOpen={(v) => voice.boxClicked(v)} />
                    ))}
                  </div>
                ))}
              </div>
              <span ref={eyesRef} aria-hidden="true" className="basement__eyes" style={{ opacity: dark && !catGone && !escape ? 1 : 0 }}>
                <span data-beye="" />
                <span data-beye="" />
              </span>
            </div>
          </div>
          {escape && <EscapingCat {...escape} dark={dark} onOut={catArrives} />}
          <div ref={floorRef} aria-hidden="true" className="basement__floor" />
          <div
            ref={darkOverlayRef}
            aria-hidden="true"
            className={dark ? 'basement__dark basement__dark--hatch' : 'basement__dark'}
            style={{ opacity: dark ? 1 : open ? 0 : 0.45 }}
          />
          <span aria-hidden="true" className="basement__daylight" style={{ opacity: dark ? 1 : 0 }} />
          <Lamp ref={lampRef} dark={dark} visible={open} onToggle={toggleLight} />
          <div className="basement__talk-rail">
            <div ref={talkRef} aria-live="polite" className="basement__talk" />
          </div>
        </section>
      </div>
    </>
  );
};
