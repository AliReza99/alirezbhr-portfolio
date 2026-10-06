import { prefersReducedMotion, pickIndex } from '../../lib/motion';
import { BACKTRACK, HESITATE, SCENARIOS, helloFor, knockHelloFor, knockLinesFor, throwLinesFor, type Line } from './basement-scenarios';
import { createSvg, randomSeed, roughSvg, roundCaps, type RoughOptions } from '../../lib/rough';

/** Share of lines that show typing dots before the text. */
const TYPED_CHANCE = 0.4;

const MEMORY_KEY = 'basement-voice';

type Memory = { loads: number; last: number; throws: number; knocks: number };
let memory: Memory | undefined;

/** Counts this page load once, and remembers which scenario played last, across refreshes. */
const recall = (): Memory => {
  if (memory) return memory;
  memory = { loads: 0, last: -1, throws: 0, knocks: 0 };
  try {
    Object.assign(memory, JSON.parse(localStorage.getItem(MEMORY_KEY) ?? '{}'));
  } catch {
    // Storage blocked or corrupt: he just forgets you.
  }
  memory.loads++;
  return memory;
};

/** How many times the last two drafts had been tossed before this page load. */
export const timesThrown = (): number => recall().throws;

/** First-ever knockers take four clicks to get in; anyone who has knocked before takes three. */
export const knocksToOpen = (): number => (recall().knocks === 0 ? 4 : 3);

/** What comes up through the floor on each knock; the first-ever knocker gets the original lines. */
export const knockLines = (): string[] => knockLinesFor(recall().knocks, pickIndex);

const remember = () => {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch {
    // Same.
  }
};

const MUTTER = [
  '*sigh*',
  '…v4. what was I thinking.',
  'who keeps all these…',
  'I should label these better.',
  'is it Friday yet?',
  'one more version. then I stop.',
  'hmm.',
  HESITATE,
  'I hear the ladder creaking. not me.',
];

const BOX_LINES = [
  'don’t open that one.',
  'v{v}? we don’t talk about v{v}.',
  'put it down. gently.',
  'that one bites.',
  'v{v} had a carousel. with autoplay.',
  'hey, that’s taped for a reason.',
  'v{v}… I cried during that one.',
];

type VoiceHost = {
  container: () => HTMLElement | null;
  isOpen: () => boolean;
  isDark: () => boolean;
};

type Bubble = HTMLDivElement & { gone?: boolean; timer?: number };

/**
 * The invisible person in the basement. Talks in hand-drawn speech bubbles from
 * the right edge: reacts to what the visitor does, works through a short
 * script when left alone, then mutters forever. Gets visibly more tired.
 */
export class BasementVoice {
  private timers: number[] = [];
  private idleTimer?: number;
  private pumpTimer?: number;
  private queue: string[] = [];
  private speaking = false;
  private visits = 0;
  private script: Line[] = SCENARIOS[0];
  private scriptIndex = 0;
  private spoken = 0;
  private boxClicks = 0;
  private lastMutter?: number;
  private lastBox?: number;
  private dots?: Bubble;
  private dotsTimer?: number;
  private cooldowns: Record<string, number> = {};
  /** Has the "not me in the corner" line been used (or made moot by the cat leaving). */
  darkLineUsed = false;

  constructor(private host: VoiceHost) {}

  /** Schedules work that is cancelled when the visitor leaves. */
  later(fn: () => void, ms: number) {
    this.timers.push(window.setTimeout(fn, ms));
  }

