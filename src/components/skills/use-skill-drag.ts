import { useEffect, useRef, useState, type RefObject } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

export type DragPreview = {
  row: number;
  order: string[];
  /** Slot currently holding the dragged skill (rendered faded). */
  slot: number;
};

type UseSkillDragOptions = {
  listRef: RefObject<HTMLUListElement | null>;
  orders: string[][];
  categories: string[];
  commit: (row: number, order: string[]) => void;
  onReject: (skill: string, category: string) => void;
};

const PX = 12;
const PY = 5;

const moveItem = (list: string[], from: number, to: number) => {
  const next = list.slice();
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
};

/**
 * Mouse-only drag of skills: reorder within a row, or get bounced back with a
 * toast when dropped on another row. Touch is left alone so scrolling works.
 */
export const useSkillDrag = ({ listRef, orders, categories, commit, onReject }: UseSkillDragOptions) => {
  const [preview, setPreview] = useState<DragPreview | null>(null);
  const latest = useRef({ orders, categories, commit, onReject });
  latest.current = { orders, categories, commit, onReject };

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const reduce = prefersReducedMotion();
    let active = false;

    const rowAt = (x: number, y: number) => {
      const hit = document.elementFromPoint(x, y);
      const li = hit?.closest<HTMLLIElement>('li[data-skill-row]');
      return li && list.contains(li) ? li : null;
    };

    const down = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-skill]') : null;
      if (!el || e.button !== 0 || active || (e.pointerType && e.pointerType !== 'mouse')) return;
      e.preventDefault();
      const home = el.closest<HTMLLIElement>('li[data-skill-row]');
      if (!home) return;
      const row = Number(home.dataset.skillRow);
      const orig = latest.current.orders[row];
      const from = Number(el.dataset.slot);
      const r = el.getBoundingClientRect();
      const ox = e.clientX - r.left;
      const oy = e.clientY - r.top;
      const sx = e.clientX;
      const sy = e.clientY;
      let tag: HTMLSpanElement | null = null;
      let over: HTMLLIElement | null = null;
      let cur = from;

      const place = (t: number) => {
        cur = t;
        setPreview({ row, slot: t, order: moveItem(orig, from, t) });
      };

      const nearest = (x: number, y: number) => {
        let best = cur;
        let bd = Infinity;
        home.querySelectorAll<HTMLElement>('[data-skill]').forEach((s, k) => {
          const q = s.getBoundingClientRect();
          const dd = Math.abs(x - (q.left + q.width / 2)) + Math.abs(y - (q.top + q.height / 2)) * 3;
          if (dd < bd) {
            bd = dd;
            best = k;
          }
        });
        return best;
      };

      const mark = (li: HTMLLIElement | null) => {
        if (over === li) return;
        if (over) over.style.background = '';
        over = li && li !== home ? li : null;
        if (over) over.style.background = 'rgba(122,106,232,.08)';
      };

      const move = (ev: PointerEvent) => {
        if (!tag) {
          if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return;
          active = true;
          tag = document.createElement('span');
          tag.textContent = orig[from];
          tag.setAttribute('aria-hidden', 'true');
          tag.style.cssText = `position:fixed;left:0;top:0;z-index:60;pointer-events:none;padding:${PY - 2}px ${PX - 2}px;border:2px solid #3B3A55;background:#FFFCF7;color:#3B3A55;font:600 15px/1.55 Archivo,sans-serif;white-space:nowrap;box-shadow:5px 6px 0 rgba(59,58,85,.18);transition:rotate .25s cubic-bezier(.3,1.6,.5,1);rotate:-5deg`;
          document.body.appendChild(tag);
          document.documentElement.style.cursor = 'grabbing';
          list.classList.add('is-dragging');
          place(from);
        }
        tag.style.transform = `translate(${ev.clientX - ox - PX}px,${ev.clientY - oy - PY}px)`;
        const li = rowAt(ev.clientX, ev.clientY);
        mark(li);
        if (li === home) {
          const t = nearest(ev.clientX, ev.clientY);
          if (t !== cur) place(t);
        } else if (li && cur !== from) place(from);
      };

      const up = (ev: PointerEvent) => {
        removeEventListener('pointermove', move);
        removeEventListener('pointerup', up);
        removeEventListener('pointercancel', up);
        if (!tag) return;
        const ghost = tag;
        const target = ev.type === 'pointerup' ? over : null;
        if (ev.type !== 'pointerup' && cur !== from) place(from);
        mark(null);
        document.documentElement.style.cursor = '';
        list.classList.remove('is-dragging');
        const finalOrder = moveItem(orig, from, cur);
        const finish = () => {
          ghost.remove();
          latest.current.commit(row, finalOrder);
          setPreview(null);
          active = false;
        };
        if (target) {
          if (!reduce)
            target.animate(
              [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-7px) rotate(-.4deg)' },
                { transform: 'translateX(6px) rotate(.3deg)' },
                { transform: 'translateX(-3px)' },
                { transform: 'translateX(0)' },
              ],
              { duration: 380, easing: 'ease-out' },
            );
          latest.current.onReject(orig[from], latest.current.categories[Number(target.dataset.skillRow)]);
        }
        const slot = home.querySelectorAll<HTMLElement>('[data-skill]')[cur];
        if (reduce || !slot || !ghost.animate) return finish();
        const rr = slot.getBoundingClientRect();
        ghost.style.rotate = '0deg';
        ghost.animate([{ transform: ghost.style.transform }, { transform: `translate(${rr.left - PX}px,${rr.top - PY}px)` }], {
          duration: target ? 650 : 360,
          delay: target ? 180 : 0,
          easing: 'cubic-bezier(.3,1.35,.5,1)',
          fill: 'forwards',
        }).onfinish = finish;
      };

      addEventListener('pointermove', move);
      addEventListener('pointerup', up);
      addEventListener('pointercancel', up);
    };

    document.addEventListener('pointerdown', down);
    return () => document.removeEventListener('pointerdown', down);
  }, [listRef]);

  return preview;
};
