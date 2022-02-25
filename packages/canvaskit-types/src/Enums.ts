export type EnumEntity = number | { readonly value: number };

export interface IAffinity {
  Upstream: EnumEntity;
  Downstream: EnumEntity;
}

export interface IAlphaType {
  Opaque: EnumEntity;
  Premul: EnumEntity;
  Unpremul: EnumEntity;
}

export interface IBlendMode {
  Clear: EnumEntity;
  Src: EnumEntity;
  Dst: EnumEntity;
  SrcOver: EnumEntity;
  DstOver: EnumEntity;
  SrcIn: EnumEntity;
  DstIn: EnumEntity;
  SrcOut: EnumEntity;
  DstOut: EnumEntity;
  SrcATop: EnumEntity;
  DstATop: EnumEntity;
  Xor: EnumEntity;
  Plus: EnumEntity;
  Modulate: EnumEntity;
  Screen: EnumEntity;
  Overlay: EnumEntity;
  Darken: EnumEntity;
  Lighten: EnumEntity;
  ColorDodge: EnumEntity;
  ColorBurn: EnumEntity;
  HardLight: EnumEntity;
  SoftLight: EnumEntity;
  Difference: EnumEntity;
  Exclusion: EnumEntity;
  Multiply: EnumEntity;
  Hue: EnumEntity;
  Saturation: EnumEntity;
  Color: EnumEntity;
  Luminosity: EnumEntity;
}

export interface IBlurStyle {
  Normal: EnumEntity;
  Solid: EnumEntity;
  Outer: EnumEntity;
  Inner: EnumEntity;
}

export interface IClipOp {
  Difference: EnumEntity;
  Intersect: EnumEntity;
}

export interface IColorSpace {
  SRGB: EnumEntity;
  DISPLAY_P3: EnumEntity;
  ADOBE_RGB: EnumEntity;
}

export interface IColorType {
  Alpha_8: EnumEntity;
  RGB_565: EnumEntity;
  RGBA_8888: EnumEntity;
  BGRA_8888: EnumEntity;
  RGBA_1010102: EnumEntity;
  RGB_101010x: EnumEntity;
  Gray_8: EnumEntity;
  RGBA_F16: EnumEntity;
  RGBA_F32: EnumEntity;
}

export interface IDecorationStyle {
  Solid: EnumEntity;
  Double: EnumEntity;
  Dotted: EnumEntity;
  Dashed: EnumEntity;
  Wavy: EnumEntity;
}

export interface IFillType {
  Winding: EnumEntity;
  EvenOdd: EnumEntity;
}

export interface IFilterMode {
  Linear: EnumEntity;
  Nearest: EnumEntity;
}

export interface IFontEdging {
  Alias: EnumEntity;
  AntiAlias: EnumEntity;
  SubpixelAntiAlias: EnumEntity;
}

export interface IFontHinting {
  None: EnumEntity;
  Slight: EnumEntity;
  Normal: EnumEntity;
  Full: EnumEntity;
}

export interface IFontSlant {
  Upright: EnumEntity;
  Italic: EnumEntity;
  Oblique: EnumEntity;
}

export interface IFontWeight {
  Invisible: EnumEntity;
  Thin: EnumEntity;
  ExtraLight: EnumEntity;
  Light: EnumEntity;
  Normal: EnumEntity;
  Medium: EnumEntity;
  SemiBold: EnumEntity;
  Bold: EnumEntity;
  ExtraBold: EnumEntity;
  Black: EnumEntity;
  ExtraBlack: EnumEntity;
}

export interface IFontWidth {
  UltraCondensed: EnumEntity;
  ExtraCondensed: EnumEntity;
  Condensed: EnumEntity;
  SemiCondensed: EnumEntity;
  Normal: EnumEntity;
  SemiExpanded: EnumEntity;
  Expanded: EnumEntity;
  ExtraExpanded: EnumEntity;
  UltraExpanded: EnumEntity;
}

export interface IGlyphRunFlagValues {
  IsWhiteSpace: number;
}

export interface IImageFormat {
  PNG: EnumEntity;
  JPEG: EnumEntity;
  WEBP: EnumEntity;
}

export interface IMipmapMode {
  None: EnumEntity;
  Nearest: EnumEntity;
  Linear: EnumEntity;
}

export interface IPaintStyle {
  Fill: EnumEntity;
  Stroke: EnumEntity;
}

export interface IPathOp {
  Difference: EnumEntity;
  Intersect: EnumEntity;
  Union: EnumEntity;
  XOR: EnumEntity;
  ReverseDifference: EnumEntity;
}

export interface IPlaceholderAlignment {
  Baseline: EnumEntity;
  AboveBaseline: EnumEntity;
  BelowBaseline: EnumEntity;
  Top: EnumEntity;
  Bottom: EnumEntity;
  Middle: EnumEntity;
}

export interface IPointMode {
  Points: EnumEntity;
  Lines: EnumEntity;
  Polygon: EnumEntity;
}

export interface IRectHeightStyle {
  Tight: EnumEntity;
  Max: EnumEntity;
  IncludeLineSpacingMiddle: EnumEntity;
  IncludeLineSpacingTop: EnumEntity;
  IncludeLineSpacingBottom: EnumEntity;
  Strut: EnumEntity;
}

export interface IRectWidthStyle {
  Tight: EnumEntity;
  Max: EnumEntity;
}

export interface IStrokeCap {
  Butt: EnumEntity;
  Round: EnumEntity;
  Square: EnumEntity;
}

export interface IStrokeJoin {
  Bevel: EnumEntity;
  Miter: EnumEntity;
  Round: EnumEntity;
}

export interface ITextAlign {
  Left: EnumEntity;
  Right: EnumEntity;
  Center: EnumEntity;
  Justify: EnumEntity;
  Start: EnumEntity;
  End: EnumEntity;
}

export interface ITextBaseline {
  Alphabetic: EnumEntity;
  Ideographic: EnumEntity;
}

export interface ITextDirection {
  LTR: EnumEntity;
  RTL: EnumEntity;
}

export interface ITextHeightBehavior {
  All: EnumEntity;
  DisableFirstAscent: EnumEntity;
  DisableLastDescent: EnumEntity;
  DisableAll: EnumEntity;
}

export interface ITileMode {
  Clamp: EnumEntity;
  Decal: EnumEntity;
  Mirror: EnumEntity;
  Repeat: EnumEntity;
}

export interface IVertexMode {
  Triangles: EnumEntity;
  TrianglesStrip: EnumEntity;
  TriangleFan: EnumEntity;
}

export interface IImageFormat {
  PNG: EnumEntity;
  JPEG: EnumEntity;
  WEBP: EnumEntity;
}
