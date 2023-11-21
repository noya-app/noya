import { Theme } from '@noya-design-system/protocol';
import { memoize } from 'noya-utils';

export function svgToDataUri(svg: string) {
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export const placeholderSVG = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
<defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#666666;stop-opacity:0.5" />
        <stop offset="100%" style="stop-color:#cccccc;stop-opacity:0.5" />
    </linearGradient>
</defs>
<rect x="0" y="0" width="100" height="100" fill="url(#gradient)" />
</svg>`;

export const placeholderImage = svgToDataUri(placeholderSVG);

type CreatePatternSVG = (options: {
  width?: number;
  height?: number;
  cellSize?: number;
  shapeSizes?: Array<number>;
  seed?: string | number;
  gap?: number;
  clip?: boolean;
  padding?: number;
  background?: string;
  shapeScaling?: false | true | 'prefer-unscaled';
  shapeBackground?: false | true | Array<string>;
  foreground?: Array<string>;
  shapes?: Array<
    | 'empty'
    | 'triangle'
    | 'square'
    | 'quadrant'
    | 'quadrantInverted'
    | 'circle'
    | 'diamond'
    | 'star'
  >;
  randomize?: { flipX?: boolean; flipY?: boolean };
  overscale?: number;
  precision?: number;
  random?: () => number;
}) => string;

type Mod = {
  createPatternSVG: CreatePatternSVG;
};

const loadModule = (): Mod => {
  try {
    return require('@dabbott/patterns');
  } catch {
    return { createPatternSVG: () => placeholderSVG };
  }
};

export const createPatternSVG = memoize((seed: string): string => {
  const { createPatternSVG } = loadModule();

  let svg = createPatternSVG({
    seed,
    overscale: 1.005,
    cellSize: 250,
    background: 'primary-200',
    shapes: ['triangle', 'quadrant'],
    foreground: ['primary-300', 'primary-400', 'primary-500', 'primary-600'],
  });

  svg = svg.replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');

  return svg;
});

/**
 * Replace any fill="primary-N" with a color from the color scale
 */
export function replaceColorPalette(
  svg: string,
  colors: Theme['colors']['primary'],
): string {
  return svg.replace(
    /primary-(\d+)/g,
    (_, index) => colors[Number(index) as keyof typeof colors],
  );
}

export function randomSeed() {
  return createSeed(Math.floor(Math.random() * 100000).toString());
}

export function createSeed(string: string) {
  return `v1/${string}`;
}
