import { Theme } from '@noya-design-system/protocol';

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
  createSVG: any;
  schema: any;
};

const loadModule = (): Mod => {
  try {
    return require('@dabbott/patterns');
  } catch {
    return {
      createSVG: () => placeholderSVG,
      createPatternSVG: () => placeholderSVG,
      schema: {},
    };
  }
};

export const createSVG = (data: any, colors?: Theme['colors']): string => {
  const { createSVG } = loadModule();

  if (colors) {
    data = replaceColorPaletteRecursive(data, colors);
  }

  return createSVG(data);
};

export const createPatternSVG = (
  seed: string,
  colors?: Theme['colors'],
): string => {
  const { createPatternSVG } = loadModule();

  let data: Parameters<CreatePatternSVG>[0] = {
    seed,
    overscale: 1.005,
    cellSize: 250,
    background: 'primary-200',
    shapes: ['triangle', 'quadrant'],
    foreground: ['primary-300', 'primary-400', 'primary-500', 'primary-600'],
  };

  if (colors) {
    data = replaceColorPaletteRecursive(data, colors);
  }

  let svg = createPatternSVG(data);

  svg = svg.replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');

  return svg;
};

function replaceColor(svg: string, colors: Theme['colors']): string {
  svg = svg.replace(/primary-(\d+)(?:\/(\d+))?/g, (_, index, opacity) => {
    const color =
      colors.primary[Number(index) as keyof Theme['colors']['primary']];
    const o = opacity ? Number(opacity).toString(16).padStart(2, '0') : '';
    return color + o;
  });

  svg = svg.replace(/neutral-(\d+)(?:\/(\d+))?/g, (_, index, opacity) => {
    const color =
      colors.neutral[Number(index) as keyof Theme['colors']['neutral']];
    const o = opacity ? Number(opacity).toString(16).padStart(2, '0') : '';
    return color + o;
  });

  return svg;
}

export function randomSeed() {
  return createSeed(Math.floor(Math.random() * 100000).toString());
}

export function createSeed(string: string) {
  return `v1/${string}`;
}

export function getSchema() {
  const mod = loadModule();
  return mod.schema;
}

function replaceColorPaletteRecursive<T>(node: T, colors: Theme['colors']): T {
  function inner(value: any): any {
    if (typeof value === 'string') return replaceColor(value, colors);

    if (Array.isArray(value)) return value.map((n) => inner(n));

    if (typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, value]) => [key, inner(value)]),
      );
    }

    return value;
  }

  return inner(node) as T;
}
