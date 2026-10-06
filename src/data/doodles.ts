/**
 * Pencil sketches that pop up above the About phrases. Every stroke is drawn
 * twice: a main line, then a faint offset ghost 80ms later, like a pencil
 * going over it again.
 */
export type DoodleStroke = {
  d: string;
  delay: number;
  stroke?: string;
};

export type Doodle = {
  phrase: string;
  /** Delay of this phrase's underline intro animation. */
  underlineDelay: string;
  strokes: DoodleStroke[];
  /** Dotted trail that fades in instead of drawing (mountains only). */
  trail?: string;
  caption: string[];
};

const PURPLE = '#5A49D6';

export const DOODLES: Doodle[] = [
  {
    phrase: 'boring work',
    underlineDelay: '0.0s',
    strokes: [
      { d: 'M70 16 C88 15 96 30 94 42 C92 58 80 68 66 67 C50 66 42 52 44 40 C46 26 56 17 73 18', delay: 0.15 },
      { d: 'M55 37 Q60 35.5 65 37.5 M75 37.5 Q80 35.5 85 37', delay: 0.4 },
      { d: 'M59 41 l1.5 .5 M79 41 l1.5 .5', delay: 0.5 },
      { d: 'M61 55 Q70 53 79 56', delay: 0.55 },
      { d: 'M100 30 h6 l-6 7 h6 M109 18 h4.5 l-4.5 5.5 h4.5', delay: 0.65 },
    ],
    caption: ['me, before automation'],
  },
  {
    phrase: 'existentialist literature',
    underlineDelay: '0.3s',
    strokes: [
      { d: 'M14 78 Q60 62 124 24', delay: 0.15 },
      { d: 'M77.8 25.5 C85.8 23.5 91.8 29.5 90.8 36.5 C89.8 44.5 81.8 47.5 75.8 45.5 C68.8 43.5 66.8 35.5 69.8 30.5 C71.8 26.5 75.8 25.5 79.8 26.5', delay: 0.35 },
      { d: 'M58 38.5 C59.5 36.5 62.5 36.5 63 39 C63 41.5 60 42.5 58.5 41', delay: 0.5 },
      { d: 'M62 43.5 L55 52.5 M60 46 L69 42.5 M55 52.5 L48 63.5 M55 52.5 L58 59', delay: 0.6 },
    ],
    caption: ['one must imagine', 'him happy'],
  },
  {
    phrase: 'running until my knees give up',
    underlineDelay: '0.6s',
    strokes: [
      { d: 'M18 76 C50 74 92 77 124 75', delay: 0.15 },
      { d: 'M77 22 C80 20 84 22 83.5 25.5 C83 29 78 29.5 76.5 27 C75.5 25 76 23 78 22', delay: 0.3 },
      { d: 'M78 30 L73 49 M77 34 L67 39 L64 46 M77 34 L86 40 L91 36 M73 49 L82 58 L80 74 M73 49 L66 61 L58 63', delay: 0.45 },
      { d: 'M86 54 l4 -2 M86 59 l4 1 M61 54 l-4 -3', delay: 0.65 },
      { d: 'M34 34 H48 M30 44 H46 M36 54 H48', delay: 0.7 },
    ],
    caption: ['km 3. knees: no.'],
  },
  {
    phrase: 'getting lost in mountains',
    underlineDelay: '0.9s',
    strokes: [
      { d: 'M14 76 L44 34 L58 52 L82 20 L112 64 L118 56 L128 76', delay: 0.15 },
      { d: 'M75 30 L79 34 L83 29 L87 33', delay: 0.4 },
      { d: 'M99 41 L107 49 M107 41 L99 49', delay: 0.65, stroke: PURPLE },
    ],
    trail: 'M24 74 C34 62 46 70 50 60 C55 48 40 46 44 58 C48 70 70 70 72 58 C74 48 84 46 90 54 C96 62 104 58 103 50',
    caption: ['you are here', '(probably)'],
  },
];
