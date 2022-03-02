type EnumEntity = number | { readonly value: number };

export type IAffinity = EnumEntity;

export interface IAffinityEnumValues {
  Upstream: IAffinity;
  Downstream: IAffinity;
}

export type IAlphaType = EnumEntity;

export interface IAlphaTypeEnumValues {
  Opaque: IAlphaType;
  Premul: IAlphaType;
  Unpremul: IAlphaType;
}

export type IBlendMode = EnumEntity;

export interface IBlendModeEnumValues {
  Clear: IBlendMode;
  Src: IBlendMode;
  Dst: IBlendMode;
  SrcOver: IBlendMode;
  DstOver: IBlendMode;
  SrcIn: IBlendMode;
  DstIn: IBlendMode;
  SrcOut: IBlendMode;
  DstOut: IBlendMode;
  SrcATop: IBlendMode;
  DstATop: IBlendMode;
  Xor: IBlendMode;
  Plus: IBlendMode;
  Modulate: IBlendMode;
  Screen: IBlendMode;
  Overlay: IBlendMode;
  Darken: IBlendMode;
  Lighten: IBlendMode;
  ColorDodge: IBlendMode;
  ColorBurn: IBlendMode;
  HardLight: IBlendMode;
  SoftLight: IBlendMode;
  Difference: EnumEntity;
  Exclusion: IBlendMode;
  Multiply: IBlendMode;
  Hue: IBlendMode;
  Saturation: IBlendMode;
  Color: IBlendMode;
  Luminosity: IBlendMode;
}

export type IBlurStyle = EnumEntity;

export interface IBlurStyleEnumValues {
  Normal: IBlurStyle;
  Solid: IBlurStyle;
  Outer: IBlurStyle;
  Inner: IBlurStyle;
}

export type IClipOp = EnumEntity;

export interface IClipOpEnumValues {
  Difference: IClipOp;
  Intersect: IClipOp;
}

export type IColorSpace = EnumEntity;

export interface IColorSpaceEnumValues {
  SRGB: EnumEntity;
  DISPLAY_P3: EnumEntity;
  ADOBE_RGB: EnumEntity;
}

export type IColorType = EnumEntity;

export interface IColorTypeEnumValues {
  Alpha_8: IColorType;
  RGB_565: IColorType;
  RGBA_8888: IColorType;
  BGRA_8888: IColorType;
  RGBA_1010102: IColorType;
  RGB_101010x: IColorType;
  Gray_8: IColorType;
  RGBA_F16: IColorType;
  RGBA_F32: IColorType;
}

export type IDecorationStyle = EnumEntity;

export interface IDecorationStyleEnumValues {
  Solid: IDecorationStyle;
  Double: IDecorationStyle;
  Dotted: IDecorationStyle;
  Dashed: IDecorationStyle;
  Wavy: IDecorationStyle;
}

export type IFillType = EnumEntity;

export interface IFillTypeEnumValues {
  Winding: IFillType;
  EvenOdd: IFillType;
}

export type IFilterMode = EnumEntity;

export interface IFilterModeEnumValues {
  Linear: IFilterMode;
  Nearest: IFilterMode;
}

export type IFontEdging = EnumEntity;

export interface IFontEdgingEnumValues {
  Alias: IFontEdging;
  AntiAlias: IFontEdging;
  SubpixelAntiAlias: IFontEdging;
}

export type IFontHinting = EnumEntity;

export interface IFontHintingEnumValues {
  None: IFontHinting;
  Slight: IFontHinting;
  Normal: IFontHinting;
  Full: IFontHinting;
}

export type IFontSlant = EnumEntity;

export interface IFontSlantEnumValues {
  Upright: IFontSlant;
  Italic: IFontSlant;
  Oblique: IFontSlant;
}

export type IFontWieght = EnumEntity;

export interface IFontWeightEnumValues {
  Invisible: IFontWieght;
  Thin: IFontWieght;
  ExtraLight: IFontWieght;
  Light: IFontWieght;
  Normal: IFontWieght;
  Medium: IFontWieght;
  SemiBold: IFontWieght;
  Bold: IFontWieght;
  ExtraBold: IFontWieght;
  Black: IFontWieght;
  ExtraBlack: IFontWieght;
}

