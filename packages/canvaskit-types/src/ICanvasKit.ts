import type { Brand } from 'noya-utils';
import type { IMatrixHelpers, IColorMatrixHelpers } from './MatrixHelpers';
import type { IPath, IPathConstructorAndFactory } from './IPath';
import type { IParagraph, IParagraphBuilderFactory } from './IParagraph';
import type { IImageFilter, IImageFilterFactory } from './IImageFilter';
import type { IShader, IShaderFactory } from './IShader';
import type { IPaint } from './IPaint';
import type { IImage } from './IImage';
import type {
  IFontConstructor,
  ITypefaceFactory,
  IPathEffectFactory,
  IMaskFilterFactory,
  DefaultConstructor,
  IColorFilterFactory,
  IRuntimeEffectFactory,
  ITextStyleConstructor,
  IParagraphStyleConstructor,
  ITypefaceFontProviderFactory,
} from './misc';
import type {
  IBlendMode,
  IStrokeCap,
  IStrokeJoin,
  IColorSpace,
  IPaintStyle,
  IAlphaType,
  IClipOp,
  IColorType,
  IFillType,
  IFilterMode,
  IFontEdging,
  IFontHinting,
  IGlyphRunFlagValues,
  IMipmapMode,
  IPathOp,
  IPointMode,
  IDecorationStyle,
  IFontSlant,
  IFontWeight,
  IFontWidth,
  IPlaceholderAlignment,
  IAffinity,
  IRectHeightStyle,
  IRectWidthStyle,
  ITextAlign,
  ITextBaseline,
  ITextDirection,
  ITextHeightBehavior,
  ITileMode,
  IVertexMode,
  IImageFormat,
  IBlurStyle,
} from './Enums';

export interface ICanvasKit<
  IColor,
  IRect,
  IPoint,
  IColorArray,
  IMatrix,
  IInputMatrix,
  IRectArray,
  IColorMatrix,
  ISurface,
> {
  // Colors
  Color(r: number, g: number, b: number, a?: number): IColor;
  Color4f(r: number, g: number, b: number, a?: number): IColor;
  parseColorString(color: string, colorMap?: object): IColor;

  // Rects
  LTRBRect(left: number, top: number, right: number, bottom: number): IRect;
  XYWHRect(x: number, y: number, width: number, height: number): IRect;

  MakeCanvasSurface(canvas: HTMLCanvasElement | string): ISurface | null;

  MakeSurface(width: number, height: number): ISurface | null;

  MakeImageFromEncoded(bytes: Uint8Array | ArrayBuffer): IImage<IMatrix> | null;

  // Misc
  ColorMatrix: IColorMatrixHelpers<IColorMatrix>;
  Matrix: IMatrixHelpers<IMatrix>;

  // Constructors
  readonly ParagraphStyle: IParagraphStyleConstructor<IColor>;
  readonly Font: IFontConstructor;
  readonly Path: IPathConstructorAndFactory<IRect, IPath<IRect>>;
  readonly Paint: DefaultConstructor<IPaint<IColor>>;
  readonly TextStyle: ITextStyleConstructor<IColor>;

  // Factories
  readonly ParagraphBuilder: IParagraphBuilderFactory<IColor, IRectArray>;
  readonly ColorFilter: IColorFilterFactory<IColor, IInputMatrix>;
  readonly ImageFilter: IImageFilterFactory<IColor>;
  readonly MaskFilter: IMaskFilterFactory;
  readonly PathEffect: IPathEffectFactory;
  readonly RuntimeEffect: IRuntimeEffectFactory;
  readonly Shader: IShaderFactory<IColor, IPoint, IColorArray, IMatrix>;
  readonly Typeface: ITypefaceFactory;
  readonly TypefaceFontProvider: ITypefaceFontProviderFactory;

  // Misc

  // Core Enums
  readonly AlphaType: IAlphaType;
  readonly BlendMode: IBlendMode;
  readonly BlurStyle: IBlurStyle;
  readonly ClipOp: IClipOp;
  readonly ColorType: IColorType;
  readonly FillType: IFillType;
  readonly FilterMode: IFilterMode;
  readonly FontEdging: IFontEdging;
  readonly FontHinting: IFontHinting;
  readonly GlyphRunFlags: IGlyphRunFlagValues;
  readonly ImageFormat: IImageFormat;
  readonly MipmapMode: IMipmapMode;
  readonly PaintStyle: IPaintStyle;
  readonly PathOp: IPathOp;
  readonly PointMode: IPointMode;
  readonly ColorSpace: IColorSpace;
  readonly StrokeCap: IStrokeCap;
  readonly StrokeJoin: IStrokeJoin;
  readonly TileMode: ITileMode;
  readonly VertexMode: IVertexMode;

  // Core Constants
  readonly TRANSPARENT: IColor;
  readonly BLACK: IColor;
  readonly WHITE: IColor;
  readonly RED: IColor;
  readonly GREEN: IColor;
  readonly BLUE: IColor;
  readonly YELLOW: IColor;
  readonly CYAN: IColor;
  readonly MAGENTA: IColor;

  // Paragraph Enums
  readonly Affinity: IAffinity;
  readonly DecorationStyle: IDecorationStyle;
  readonly FontSlant: IFontSlant;
  readonly FontWeight: IFontWeight;
  readonly FontWidth: IFontWidth;
  readonly PlaceholderAlignment: IPlaceholderAlignment;
  readonly RectHeightStyle: IRectHeightStyle;
  readonly RectWidthStyle: IRectWidthStyle;
  readonly TextAlign: ITextAlign;
  readonly TextBaseline: ITextBaseline;
  readonly TextDirection: ITextDirection;
  readonly TextHeightBehavior: ITextHeightBehavior;

  // Paragraph Constants
  readonly NoDecoration: number;
  readonly UnderlineDecoration: number;
  readonly OverlineDecoration: number;
  readonly LineThroughDecoration: number;
}

export type Color = Brand<unknown, 'color'>;
export type Rect = Brand<unknown, 'rect'>;
export type Point = Brand<unknown, 'point'>;
export type ColorArray = Brand<unknown, 'colorarray'>;
export type Matrix = Brand<unknown, 'matrix'>;
export type InputMatrix = Brand<unknown, 'inputmatrix'>;
export type RectArray = Brand<unknown, 'rectarray'>;
export type ColorMatrix = Brand<unknown, 'colormatrix'>;
export type Surface = Brand<unknown, 'surface'>;

export type Image = IImage<Matrix>;
export type ImageFilter = IImageFilter;
export type Path = IPath<Rect>;
export type Paragraph = IParagraph<RectArray>;
export type Shader = IShader;
export type Paint = IPaint<Color>;

export type CanvasKit = ICanvasKit<
  Color,
  Rect,
  Point,
  ColorArray,
  Matrix,
  InputMatrix,
  RectArray,
  ColorMatrix,
  Surface
>;
