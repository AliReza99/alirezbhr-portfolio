import { Fragment } from 'react';
import type { Doodle } from '../../data/doodles';

const FRAME = 'M-1 4 C40 1 104 3 142 3 C145 40 143 88 143 123 C100 126 40 124 -2 124 C-4 88 -2 40 -3 6';
const GHOST = { strokeWidth: 1.1, strokeOpacity: 0.45, transform: 'translate(.9 .8)' } as const;
const PURPLE = '#5A49D6';

const Stroke = ({ d, delay, stroke }: { d: string; delay: number; stroke?: string }) => (
  <>
    <path data-ln="" pathLength={1} d={d} stroke={stroke} style={{ '--d': `${delay}s` }} />
    <path data-ln="" pathLength={1} d={d} stroke={stroke} {...GHOST} style={{ '--d': `${Math.round((delay + 0.08) * 100) / 100}s` }} />
  </>
);

/** A dashed-underlined phrase that draws a small pencil doodle above itself on hover or focus. */
export const DoodleWord = ({ doodle }: { doodle: Doodle }) => {
  const twoLines = doodle.caption.length > 1;
  return (
    <span data-doo="" tabIndex={0} className="doodle-word" style={{ '--ud': doodle.underlineDelay }}>
      {doodle.phrase}
      <span data-pop="" aria-hidden="true" className="doodle-word__pop">
        <svg
          viewBox="-10 -4 160 134"
          width="176"
          height="147"
          fill="none"
          stroke="#3B3A55"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <g data-an="" style={{ filter: 'url(#doo-r1)', '--an': 'doo-boil .42s steps(1) infinite' }}>
            <path d={`${FRAME} Z`} fill="#FFFCF7" stroke="none" />
            <Stroke d={FRAME} delay={0} />
            {doodle.strokes.slice(0, doodle.trail ? 2 : undefined).map((s) => (
              <Stroke key={s.d} {...s} />
            ))}
            {doodle.trail && (
              <>
                <path data-fade="" d={doodle.trail} stroke={PURPLE} strokeWidth="2.4" strokeDasharray=".1 5" style={{ '--d': '.45s' }} />
                {doodle.strokes.slice(2).map((s) => (
                  <Stroke key={s.d} {...s} />
                ))}
              </>
            )}
            <text
              x="70"
              y="104"
              textAnchor="middle"
              fill={PURPLE}
              stroke="none"
              data-fade=""
              style={{ '--d': '.7s', fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: '15px' }}
            >
              {twoLines
                ? doodle.caption.map((line, i) => (
                    <tspan key={line} x="70" y={98 + i * 14}>
                      {line}
                    </tspan>
                  ))
                : doodle.caption.map((line) => <Fragment key={line}>{line}</Fragment>)}
            </text>
          </g>
        </svg>
      </span>
    </span>
  );
};
