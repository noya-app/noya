// Separate file for enums that doesn't yet
// exists on rn-skia to avoid circular deps

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

export enum Affinity {
  Upstream,
  Downstream,
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
