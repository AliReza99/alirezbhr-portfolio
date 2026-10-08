/** One labeled line of the About section, kept short so it scans on a phone. */
export type AboutRow = {
  label: string;
  text: string;
};

export const ABOUT_ROWS: AboutRow[] = [
  { label: 'Work', text: 'Six years building enterprise frontends, and automating away the boring parts.' },
  { label: 'Care about', text: 'Fast pages, simple architecture, and tools that save my team time.' },
  { label: 'Off the clock', text: 'Camus, long runs, and getting lost in mountains (usually on purpose).' },
];
