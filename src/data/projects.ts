export type Project = {
  title: string;
  description: string;
  stack: string;
  href: string;
  image: string;
  imageAlt: string;
  sketch: string;
};

export const PROJECTS: Project[] = [
  {
    title: 'Notewise',
    description: 'Your personal library for books, notes, highlights and scanned pages.',
    stack: 'React · Hono · Typescript · Claude Code · Claude Design · PNPM · TailwindCSS',
    href: 'https://alirezbhr.site/blog/notewise',
    image: 'https://alirezbhr.site/assets/notewise-og.jpeg',
    imageAlt: 'Notewise',
    sketch: '/assets/notewise-sketch.png',
  },
  {
    title: 'Scaling a frontend platform to 18 apps',
    description:
      'Four years. One codebase. A platform that kept growing faster than the tools that managed it - and what I built to keep up.',
    stack: 'React · Next.js · Typescript · Turborepo · PNPM · TailwindCSS',
    href: 'https://alirezbhr.site/blog/a-frontend-architecture',
    image: 'https://alirezbhr.site/assets/hub-showcase7.jpg',
    imageAlt: 'Scaling a frontend platform to 18 apps',
    sketch: '/assets/hub-sketch.png',
  },
];
