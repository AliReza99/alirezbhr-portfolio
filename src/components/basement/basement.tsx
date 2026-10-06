import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { useSketch } from '../../hooks/use-sketch';
import { prefersReducedMotion } from '../../lib/motion';
import { useToast } from '../toast/toast-context';
import { useBasement } from './basement-context';
import { BasementVoice } from './basement-voice';
import { DRAFT_ROWS, DraftBox, THROWN_DRAFTS } from './draft-box';
import { Lamp } from './lamp';
import { SleepingCat } from './sleeping-cat';
import { throwBox } from './throw-box';
import { useBasementTease } from './use-basement-tease';
import './basement.css';

/** How much of the closed basement sits below the footer: just the ladder. */
const PEEK = 120;

/**
 * Easter egg below the footer. The page pushes back when you reach the end;
 * the third try drops you into a basement full of abandoned portfolio drafts,
 * a light you can pull, an invisible tired voice and a cat that wants out.
 */
export const Basement = () => {
  const { showToast } = useToast();
  const { catUp, setCatUp } = useBasement();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [catGone, setCatGone] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const tipsRef = useRef<HTMLDivElement>(null);
  const tipsSketchRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
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
  const live = useRef({ open, dark, catUp, busy: false, catGoing: false, catGone: false, flips: 0, deepSaid: false });
  live.current.open = open;
  live.current.dark = dark;
  live.current.catUp = catUp;
  const timers = useRef<number[]>([]);
  const catTimer = useRef<number | undefined>(undefined);
  const darkTimer = useRef<number | undefined>(undefined);
  const upTimer = useRef<number | undefined>(undefined);

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
    },
    [voice],
  );

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
    voice.later(() => voice.say('hold on… two more.'), 5000);
    voice.later(() => voice.say(['huff.', 'last ones. I swear.']), 8000);
    THROWN_DRAFTS.forEach((v, i) => {
      timers.current.push(
        window.setTimeout(
          () => {
            const box = sectionRef.current?.querySelector<HTMLElement>(`[data-bv="${v}"]`);
            if (box) throwBox(box);
          },
          5800 + i * 700,
        ),
      );
    });
  };

  const openBasement = () => {
    if (live.current.open || live.current.busy) return;
    live.current.busy = true;
    const tips = tipsRef.current;
    const reduce = prefersReducedMotion();

    const go = () => {
      flushSync(() => {
        setOpen(true);
        setDark(false);
      });
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
        voice.start(live.current.catUp);
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

  useBasementTease({
    wrapRef,
    ladderRef: tipsRef,
    glowRef,
    isOpen: () => live.current.open,
    isBusy: () => live.current.busy,
    onOpen: openBasement,
    onDeep: () => {
      if (live.current.deepSaid) return;
      live.current.deepSaid = true;
      voice.react('deep', ['there’s no sub-basement.', 'stop scrolling. please.'], 0);
    },
  });

  const goUpstairs = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const done = () => {
      removeEventListener('scrollend', done);
      clearTimeout(upTimer.current);
      live.current.deepSaid = false;
      voice.clear();
      clearTimeout(catTimer.current);
      setOpen(false);
      setDark(false);
      markCatGone(live.current.catUp);
    };
    addEventListener('scrollend', done);
    upTimer.current = window.setTimeout(done, 2500);
    scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** In the dark, the cat's eyes look around, walk to the ladder and climb out. */
  const catLeaves = () => {
    if (live.current.catGone || live.current.catGoing) return;
    live.current.catGoing = true;
    voice.darkLineUsed = true;
    const el = eyesRef.current;
    const gone = () => {
      live.current.catGoing = false;
      markCatGone(true);
      setCatUp(true);
      voice.later(() => voice.say(['…was that a cat?', 'we don’t have a cat.']), 900);
    };
    const lad = ladderRef.current;
    if (!el?.animate || prefersReducedMotion() || !lad) return gone();
    const er = el.getBoundingClientRect();
    const lr = lad.getBoundingClientRect();
    const dx = lr.left + lr.width / 2 - (er.left + er.width / 2);
    const up = lr.top + 14 - er.top;
    const walk = Math.min(1800, 500 + Math.abs(dx) * 3);
    const climb = Math.min(2200, 600 + Math.abs(up) * 3);
    const T = walk + climb + 400;
    el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)', offset: 0.3 }, { transform: 'translateX(4px)', offset: 0.7 }, { transform: 'translateX(0)' }], {
      duration: 900,
      easing: 'ease-in-out',
    }).onfinish = () => {
      if (!live.current.open) return;
      if (!live.current.dark) {
        el.style.opacity = '0';
        return gone();
      }
      el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }], {
        duration: 260,
        iterations: Math.ceil(T / 260),
        composite: 'add',
      });
      el.animate(
        [
          { transform: 'translate(0,0)', opacity: 1, easing: 'ease-in-out' },
          { transform: `translate(${dx}px,0)`, opacity: 1, offset: walk / T, easing: 'cubic-bezier(.4,0,.6,1)' },
          { transform: `translate(${dx}px,${up}px)`, opacity: 1, offset: (walk + climb) / T },
          { transform: `translate(${dx}px,${up - 14}px)`, opacity: 0 },
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
    live.current.flips++;
    if (live.current.flips === 6) return voice.react('disco', ['it’s not a disco.'], 0);
    if (nowDark) {
      clearTimeout(catTimer.current);
      if (!live.current.catGone)
        catTimer.current = window.setTimeout(() => {
          if (live.current.dark && live.current.open) catLeaves();
        }, 2200);
      voice.react('dark', ['hey!', 'I’m still down here!'], 2500);
      clearTimeout(darkTimer.current);
      darkTimer.current = window.setTimeout(() => {
        if (live.current.dark && live.current.open) voice.say('…I can’t see my boxes.');
      }, 6000);
    } else {
      const eyes = eyesRef.current;
      if (live.current.catGoing && eyes) {
        eyes.style.opacity = '0';
        eyes.getAnimations().forEach((a) => a.finish());
      }
      voice.react('lit', ['thank you.'], 2500);
    }
  };

  return (
    <>
      <div aria-hidden="true" className="basement-strip">
        <div className="basement-strip__clip">
          <div ref={tipsRef} data-blad="" className="basement-strip__ladder">
            <span ref={tipsSketchRef} className="fill" />
          </div>
        </div>
        {catUp && <SleepingCat basementOpen={open} onClick={() => showToast('cat')} />}
      </div>
      <div ref={wrapRef} aria-hidden={!open} inert={!open} className="basement-wrap" style={{ height: open ? 'auto' : PEEK }}>
        <section ref={sectionRef} data-screen-label="Basement" aria-label="The basement" className="basement">
          <div ref={wallRef} aria-hidden="true" className="fill" />
          <span ref={glowRef} data-bglow="" aria-hidden="true" className="basement__glow" />
          <span aria-hidden="true" className="basement__shade" />
          <button
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
            <div className="basement__pile">
              {DRAFT_ROWS.map((row) => (
                <div key={row[0].v} className="basement__row">
                  {row.map((d) => (
                    <DraftBox key={d.v} draft={d} onOpen={(v) => voice.boxClicked(v)} />
                  ))}
                </div>
              ))}
              <span ref={eyesRef} aria-hidden="true" className="basement__eyes" style={{ opacity: dark && !catGone ? 1 : 0 }}>
                <span data-beye="" />
                <span data-beye="" />
              </span>
            </div>
          </div>
          <div ref={floorRef} aria-hidden="true" className="basement__floor" />
          <div ref={darkOverlayRef} aria-hidden="true" className="basement__dark" style={{ opacity: dark ? 1 : open ? 0 : 0.45 }} />
          <Lamp ref={lampRef} dark={dark} visible={open} onToggle={toggleLight} />
          <div className="basement__talk-rail">
            <div ref={talkRef} aria-live="polite" className="basement__talk" />
          </div>
        </section>
      </div>
    </>
  );
};
