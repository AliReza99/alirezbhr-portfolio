import { About } from '../components/about/about';
import { Basement } from '../components/basement/basement';
import { Contact } from '../components/contact/contact';
import { Education } from '../components/education/education';
import { Experience } from '../components/experience/experience';
import { Hero } from '../components/hero/hero';
import { Projects } from '../components/projects/projects';
import { Skills } from '../components/skills/skills';
import { useTvStatic } from '../hooks/use-tv-static';
import './home-page.css';

export const HomePage = () => {
  useTvStatic();

  return (
    <>
      <main className="home">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Basement />
    </>
  );
};
