import Sketch from '@sketch-hq/sketch-file-format-ts';

export const SUPPORTED_IMAGE_UPLOAD_TYPES = [
  'image/png' as const,
  'image/jpeg' as const,
  'image/webp' as const,
  'application/pdf' as const,
  'image/svg+xml' as const,
];

export type SupportedImageUploadType = typeof SUPPORTED_IMAGE_UPLOAD_TYPES[number];

export type SketchPattern = {
  // This _class doesn't exist in Sketch, but it's convenient in `switch`
  // statements to be able to reference _class.
  _class: 'pattern';
  image?: Sketch.FileRef | Sketch.DataRef;
  patternFillType: Sketch.PatternFillType;
  patternTileScale: number;
};
