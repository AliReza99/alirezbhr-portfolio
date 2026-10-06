import { PROJECTS } from '../../data/projects';
import { SectionHeader } from '../ui/section-header';
import { ProjectCard } from './project-card';
import './projects.css';

export const Projects = () => (
  <section id="projects" data-screen-label="Selected Work" className="section">
    <SectionHeader title="Selected Work" note="stuff I'm proud of" />
    <div className="projects__grid">
      {PROJECTS.map((p) => (
        <ProjectCard key={p.href} project={p} />
      ))}
    </div>
  </section>
);
