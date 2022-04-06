import type Sketch from 'noya-file-format';

export type PatternFillType = 'Stretch' | 'Fill' | 'Fit' | 'Tile';

export interface PatternInspectorProps {
  id: string;
  pattern: Sketch.Pattern;
  onChangeImage: (image: Sketch.FileRef | Sketch.DataRef) => void;
  onChangeFillType: (amount: Sketch.PatternFillType) => void;
  onChangeTileScale: (amount: number) => void;
  createImage: (image: ArrayBuffer, _ref: string) => void;
}

export interface PatternPreviewProps {
  pattern: Sketch.Pattern;
  onAddImage: (image: ArrayBuffer, _ref: string) => void;
  onChangeImage: (image: Sketch.FileRef | Sketch.DataRef) => void;
}

export const PATTERN_FILL_TYPE_OPTIONS: PatternFillType[] = [
  'Tile',
  'Fill',
  'Stretch',
  'Fit',
];
