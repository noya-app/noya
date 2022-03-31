import React, { memo } from 'react';

import Sketch from 'noya-file-format';

interface Props {
  id: string;
  pattern: Sketch.Pattern;
  onChangeImage: (image: Sketch.FileRef | Sketch.DataRef) => void;
  onChangeFillType: (amount: Sketch.PatternFillType) => void;
  onChangeTileScale: (amount: number) => void;
  createImage: (image: ArrayBuffer, _ref: string) => void;
}

export type PatternFillType = 'Stretch' | 'Fill' | 'Fit' | 'Tile';

export const PATTERN_FILL_TYPE_OPTIONS: PatternFillType[] = [
  'Tile',
  'Fill',
  'Stretch',
  'Fit',
];

interface PatternPreviewProps {
  pattern: Sketch.Pattern;
  onAddImage: (image: ArrayBuffer, _ref: string) => void;
  onChangeImage: (image: Sketch.FileRef | Sketch.DataRef) => void;
}

export default memo(function PatternInspector(props: Props) {
  return null;
});
