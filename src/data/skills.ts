export type SkillCategory = {
  name: string;
  skills: string[];
  /** Core row: highlighted skills plus a handwritten "daily drivers" note. */
  core?: boolean;
};

export const SKILLS: SkillCategory[] = [
  { name: 'Core', skills: ['React', 'Typescript', 'Next.js'], core: true },
  { name: 'State & Data', skills: ['TanStack Query', 'Zustand'] },
  { name: 'UI & Styling', skills: ['TailwindCSS', 'MUI', 'Shadcn'] },
  { name: 'Tooling', skills: ['Turborepo', 'Custom Webpack Loader', 'JSCodeShift', 'NPM Packages', 'Claude Code'] },
  { name: 'Testing', skills: ['Vitest', 'Playwright'] },
  { name: 'Infra & CI', skills: ['Docker', 'Kubernetes', 'Gitlab CI'] },
  { name: 'Real-time & 3D', skills: ['WebRTC', 'Three.js'] },
];