  clear() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    clearTimeout(this.idleTimer);
    clearTimeout(this.pumpTimer);
    this.hideDots();
    this.queue = [];
    this.speaking = false;
  }

  /** `knocked`: the visitor got in by pestering the ladder, and he gave up. */
  start(catAlreadyUp: boolean, knocked = false) {
    this.clear();
    this.visits++;
    this.scriptIndex = 0;
    this.spoken = 0;
    this.boxClicks = 0;
    this.darkLineUsed = catAlreadyUp;
    const mem = recall();
    mem.last = mem.last < 0 ? 0 : pickIndex(SCENARIOS.length, mem.last);
    this.script = SCENARIOS[mem.last];
    if (knocked) mem.knocks++;
    remember();
    const hello = knocked ? knockHelloFor(mem.knocks - 1, pickIndex) : this.visits > 1 ? ['you again?', 'I just finished sweeping.'] : helloFor(mem.loads, pickIndex);
    this.later(() => this.say(hello), 2000);
  }

  /** Lines around tossing the last two drafts onto the pile. He remembers doing it before. */
  throwLines(): [Line, Line] {
    const mem = recall();
    const lines = throwLinesFor(mem.throws++, pickIndex);
    remember();
    return lines;
  }

  say(lines: Line, interrupt = false) {
    if (!this.host.isOpen()) return;
    if (interrupt) {
      this.queue = [];
      clearTimeout(this.pumpTimer);
      this.hideDots();
      this.speaking = false;
    }
    this.queue = this.queue.concat(lines);
    this.pump();
  }

  /** Interrupting reaction, rate-limited per `key`. */
  react(key: string, lines: Line, cooldown = 4000) {
    const t = performance.now();
    if (this.cooldowns[key] && t - this.cooldowns[key] < cooldown) return;
    this.cooldowns[key] = t;
    this.say(lines, true);
  }

  boxClicked(v: number) {
    this.boxClicks++;
    if (this.boxClicks === 6) return this.react('box6', ['are you looking for something?'], 0);
    const n = pickIndex(BOX_LINES.length, this.lastBox);
    this.lastBox = n;
    this.react('box', [BOX_LINES[n].replace(/\{v\}/g, String(v))], 1200);
  }

  private pump() {
    if (this.speaking || !this.queue.length) return;
    const text = this.queue.shift()!;
    this.speaking = true;
    const silent = text === HESITATE;
    // Most lines just arrive. Only some are typed first.
    if (!silent && Math.random() >= TYPED_CHANCE) return this.speak(text, false);
    // A short reply after long typing is funnier than a long one after short typing.
    const typeMs = silent ? 1800 : text.length <= 8 ? 1100 : Math.min(1400, 300 + text.length * 25);
    const flake = !silent && text.length > 12 && Math.random() < 0.15;
    this.typeThen(typeMs, () => {
      if (silent) return this.speak(BACKTRACK[pickIndex(BACKTRACK.length)], true);
      if (!flake) return this.speak(text, true);
      // Starts typing, stops, thinks about it, starts again.
      this.pumpTimer = window.setTimeout(() => this.typeThen(500, () => this.speak(text, true)), 600);
    });
  }

  private typeThen(ms: number, then: () => void) {
    this.showDots();
    this.pumpTimer = window.setTimeout(() => {
      this.hideDots();
      then();
    }, ms);
  }

  private speak(text: string, typed: boolean) {
    this.bubble(text, typed);
    this.resetIdle();
    this.pumpTimer = window.setTimeout(() => this.next(), 1600 + text.length * 70);
  }

  private next() {
    this.speaking = false;
    this.pump();
  }

  private showDots() {
    const box = this.host.container();
    if (!box) return;
    this.hideDots();
    const tired = this.tiredness();
    // Same padding and line height as a one-line text bubble, so the swap doesn't change the bubble's height.
    const h = (26 - tired) * 1.1;
    const b: Bubble = document.createElement('div');
    b.style.cssText = `position:relative;isolation:isolate;box-sizing:border-box;padding:10px 18px 12px;margin-right:${(Math.random() * 18) | 0}px;rotate:${(Math.random() * 2 - 1) * 1.5}deg;pointer-events:none`;
    const row = document.createElement('span');
    row.style.cssText = `position:relative;display:block;width:44px;height:${h}px`;
    const svg = createSvg();
    svg.style.cssText = `position:absolute;left:0;top:0;width:44px;height:${h}px;overflow:visible`;
    row.appendChild(svg);
    b.appendChild(row);
    box.appendChild(b);
    this.drawFrame(b, tired);
    this.dots = b;

    // Three hand-drawn dots. The line is redrawn every beat so it boils like the other doodles,
    // and the dots take turns lifting.
    const rc = roughSvg(svg);
    let step = 0;
    const draw = () => {
      svg.replaceChildren();
      for (let i = 0; i < 3; i++) {
        const up = !prefersReducedMotion() && i === step % 3;
        const dot = rc.circle(7 + i * 15, h / 2 + (up ? -2 : 2), up ? 8 : 6.5, {
          fill: '#3B3A55',
          fillStyle: 'solid',
          stroke: '#3B3A55',
          strokeWidth: 1.2,
          roughness: 1.4,
          seed: randomSeed(),
        });
        dot.style.opacity = up ? '1' : '0.45';
        svg.appendChild(roundCaps(dot));
      }
      step++;
    };
    draw();
    if (!prefersReducedMotion()) this.dotsTimer = window.setInterval(draw, 260);
  }

  private hideDots() {
    clearInterval(this.dotsTimer);
    this.dots?.remove();
    this.dots = undefined;
  }

  /** Every 5 lines he gets more tired: shakier bubbles, smaller handwriting. */
  private tiredness(extra = 0) {
    return Math.min(3, Math.floor((this.spoken + extra) / 5));
  }

  private resetIdle() {
    clearTimeout(this.idleTimer);
    this.idleTimer = window.setTimeout(() => this.idle(), (this.scriptIndex < this.script.length ? 9000 : 20000) + Math.random() * 3000);
  }

  private idle() {
    if (!this.host.isOpen()) return;
    if (this.speaking || this.queue.length) return this.resetIdle();
    if (this.host.isDark() && !this.darkLineUsed) {
      this.darkLineUsed = true;
      return this.say('…that’s not me in the corner, by the way.');
    }
    if (this.scriptIndex < this.script.length) return this.say(this.script[this.scriptIndex++]);
    const n = pickIndex(MUTTER.length, this.lastMutter);
    this.lastMutter = n;
    this.say(MUTTER[n]);
  }

  private bubble(text: string, typed: boolean) {
    const box = this.host.container();
    if (!box) return;
    const reduce = prefersReducedMotion();
    const tired = this.tiredness(1);
    this.spoken++;
    const rot = (Math.random() * 2 - 1) * (1.5 + tired * 0.8);
    const b: Bubble = document.createElement('div');
    b.style.cssText = `position:relative;isolation:isolate;max-width:100%;box-sizing:border-box;padding:10px 18px 12px;margin-right:${(Math.random() * 18) | 0}px;rotate:${rot}deg;font-family:Caveat,cursive;font-weight:700;font-size:${26 - tired}px;line-height:1.1;color:#3B3A55;text-wrap:balance;user-select:none;-webkit-user-select:none;pointer-events:auto;cursor:default`;
    const tx = document.createElement('span');
    tx.textContent = text;
    tx.style.cssText = 'position:relative;display:block';
    b.appendChild(tx);
    box.appendChild(b);
    b.addEventListener('click', () => this.react('poke', ['don’t poke the words.'], 9000));

    this.drawFrame(b, tired);

    if (!reduce && b.animate) {
      if (typed) {
        // The dots bubble was just here, so the text takes its place with a small pop, no slide in.
        b.animate([{ transform: 'scale(0.94)', transformOrigin: 'right center' }, { transform: 'none', transformOrigin: 'right center' }], {
          duration: 140,
          easing: 'ease-out',
        });
      } else {
        b.animate([{ opacity: 0, transform: 'translateX(40px) rotate(4deg)' }, { opacity: 1, transform: 'none' }], {
          duration: 420,
          easing: 'cubic-bezier(.3,1.4,.5,1)',
        });
      }
    }
    // At most two bubbles on screen.
    const live = ([...box.children] as Bubble[]).filter((c) => !c.gone);
    while (live.length > 2) this.pop(live.shift()!);
    b.timer = window.setTimeout(() => this.pop(b), 4800 + text.length * 80);
  }

  /** Hand-drawn speech bubble with its tail pointing off-screen to the right. */
  private drawFrame(b: HTMLElement, tired: number) {
    const w = b.offsetWidth;
    const hh = b.offsetHeight;
    const svg = createSvg();
    svg.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${hh}px;overflow:visible;pointer-events:none;z-index:-1`;
    const rc = roughSvg(svg);
    const I = '#3B3A55';
    const C = '#FBF6EF';
    const o = (x: RoughOptions): RoughOptions => ({ roughness: 1.1 + tired * 0.35, bowing: 1.2, seed: randomSeed(), ...x });
    const ty = Math.min(hh - 10, hh * 0.55);
    [
      rc.rectangle(1, 1, w - 2, hh - 2, o({ fill: C, fillStyle: 'solid', stroke: I, strokeWidth: 2 })),
      rc.polygon(
        [
          [w - 6, ty - 9],
          [w + 24, ty + 6],
          [w - 6, ty + 9],
        ],
        o({ fill: C, fillStyle: 'solid', stroke: 'none', roughness: 0.5 }),
      ),
      rc.line(w - 1, ty - 8, w + 24, ty + 6, o({ stroke: I, strokeWidth: 2 })),
      rc.line(w + 24, ty + 6, w - 1, ty + 9, o({ stroke: I, strokeWidth: 2 })),
    ].forEach((g) => svg.appendChild(roundCaps(g)));
    b.appendChild(svg);
  }

  private pop(b: Bubble) {
    if (b.gone) return;
    b.gone = true;
    clearTimeout(b.timer);
    if (!b.animate) return b.remove();
    b.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px)' }], {
      duration: 350,
      easing: 'ease-in',
      fill: 'forwards',
    }).onfinish = () => b.remove();
  }
}
