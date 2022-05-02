import * as RNSkia from '@shopify/react-native-skia';

// Primitives
export type Color = number;
export type ColorArray = Color[];
export type Rect = RNSkia.SkRect;
export type Point = RNSkia.SkPoint;
export type Matrix = RNSkia.SkMatrix;
export type InputMatrix = number[];

// Enums
export enum Affinity {
  Upstream,
  Downstream,
}

export enum ColorSpace {
  SRGB,
  DISPLAY_P3,
  ADOBE_RGB,
}

export enum AlphaType {
  Opaque,
  Premul,
  Unpremul,
}

export enum ColorType {
  Alpha_8,
  RGB_565,
  RGBA_8888,
  BGRA_8888,
  RGBA_1010102,
  RGB_101010x,
  Gray_8,
  RGBA_F16,
  RGBA_F32,
}

export enum FontEdging {
  Alias,
  AntiAlias,
  SubpixelAntiAlias,
}

export enum FontHinting {
  None,
  Slight,
  Normal,
  Full,
}

export enum VertexMode {
  Triangles,
  TrianglesStrip,
  TriangleFan,
}

export enum DecorationStyle {
  Solid,
  Double,
  Dotted,
  Dashed,
  Wavy,
}

export enum PlaceholderAlignment {
  Baseline,
  AboveBaseline,
  BelowBaseline,
  Top,
  Bottom,
  Middle,
}

export enum RectHeightStyle {
  Tight,
  Max,
  IncludeLineSpacingMiddle,
  IncludeLineSpacingTop,
  IncludeLineSpacingBottom,
  Strut,
}

export enum RectWidthStyle {
  Tight,
  Max,
}

export enum TextAlign {
  Left,
  Right,
  Center,
  Justify,
  Start,
  End,
}

export enum TextBaseline {
  Alphabetic,
  Ideographic,
}

export enum TextDirection {
  LTR,
  RTL,
}

export enum TextHeightBehavior {
  All,
  DisableFirstAscent,
  DisableLastDescent,
  DisableAll,
}

export enum ImageFormat {
  PNG,
  JPEG,
  WEBP,
}

export interface FontStyle {
  weight?: RNSkia.FontWeight;
  width?: RNSkia.FontWidth;
  slant?: RNSkia.FontSlant;
}

export interface StrutStyle {
  strutEnabled?: boolean;
  fontFamilies?: string[];
  fontStyle?: FontStyle;
  fontSize?: number;
  heightMultiplier?: number;
  halfLeading?: boolean;
  leading?: number;
  forceStrutHeight?: boolean;
}
