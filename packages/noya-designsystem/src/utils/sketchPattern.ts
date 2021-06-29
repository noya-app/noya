import Sketch from '@sketch-hq/sketch-file-format-ts';
import { FileMap } from 'noya-sketch-file';

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

export function getPatternBackground(
  images: FileMap,
  image?: Sketch.FileRef | Sketch.DataRef,
) {
  if (!image || !images[image._ref])
    return `'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYAQMAAADaua+7AAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABNJREFUCNdjYOD/TxL+/4GBFAwAvMsj3bQ3H74AAAAASUVORK5CYI=A',`;

  return images[image._ref];
}

export function getPatternSize(
  fillType: Sketch.PatternFillType,
  tileScale: number,
) {
  switch (fillType) {
    case Sketch.PatternFillType.Fit:
      return 'contain';
    case Sketch.PatternFillType.Tile:
      return `${tileScale * 100}%`;
    case Sketch.PatternFillType.Fill:
      return 'cover';
    default:
      return '100% 100%';
  }
}
