import { useRef, type CSSProperties, type SyntheticEvent } from 'react';
import type { Project } from '../../data/projects';
import { RoughArrow } from '../ui/rough-arrow';
import { RoughFrame } from './rough-frame';

type HandTextProps = {
  children: string;
  /** Stagger of the wipe into handwriting. */
  delay?: string;
  handStyle: CSSProperties;
};

/** Text that wipes into Kalam handwriting when the card is hovered. */
const HandText = ({ children, delay, handStyle }: HandTextProps) => (
  <span data-tw="" style={delay ? { '--td': delay } : undefined}>
    <span data-ts="">{children}</span>
    <span data-th="" aria-hidden="true" style={handStyle}>
      {children}
    </span>
  </span>
);

const hideBrokenImage = (e: SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = 'none';
};

export const ProjectCard = ({ project }: { project: Project }) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  return (
    <a ref={cardRef} href={project.href} target="_blank" rel="noopener" data-pcard="" className="project">
      <span data-ext="" aria-hidden="true" />
      <div data-pface="" className="project__face">
        <div ref={imageRef} data-pimg="" className="project__image">
          <img src={project.image} alt={project.imageAlt} onError={hideBrokenImage} className="project__img" />
          <img data-sk="" src={project.sketch} alt="" aria-hidden="true" className="project__img" />
        </div>
        <div className="project__body">
          <h3 className="project__title">
            <HandText handStyle={{ fontSize: 25, lineHeight: 1.1, letterSpacing: 0 }}>{project.title}</HandText>
          </h3>
          <p className="project__desc">
            <HandText delay=".06s" handStyle={{ fontSize: 17, lineHeight: 1.32 }}>
              {project.description}
            </HandText>
          </p>
          <span className="project__stack">
            <HandText delay=".12s" handStyle={{ fontSize: 15, lineHeight: 1.24 }}>
              {project.stack}
            </HandText>
          </span>
          <span className="project__more">
            <span data-bsh="" aria-hidden="true" className="btn-shadow" />
            <span className="project__more-face">
              <HandText delay=".16s" handStyle={{ fontSize: 18, lineHeight: 1 }}>
                Read more
              </HandText>
              <RoughArrow dir="e" />
            </span>
          </span>
        </div>
      </div>
      <RoughFrame hostRef={cardRef} imageRef={imageRef} />
    </a>
  );
};
