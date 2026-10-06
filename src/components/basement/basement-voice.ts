import { prefersReducedMotion, pickIndex } from '../../lib/motion';
import { createSvg, randomSeed, roughSvg, roundCaps, type RoughOptions } from '../../lib/rough';

/** A line, or several lines said back to back. */
export type Line = string | string[];

const SCRIPT: Line[] = [
  'how did you even get in here?',
  'where did I put v14…',
  ['these aren’t mine, by the way.', '…okay, they’re mine.'],
  'v9 was a dark time.',
  'I’ve been carrying boxes down here since v1.',
  'my back hurts.',
  'please don’t tell the recruiters about v12.',
  'you’re still here?',
  '…since you’re here, the email is upstairs.',
  'hire me and I’ll stop making versions.',
  ['okay. I’m going upstairs.', 'turn off the light when you leave.'],
];

const MUTTER = [
  '*sigh*',
  '…v26. what was I thinking.',
  'who keeps all these…',
  'I should label these better.',
  'is it Friday yet?',
  'one more version. then I stop.',
  'hmm.',
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
  private scriptIndex = 0;
  private spoken = 0;
  private boxClicks = 0;
  private lastMutter?: number;
  private lastBox?: number;
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
    const hello = knocked ? ['fine.', 'don’t touch anything.'] : this.visits > 1 ? ['you again?', 'I just finished sweeping.'] : ['…huh?', 'oh. someone’s here.'];
    this.later(() => this.say(hello), 2000);
  }

  say(lines: Line, interrupt = false) {
    if (!this.host.isOpen()) return;
    if (interrupt) {
      this.queue = [];
      clearTimeout(this.pumpTimer);
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
    this.bubble(text);
    this.resetIdle();
    this.pumpTimer = window.setTimeout(
      () => {
        this.speaking = false;
        this.pump();
      },
      1600 + text.length * 70,
    );
  }

  private resetIdle() {
    clearTimeout(this.idleTimer);
    this.idleTimer = window.setTimeout(() => this.idle(), (this.scriptIndex < SCRIPT.length ? 9000 : 20000) + Math.random() * 3000);
  }

  private idle() {
    if (!this.host.isOpen()) return;
    if (this.speaking || this.queue.length) return this.resetIdle();
    if (this.host.isDark() && !this.darkLineUsed) {
      this.darkLineUsed = true;
      return this.say('…that’s not me in the corner, by the way.');
    }
    if (this.scriptIndex < SCRIPT.length) return this.say(SCRIPT[this.scriptIndex++]);
    const n = pickIndex(MUTTER.length, this.lastMutter);
    this.lastMutter = n;
    this.say(MUTTER[n]);
  }

  private bubble(text: string) {
    const box = this.host.container();
    if (!box) return;
    const reduce = prefersReducedMotion();
    // Every 5 lines he gets more tired: shakier bubbles, smaller handwriting.
    const tired = Math.min(3, Math.floor(++this.spoken / 5));
    const rot = (Math.random() * 2 - 1) * (1.5 + tired * 0.8);
    const b: Bubble = document.createElement('div');
    b.style.cssText = `position:relative;isolation:isolate;max-width:100%;box-sizing:border-box;padding:10px 18px 12px;margin-right:${(Math.random() * 18) | 0}px;rotate:${rot}deg;font-family:Caveat,cursive;font-weight:700;font-size:${26 - tired}px;line-height:1.1;color:#3B3A55;text-wrap:balance;user-select:none;-webkit-user-select:none;pointer-events:auto;cursor:default`;
    const tx = document.createElement('span');
    tx.textContent = text;
    tx.style.cssText = 'position:relative;display:block';
    b.appendChild(tx);
    box.appendChild(b);
    b.addEventListener('click', () => this.react('poke', ['don’t poke the words.'], 9000));

    // Speech bubble with its tail pointing off-screen to the right.
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

    if (!reduce && b.animate) {
      b.animate([{ opacity: 0, transform: 'translateX(40px) rotate(4deg)' }, { opacity: 1, transform: 'none' }], {
        duration: 420,
        easing: 'cubic-bezier(.3,1.4,.5,1)',
      });
    }
    // At most two bubbles on screen.
    const live = ([...box.children] as Bubble[]).filter((c) => !c.gone);
    while (live.length > 2) this.pop(live.shift()!);
    b.timer = window.setTimeout(() => this.pop(b), 4800 + text.length * 80);
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
