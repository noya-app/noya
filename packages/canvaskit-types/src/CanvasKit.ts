import type { Brand } from 'noya-utils';
import type { IImageFilter } from './IImageFilter';
import type { ICanvasKit } from './ICanvasKit';
import type { IParagraph } from './IParagraph';
import type { IShader } from './IShader';
import type { IPaint } from './IPaint';
import type { IImage } from './IImage';
import type {
  ITypeface,
  IMaskFilter,
  IPathEffect,
  IShapedLine,
  EmbindObject,
  IColorFilter,
} from './misc';
import type { IRuntimeEffect } from './IRuntimeEffect';
import type { IPath } from './IPath';

export type Color = Brand<unknown, 'color'>;
export type Rect = Brand<unknown, 'rect'>;
export type Point = Brand<unknown, 'point'>;
export type ColorArray = Array<Color>;
export type Matrix = Brand<unknown, 'matrix'>;
export type InputMatrix = Brand<unknown, 'inputmatrix'>;
export type Surface = Brand<EmbindObject, 'surface'>;

export type Image = IImage<Matrix>;
export type ColorFilter = IColorFilter;
export type ImageFilter = IImageFilter;
export type MaskFilter = IMaskFilter;
export type Paragraph = IParagraph;
export type Shader = IShader;
export type Path = IPath<Rect>;
export type Paint = IPaint<Color>;
export type Typeface = ITypeface;
export type PathEffect = IPathEffect;
export type RuntimeEffect = IRuntimeEffect<Matrix>;
export type ShapedLine = IShapedLine;

export type CanvasKit = ICanvasKit<
  Color,
  Rect,
  Point,
  ColorArray,
  Matrix,
  InputMatrix,
  Surface
>;
