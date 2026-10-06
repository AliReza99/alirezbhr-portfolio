/**
 * The three expand animations, one per experience card. Each one animates the
 * +/- toggle and the panel height together, then calls `done`. `flip` turns
 * the + into a - at the moment of impact.
 */

export type ExpandParts = {
  plus: HTMLElement;
  panel: HTMLElement;
  card: HTMLElement;
  /** The header button; its height is where the + lands. */
  header: HTMLElement;
  done: () => void;
  flip: () => void;
};

const INK = '#3B3A55';

/** Ink lines sprayed out sideways where the falling + hits the card's bottom edge. */
const burst = (card: HTMLElement, x: number, y: number) => {
  (
    [
      [x - 17, 195, 0],
      [x - 17, 232, 30],
      [x + 17, -15, 0],
      [x + 17, -52, 30],
    ] as const
  ).forEach(([px, a, dl]) => {
    const s = document.createElement('span');
    s.style.cssText = `position:absolute;left:${px}px;top:${y}px;width:10px;height:2px;margin-top:-1px;background:${INK};border-radius:2px;pointer-events:none;z-index:3;transform-origin:0 50%;opacity:0`;
    card.appendChild(s);
    s.animate(
      [
        { transform: `rotate(${a}deg) translateX(2px) scaleX(0)`, opacity: 1 },
        { transform: `rotate(${a}deg) translateX(7px) scaleX(1)`, opacity: 1, offset: 0.45 },
        { transform: `rotate(${a}deg) translateX(15px) scaleX(.2)`, opacity: 0 },
      ],
      { duration: 380, delay: dl, easing: 'cubic-bezier(.2,.8,.3,1)' },
    ).onfinish = () => s.remove();
  });
};

