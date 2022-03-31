import Sketch from 'noya-file-format';

export interface FillInputFieldProps {
  id?: string;
  value?: Sketch.Color | Sketch.Gradient | Sketch.Pattern;
  flex?: number;
}

export interface PreviewProps {
  value?: Sketch.Color | Sketch.Gradient | Sketch.Pattern;
}

export interface ColorProps {
  color: Sketch.Color;
}

export interface GradientProps {
  gradient: Sketch.Gradient;
}

export interface PatternProps {
  fillType: Sketch.PatternFillType;
  tileScale: number;
  imageRef: Sketch.FileRef | Sketch.DataRef;
}
