import Sketch from 'noya-file-format';

export interface FillInputFieldProps {
  id?: string;
  value?: Sketch.Color | Sketch.Gradient | Sketch.Pattern;
  flex?: number;
}

export interface FillPreviewBackgroundProps {
  value?: Sketch.Color | Sketch.Gradient | Sketch.Pattern;
}
