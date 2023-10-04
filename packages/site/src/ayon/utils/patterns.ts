import { Theme } from '@noya-design-system/protocol';
import { memoize } from 'noya-utils';

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
    return { createPatternSVG: () => '' };
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
