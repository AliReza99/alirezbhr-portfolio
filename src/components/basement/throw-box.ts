/**
 * An exhausted toss: the box comes in from off the right edge, barely rises,
 * slumps onto the pile with a squash, the pile jolts and a bit of dust puffs out.
 */
export const throwBox = (box: HTMLElement) => {
  const pile = box.parentElement?.parentElement;
  if (!pile || !box.animate) {
    box.style.visibility = '';
    return;
  }
  const br = box.getBoundingClientRect();
  const pr = pile.getBoundingClientRect();
  const dx = innerWidth + br.width - (br.left + br.width / 2);
  const dy = -Math.min(160, br.top + br.height);
  box.style.visibility = '';
  const T = 1500;
  const land = 0.82;

  box.animate([{ transform: `translateX(${dx}px) rotate(75deg)` }, { transform: 'translateX(0px) rotate(0deg)' }], {
    duration: T * land,
    easing: 'cubic-bezier(.3,.55,.5,1)',
    fill: 'backwards',
  });
  box.animate(
    [
      { transform: `translateY(${dy}px)`, easing: 'cubic-bezier(.3,.6,.6,1)' },
      { transform: `translateY(${dy - 18}px)`, offset: 0.16, easing: 'cubic-bezier(.45,0,.9,.6)' },
      { transform: 'translateY(0px)', offset: land, easing: 'ease-out' },
      { transform: 'translateY(-4px)', offset: 0.9, easing: 'ease-in' },
      { transform: 'translateY(0px)' },
    ],
    { duration: T, composite: 'add', fill: 'backwards' },
  );

  setTimeout(() => {
    box.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06,.9)' }, { transform: 'scale(1)' }], {
      duration: 300,
      easing: 'ease-out',
      composite: 'add',
    });
    pile.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(3px)' }, { transform: 'translateY(0)' }], { duration: 220, easing: 'ease-out' });
    const x = br.left - pr.left + br.width / 2;
    const y = br.bottom - pr.top;
    (
      [
        [-1, 200],
        [-1, 235],
        [1, -20],
        [1, -55],
      ] as const
    ).forEach(([side, a], k) => {
      const s = document.createElement('span');
      s.style.cssText = `position:absolute;z-index:3;left:${x + side * br.width * 0.45}px;top:${y}px;width:11px;height:2px;margin-top:-1px;background:#FBF6EF;border-radius:2px;pointer-events:none;transform-origin:0 50%;opacity:0`;
      pile.appendChild(s);
      s.animate(
        [
          { transform: `rotate(${a}deg) translateX(2px) scaleX(0)`, opacity: 1 },
          { transform: `rotate(${a}deg) translateX(8px) scaleX(1)`, opacity: 1, offset: 0.45 },
          { transform: `rotate(${a}deg) translateX(17px) scaleX(.2)`, opacity: 0 },
        ],
        { duration: 400, delay: (k % 2) * 30, easing: 'cubic-bezier(.2,.8,.3,1)' },
      ).onfinish = () => s.remove();
    });
  }, T * land);
};
