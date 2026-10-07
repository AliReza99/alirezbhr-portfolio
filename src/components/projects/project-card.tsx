import { useRef, type CSSProperties, type MouseEvent, type SyntheticEvent } from 'react';
import type { Project } from '../../data/projects';
import { useSketchInView } from '../../hooks/use-sketch-in-view';
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

/**
 * On phones the card sketches itself while fully in view, so a tap on it does
 * nothing; the link opens from the "Read more" button alone. Keyboard
 * activation reports no pointer detail and always opens.
 */
const openOnlyFromButton = (e: MouseEvent<HTMLAnchorElement>) => {
  if (e.detail === 0 || !matchMedia('(max-width: 600px)').matches) return;
  if (!(e.target as Element).closest('.project__more')) e.preventDefault();
};

export const ProjectCard = ({ project }: { project: Project }) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const sketched = useSketchInView(cardRef);

  return (
    <a ref={cardRef} href={project.href} target="_blank" rel="noopener" data-pcard="" data-sketch={sketched ? '' : undefined} onClick={openOnlyFromButton} className="project">
      <span data-ext="" aria-hidden="true" />
      <div data-pface="" className="project__face">
        <div ref={imageRef} data-pimg="" className="project__image">
          <img src={project.image} alt={project.imageAlt} onError={hideBrokenImage} draggable={false} className="project__img" />
          <img data-sk="" src={project.sketch} alt="" aria-hidden="true" draggable={false} className="project__img" />
        </div>
        <div className="project__body">
          <h3 className="project__title">
            <HandText handStyle={{ fontSize: 21, lineHeight: 1.1, letterSpacing: 0 }}>{project.title}</HandText>
          </h3>
          <p className="project__desc">
            <HandText delay=".06s" handStyle={{ fontSize: 16, lineHeight: 1.32 }}>
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
      <RoughFrame hostRef={cardRef} active={sketched} imageRef={imageRef} />
    </a>
  );
};
