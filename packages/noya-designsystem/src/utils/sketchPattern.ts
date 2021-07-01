import Sketch from '@sketch-hq/sketch-file-format-ts';

export const SUPPORTED_FILE_TYPES: { [key: string]: string } = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export type SketchPattern = {
  _class: 'pattern';
  image?: Sketch.FileRef | Sketch.DataRef;
  patternFillType: Sketch.PatternFillType;
  patternTileScale: number;
};
