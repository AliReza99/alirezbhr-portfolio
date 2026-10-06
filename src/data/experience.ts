/** Rich text segment: plain string, `{ hl }` for a marker-highlighted phrase, `{ b }` for bold ink. */
export type Segment = string | { hl: string } | { b: string };

export type Role = {
  title: string;
  company: string;
  summary: Segment[];
  bullets: Segment[][];
};

export const ROLES: Role[] = [
  {
    title: 'Senior Frontend Engineer',
    company: 'Delinternet Telecom',
    summary: ['Led frontend architecture for an enterprise ISP platform serving 14,000 active clients.'],
    bullets: [
      ['Architected scalable infrastructure that grew the platform ', { hl: 'from 5 to 18 sub-applications and 300+ pages' }, '.'],
      ['Architected ', { hl: 'multi-backend' }, ' abstraction layer integrating 6 different backend services with different auth and data models.'],
      ['Built npm package for ', { hl: 'translation completeness linting' }, ' and automated translation generation across multiple languages.'],
      ['Re-implemented MUI components in TailwindCSS, achieving up to ', { hl: '12x faster render' }, ' times, reducing bundle size by ', { hl: '20%' }, '.'],
      ['Developed ', { hl: 'JSCodeShift codemods' }, ', reducing large-scale migrations from weeks to seconds.'],
      ['Implemented task management and time tracking system, enabling operations to scale ', { hl: 'from 3 to 18 engineers' }, '.'],
      ['Achieved ', { hl: '30% faster CI builds' }, ' by rewriting build scripts in Deno.js.'],
    ],
  },
  {
    title: 'Frontend Web Developer',
    company: 'Delinternet Telecom',
    summary: [
      'Engineered a large-scale ISP platform, delivering ',
      { b: 'CRM' },
      ', ',
      { b: 'HRMS' },
      ', ',
      { b: 'analytics' },
      ', ',
      { b: 'invoicing' },
      ', ',
      { b: 'payments' },
      ', and ',
      { b: 'admin panels' },
      '.',
    ],
    bullets: [
      ['Reduced ', { hl: 'bundle size by 28%' }, ' by rearchitecting the entire i18n layer.'],
      ['Achieved ', { hl: '3x faster initial load' }, ' by fixing render-blocking bottlenecks found by profiling.'],
      ['Built ', { hl: 'filesystem routing with link prefetching' }, ' inside CRA via ', { hl: 'custom webpack loader' }, ', eliminating per-route boilerplate.'],
      ['Built a ', { hl: 'multi-language' }, ', ', { hl: 'multi-theme' }, ', responsive application with action-level access control.'],
      ['Developed a ', { hl: 'JSON-configurable form and page builder' }, ' with 30+ input types.'],
    ],
  },
  {
    title: 'Frontend Web Developer',
    company: 'TEDxShirazUniversity',
    summary: ['Built the TEDxShirazUniversity web application, building features to support events, registrations, and content delivery.'],
    bullets: [
      ['Developed event pages and a blog section to share TEDx event announcements and articles.'],
      ['Implemented real-time streaming for TEDx events.'],
      ['Built a registration process for attendees.'],
    ],
  },
];