/** A ring of short ink dashes radiating out from (cx, cy). */
const ring = (card: HTMLElement, cx: number, cy: number, n: number, r0: number, len: number, delay = 0) => {
  for (let k = 0; k < n; k++) {
    const a = (k * 360) / n + 360 / n / 2 - 90;
    const s = document.createElement('span');
    s.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:${len}px;height:2px;margin-top:-1px;background:${INK};border-radius:2px;pointer-events:none;z-index:3;transform-origin:0 50%;opacity:0`;
    card.appendChild(s);
    s.animate(
      [
        { transform: `rotate(${a}deg) translateX(${r0}px) scaleX(0)`, opacity: 1 },
        { transform: `rotate(${a}deg) translateX(${r0 + 6}px) scaleX(1)`, opacity: 1, offset: 0.4 },
        { transform: `rotate(${a}deg) translateX(${r0 + 16}px) scaleX(.15)`, opacity: 0 },
      ],
      { duration: 420, delay, easing: 'cubic-bezier(.2,.8,.3,1)' },
    ).onfinish = () => s.remove();
  }
};

/** Card 1: the + crouches, drops onto the card's bottom edge, then springs back up as the panel opens. */
export const openFall = ({ plus, panel, card, header, done, flip }: ExpandParts) => {
  plus.style.transformOrigin = '50% 100%';
  plus.style.zIndex = '2';
  const top = plus.offsetTop;
  const ph = plus.offsetHeight;
  const hh = header.offsetHeight;
  const cx = plus.offsetLeft + plus.offsetWidth / 2;
  const d0 = hh - top - ph;
  const hc = panel.offsetHeight;
  // Timings are tuned for a ~75px fall and ~270px panel. Taller cards (small screens)
  // stretch the fall so the landing stays readable, and the panel opens only after it.
  const stretch = (dist: number, base: number) => Math.min(2, Math.max(1, Math.sqrt(dist / base)));
  const t1 = 80;
  const t2 = t1 + 170 * stretch(d0, 75);
  const t3 = t2 + 40;
  const t4 = t3 + 400 * stretch(hc, 270);
  const t5 = t3 + 240;
  const t6 = t5 + 80;
  const t7 = t6 + 80;
  const T = Math.max(t4, t7);
  const o = (ms: number) => ms / T;
  const fallIn = 'cubic-bezier(.55,0,1,.55)';
  const push = 'cubic-bezier(.25,.8,.35,1)';
  const P = (y: number, sx: number, sy: number, offset: number, easing?: string): Keyframe => ({
    transform: `translateY(${y}px) scale(${sx},${sy})`,
    offset,
    ...(easing ? { easing } : {}),
  });

  plus.animate(
    [
      P(0, 1, 1, 0, 'ease-out'),
      P(-6, 1.08, 0.9, o(t1), fallIn),
      P(d0, 0.9, 1.12, o(t2), 'linear'),
      P(d0, 1.22, 0.74, o(t3), 'cubic-bezier(.3,0,.2,1)'),
      P(-10, 0.94, 1.08, o(t5), 'cubic-bezier(.5,0,1,.6)'),
      P(0, 1.1, 0.9, o(t6), 'ease-out'),
      P(0, 1, 1, o(t7)),
      P(0, 1, 1, 1),
    ],
    { duration: T },
  ).onfinish = done;
  panel.animate(
    [
      { height: '0px', offset: 0 },
      { height: '0px', offset: o(t3), easing: push },
      { height: `${hc}px`, offset: o(t4) },
      { height: `${hc}px`, offset: 1 },
    ],
    { duration: T },
  );
  setTimeout(() => {
    burst(card, cx, hh);
    flip();
  }, t2 + 5);
};

/** Card 2: the + lifts like a rubber stamp and slams down, popping the panel open. */
export const openStamp = ({ plus, panel, card, done, flip }: ExpandParts) => {
  const hc = panel.offsetHeight;
  const T = 1000;
  const o = (ms: number) => ms / T;
  const cx = plus.offsetLeft + plus.offsetWidth / 2;
  const cy = plus.offsetTop + plus.offsetHeight / 2;
  plus.style.transformOrigin = '50% 50%';
  const none = '0 0 0 rgba(59,58,85,0)';
  const lifted = '7px 12px 0 rgba(59,58,85,.16)';
  const S = (y: number, s: number, r: number, sh: string, offset: number, easing?: string): Keyframe => ({
    transform: `translateY(${y}px) scale(${s}) rotate(${r}deg)`,
    boxShadow: sh,
    offset,
    ...(easing ? { easing } : {}),
  });

  plus.animate(
    [
      S(0, 1, 0, none, 0, 'cubic-bezier(.2,.8,.3,1)'),
      S(-14, 1.55, -12, lifted, o(320), 'ease-in-out'),
      S(-17, 1.6, -15, lifted, o(440), 'cubic-bezier(.75,0,1,.6)'),
      S(0, 0.84, 0, none, o(520), 'cubic-bezier(.3,1.6,.5,1)'),
      S(0, 1, 0, none, o(700)),
      S(0, 1, 0, none, 1),
    ],
    { duration: T },
  ).onfinish = done;
  panel.animate(
    [
      { height: '0px', offset: 0 },
      { height: '0px', offset: o(520), easing: 'cubic-bezier(.25,1.3,.5,1)' },
      { height: `${hc}px`, offset: o(880) },
      { height: `${hc}px`, offset: 1 },
    ],
    { duration: T },
  );
  setTimeout(() => {
    ring(card, cx, cy, 8, 20, 9);
    flip();
  }, 515);
};

/** Card 3: the + is a crank. Four quarter turns, each ratcheting the panel open a notch. */
export const openCrank = ({ plus, panel, card, done, flip }: ExpandParts) => {
  const hc = panel.offsetHeight;
  const N = 4;
  const step = 210;
  const lead = 170;
  const T = lead + N * step + 120;
  const o = (ms: number) => ms / T;
  const cx = plus.offsetLeft + plus.offsetWidth / 2;
  const cy = plus.offsetTop + plus.offsetHeight / 2;
  plus.style.transformOrigin = '50% 50%';
  const snap = 'cubic-bezier(.3,1.7,.5,1)';
  const pk: Keyframe[] = [
    { transform: 'rotate(0deg)', offset: 0, easing: 'ease-out' },
    { transform: 'rotate(-18deg) scale(.94)', offset: o(lead), easing: snap },
  ];
  const hk: Keyframe[] = [
    { height: '0px', offset: 0 },
    { height: '0px', offset: o(lead), easing: snap },
  ];
  for (let k = 1; k <= N; k++) {
    const t0 = lead + (k - 1) * step;
    const t1 = t0 + 150;
    pk.push({ transform: `rotate(${k * 90}deg) scale(1)`, offset: o(t1), easing: 'linear' });
    hk.push({ height: `${Math.round((hc * k) / N)}px`, offset: o(t1), easing: 'linear' });
    if (k < N) {
      pk.push({ transform: `rotate(${k * 90}deg) scale(1)`, offset: o(t0 + step), easing: snap });
      hk.push({ height: `${Math.round((hc * k) / N)}px`, offset: o(t0 + step), easing: snap });
    }
    setTimeout(() => {
      ring(card, cx, cy, k === N ? 8 : 3, 19, k === N ? 9 : 6);
      if (k === N) flip();
    }, t1 - 40);
  }
  pk.push({ transform: `rotate(${N * 90}deg) scale(1)`, offset: 1 });
  hk.push({ height: `${hc}px`, offset: 1 });
  plus.animate(pk, { duration: T }).onfinish = done;
  panel.animate(hk, { duration: T });
};

export const EXPAND_ANIMATIONS = [openFall, openStamp, openCrank] as const;
