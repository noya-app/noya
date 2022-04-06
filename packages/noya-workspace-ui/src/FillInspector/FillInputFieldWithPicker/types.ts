import type Sketch from 'noya-file-format';

export type ColorFillProps = {
  color?: Sketch.Color;
  onChangeColor: (color: Sketch.Color) => void;
};

export type GradientFillProps = {
  gradient: Sketch.Gradient;
  onChangeGradient: (type: Sketch.Gradient) => void;
  onChangeGradientColor: (color: Sketch.Color, index: number) => void;
  onChangeGradientType: (type: Sketch.GradientType) => void;
  onChangeGradientPosition: (index: number, position: number) => void;
  onAddGradientStop: (color: Sketch.Color, position: number) => void;
  onDeleteGradientStop: (index: number) => void;
  onEditGradient: (stopIndex: number) => void;
};

export type PatternFillProps = {
  pattern: Sketch.Pattern;
  onChangePatternFillType: (value: Sketch.PatternFillType) => void;
  onChangePatternTileScale: (amount: number) => void;
  onChangeFillImage: (value: Sketch.FileRef | Sketch.DataRef) => void;
};

export type ShaderFillProps = {
  shader: Sketch.Shader;
  fillType: Sketch.PatternFillType;
  onChangeFillType: (value: Sketch.PatternFillType) => void;
  onChangeShaderString: (value: string) => void;
  onAddShaderVariable: () => void;
  onDeleteShaderVariable: (name: string) => void;
  onChangeShaderVariableName: (oldName: string, newName: string) => void;
  onChangeShaderVariableValue: (
    name: string,
    value: Sketch.ShaderVariable['value'],
  ) => void;
  onNudgeShaderVariableValue: (name: string, value: number) => void;
};

export interface FillInputProps {
  id?: string;
  flex?: number | string;
  fillType?: Sketch.FillType;
  onChangeType?: (type: Sketch.FillType) => void;
  hasMultipleFills?: boolean;
  colorProps: ColorFillProps;
  gradientProps?: GradientFillProps;
  patternProps?: PatternFillProps;
  shaderProps?: ShaderFillProps;
}

export interface FillOptionSelectProps {
  fillType: Sketch.FillType;
  gradientType: Sketch.GradientType;
  onChangeType?: (type: Sketch.FillType) => void;
  onChangeGradientType?: (type: Sketch.GradientType) => void;
  supportsGradients: boolean;
  supportsPatterns: boolean;
  supportsShaders: boolean;
}

export type FillOption =
  | 'Solid Color'
  | 'Linear Gradient'
  | 'Radial Gradient'
  | 'Angular Gradient'
  | 'Pattern Fill'
  | 'Shader';
