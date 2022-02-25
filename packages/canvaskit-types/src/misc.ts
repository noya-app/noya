import { EnumEntity } from './Enums';

export type MallocObj = any;

export interface DefaultConstructor<T> {
  new (): T;
}

export interface EmbindObject {
  clone(): void;
  delete(): void;
  deleteAfter(): void;
  isAliasOf(other: any): boolean;
  isDeleted(): boolean;
}

export interface IImageInfo {
  alphaType: EnumEntity;
  colorSpace: EnumEntity;
  colorType: EnumEntity;
  height: number;
  width: number;
}

export interface IPartialImageInfo {
  alphaType: EnumEntity;
  colorType: EnumEntity;
  height: number;
  width: number;
}

export interface IPositionWithAfinity {
  pos: number;
  affinity: EnumEntity;
}

export interface ILineMetrics {
  startIndex: number;
  endIndex: number;
  endExcludingWhitespaces: number;
  endIncludingNewline: number;
  isHardBreak: boolean;
  ascent: number;
  descent: number;
  height: number;
  width: number;
  left: number;
  baseline: number;
  lineNumber: number;
}

export interface IRange {
  first: number;
  last: number;
}

export interface IURange {
  start: number;
  end: number;
}

export interface IGlyphRun {
  typeface: ITypeface;
  size: number;
  fakeBold: boolean;
  fakeItalic: boolean;

  // TODO:? change all three to numbers or ISomethingArray;
  glyphs: Uint16Array;
  positions: Float32Array;
  offsets: Uint32Array;
  flags: number;
}

export interface IShapedLine {
  textRange: IRange;
  top: number;
  bottom: number;
  baseline: number;
  runs: IGlyphRun[];
}

export interface IFontStyle {
  weight?: EnumEntity;
  width?: EnumEntity;
  slant?: EnumEntity;
}

export interface IStrokeOpts {
  width?: number;
  miter_limit?: number;

  precision?: number;
  join?: EnumEntity;
  cap?: EnumEntity;
}

export interface IStrutStyle {
  strutEnabled?: boolean;
  fontFamilies?: string[];
  fontStyle?: IFontStyle;
  fontSize?: number;
  heightMultiplier?: number;
  halfLeading?: boolean;
  leading?: number;
  forceStrutHeight?: boolean;
}

export interface ITextFontFeatures {
  name: string;
  value: number;
}

export interface ITextShadow<IColor> {
  color?: IColor;
  offset?: number[];
  blurRadius?: number;
}

export interface ITextStyle<IColor> {
  backgroundColor?: IColor;
  color?: IColor;
  decoration?: number;
  decorationColor?: IColor;
  decorationThickness?: number;
  decrationStyle?: EnumEntity;
  fontFamilies?: string[];
  fontFeatures?: ITextFontFeatures[];
  fontSize?: number;
  fontStyle?: IFontStyle;
  foregroundColor?: IColor;
  heightMultiplier?: number;
  halfLeading?: boolean;
  letterSpacing?: number;
  locale?: string;
  shadows?: ITextShadow<IColor>[];
  textBaseline?: EnumEntity;
  wordSpacing?: number;
}

export interface IParagraphStyle<IColor> {
  disableHinting?: boolean;
  ellipsis?: string;
  heightMultiplier?: number;
  maxLines?: number;
  strutStyle?: IStrutStyle;
  textAlign?: EnumEntity;
  textDirection?: EnumEntity;
  textHeightBehavior?: EnumEntity;
  textStyle?: ITextStyle<IColor>;
}

export interface IColorFilter {}

export interface ITypeface {}

export interface IMaskFilter {}

export interface IPathEffect {}

export interface IRuntimeEffect {}

export interface IFont {
  getTypeface(): ITypeface;
}

export interface ITypefaceFontProvider {
  registerFont(bytes: ArrayBuffer | Uint8Array, family: string): void;
}

/*
 * Constructors
 */
export interface ITextStyleConstructor<IColor> {
  new (ts: ITextStyle<IColor>): ITextStyle<IColor>;
}

export interface IParagraphStyleConstructor<IColor> {
  new (ps: IParagraphStyle<IColor>): IParagraphStyle<IColor>;
}

export interface IFontConstructor {
  new (face: ITypeface, size?: number): IFont;
}

export interface ITypefaceFontProviderFactory {
  Make(): ITypefaceFontProvider;
}

/*
 * Factories
 */
export interface ITypefaceFactory {
  MakeFreeTypeFaceFromData(fontData: ArrayBuffer): ITypeface | null;
}

export interface IColorFilterFactory<IColor, IMatrix> {
  MakeBlend(color: IColor, mode: EnumEntity): IColorFilter;
  MakeCompose(outer: IColorFilter, inner: IColorFilter): IColorFilter;
  MakeMatrix(cMatrix: IMatrix): IColorFilter;
}

export interface IMaskFilterFactory {
  MakeBlur(
    blurStyle: EnumEntity,
    sigma: number,
    respectCTM: boolean,
  ): IMaskFilter;
}

export interface IPathEffectFactory {
  MakeCorner(radius: number): IPathEffect | null;
  MakeDash(intervals: number[], phase?: number): IPathEffect;
  MakeDiscrete(segLength: number, dev: number, seedAssist: number): IPathEffect;
}

export interface IRuntimeEffectFactory {
  Make(sksl: string, callback?: (err: string) => void): IRuntimeEffect | null;
}