export type IFontWidth = EnumEntity;

export interface IFontWidthEnumValues {
  UltraCondensed: IFontWidth;
  ExtraCondensed: IFontWidth;
  Condensed: IFontWidth;
  SemiCondensed: IFontWidth;
  Normal: IFontWidth;
  SemiExpanded: IFontWidth;
  Expanded: IFontWidth;
  ExtraExpanded: IFontWidth;
  UltraExpanded: IFontWidth;
}

export interface IGlyphRunFlagValues {
  IsWhiteSpace: number;
}

export type IImageFormat = EnumEntity;

export interface IImageFormatEnumValues {
  PNG: IImageFormat;
  JPEG: IImageFormat;
  WEBP: IImageFormat;
}

export type IMipmapMode = EnumEntity;

export interface IMipmapModeEnumValues {
  None: IMipmapMode;
  Nearest: IMipmapMode;
  Linear: IMipmapMode;
}

export type IPaintStyle = EnumEntity;

export interface IPaintStyleEnumValues {
  Fill: IPaintStyle;
  Stroke: IPaintStyle;
}

export type IPathOp = EnumEntity;

export interface IPathOpEnumValues {
  Difference: IPathOp;
  Intersect: IPathOp;
  Union: IPathOp;
  XOR: IPathOp;
  ReverseDifference: IPathOp;
}

export type IPlaceholderAlignment = EnumEntity;

export interface IPlaceholderAlignmentEnumValues {
  Baseline: IPlaceholderAlignment;
  AboveBaseline: IPlaceholderAlignment;
  BelowBaseline: IPlaceholderAlignment;
  Top: IPlaceholderAlignment;
  Bottom: IPlaceholderAlignment;
  Middle: IPlaceholderAlignment;
}

export type IPointMode = EnumEntity;

export interface IPointModeEnumValues {
  Points: IPointMode;
  Lines: IPointMode;
  Polygon: IPointMode;
}

export type IRectHeightStyle = EnumEntity;

export interface IRectHeightStyleEnumValues {
  Tight: IRectHeightStyle;
  Max: IRectHeightStyle;
  IncludeLineSpacingMiddle: IRectHeightStyle;
  IncludeLineSpacingTop: IRectHeightStyle;
  IncludeLineSpacingBottom: IRectHeightStyle;
  Strut: IRectHeightStyle;
}

export type IRectWidthStyle = EnumEntity;

export interface IRectWidthStyleEnumValues {
  Tight: IRectWidthStyle;
  Max: IRectWidthStyle;
}

export type IStrokeCap = EnumEntity;

export interface IStrokeCapEnumValues {
  Butt: IStrokeCap;
  Round: IStrokeCap;
  Square: IStrokeCap;
}

export type IStrokeJoin = EnumEntity;

export interface IStrokeJoinEnumValues {
  Bevel: IStrokeJoin;
  Miter: IStrokeJoin;
  Round: IStrokeJoin;
}

export type ITextAlign = EnumEntity;

export interface ITextAlignEnumValues {
  Left: ITextAlign;
  Right: ITextAlign;
  Center: ITextAlign;
  Justify: ITextAlign;
  Start: ITextAlign;
  End: ITextAlign;
}

export type ITextBaseline = EnumEntity;

export interface ITextBaselineEnumValues {
  Alphabetic: ITextBaseline;
  Ideographic: ITextBaseline;
}

export type ITextDirection = EnumEntity;

export interface ITextDirectionEnumValues {
  LTR: ITextDirection;
  RTL: ITextDirection;
}

export type ITextHeightBehavior = EnumEntity;

export interface ITextHeightBehaviorEnumValues {
  All: ITextHeightBehavior;
  DisableFirstAscent: ITextHeightBehavior;
  DisableLastDescent: ITextHeightBehavior;
  DisableAll: ITextHeightBehavior;
}

export type ITileMode = EnumEntity;

export interface ITileModeEnumValues {
  Clamp: ITileMode;
  Decal: ITileMode;
  Mirror: ITileMode;
  Repeat: ITileMode;
}

export type IVertexMode = EnumEntity;

export interface IVertexModeEnumValues {
  Triangles: IVertexMode;
  TrianglesStrip: IVertexMode;
  TriangleFan: IVertexMode;
}
