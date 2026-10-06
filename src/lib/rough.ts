import rough from 'roughjs';
import type { RoughSVG } from 'roughjs/bin/svg';
import type { Options } from 'roughjs/bin/core';

export type { RoughSVG, Options as RoughOptions };

export const SVG_NS = 'http://www.w3.org/2000/svg';

export const roughSvg = (svg: SVGSVGElement): RoughSVG => rough.svg(svg);

export const randomSeed = (): number => Math.floor(Math.random() * 1e4) + 1;

/** rough.js draws with butt caps; every sketch in the design uses round ones. */
export const roundCaps = <T extends Element>(node: T): T => {
  node.querySelectorAll('path').forEach((p) => {
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
  });
  return node;
};

export const createSvg = (): SVGSVGElement => {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  return svg;
};

export const createGroup = (): SVGGElement => document.createElementNS(SVG_NS, 'g');
