import type { IMatrixHelpers, IColorMatrixHelpers } from './MatrixHelpers';
import type { IPath, IPathConstructorAndFactory } from './IPath';
import type { IRuntimeEffectFactory } from './IRuntimeEffect';
import type { IParagraphBuilderFactory } from './IParagraph';
import type { IImageFilterFactory } from './IImageFilter';
import type { IContourMeasureIterConstructor } from './IContourMeasureIter';
import type { IShaderFactory } from './IShader';
import type { IPaint } from './IPaint';
import type { IImage } from './IImage';
import type {
  EmbindObject,
  IFontConstructor,
  ITypefaceFactory,
  IPathEffectFactory,
  IMaskFilterFactory,
  DefaultConstructor,
  IColorFilterFactory,
  ITextStyleConstructor,
  IParagraphStyleConstructor,
  ITypefaceFontProviderFactory,
} from './misc';
import type {
  IClipOpEnumValues,
  IPathOpEnumValues,
  IFillTypeEnumValues,
  IGlyphRunFlagValues,
  IAffinityEnumValues,
  ITileModeEnumValues,
  IPointModeEnumValues,
  IFontWidthEnumValues,
  ITextAlignEnumValues,
  IBlurStyleEnumValues,
  IFontSlantEnumValues,
  IStrokeJoinEnumValues,
  IBlendModeEnumValues,
  IStrokeCapEnumValues,
  IColorSpaceEnumValues,
  IAlphaTypeEnumValues,
  IColorTypeEnumValues,
  IMipmapModeEnumValues,
  IPaintStyleEnumValues,
  IFontEdgingEnumValues,
  IFontWeightEnumValues,
  IFilterModeEnumValues,
  IVertexModeEnumValues,
  IImageFormatEnumValues,
  IFontHintingEnumValues,
  ITextBaselineEnumValues,
  ITextDirectionEnumValues,
  IRectWidthStyleEnumValues,
  IDecorationStyleEnumValues,
  IRectHeightStyleEnumValues,
  ITextHeightBehaviorEnumValues,
  IPlaceholderAlignmentEnumValues,
} from './Enums';

export interface ICanvasKit<
  IColor,
  IRect,
  IPoint,
  IColorArray extends Array<any>,
  IMatrix,
  IInputMatrix,
  ISurface extends EmbindObject,
> {
  // Colors
  Color(r: number, g: number, b: number, a?: number): IColor;
  Color4f(r: number, g: number, b: number, a?: number): IColor;
  getColorComponents(color: IColor): number[];
  parseColorString(color: string, colorMap?: object): IColor;

  // Rects
  LTRBRect(left: number, top: number, right: number, bottom: number): IRect;
  XYWHRect(x: number, y: number, width: number, height: number): IRect;

  MakeCanvasSurface(canvas: HTMLCanvasElement | string): ISurface | null;

  MakeSurface(width: number, height: number): ISurface | null;

  MakeImageFromEncoded(bytes: Uint8Array | ArrayBuffer): IImage<IMatrix> | null;

  // Methods that don't exist on original canvaskit
  // and have to be added
  Point(x: number, y: number): IPoint;
  CreateMatrix(inMat: number[] | IInputMatrix): IMatrix;
  CreateInputMatrix(inMat: number[]): IInputMatrix;

  // Misc
  ColorMatrix: IColorMatrixHelpers<IInputMatrix>;
  Matrix: IMatrixHelpers<IInputMatrix>;

  // Constructors
  readonly ContourMeasureIter: IContourMeasureIterConstructor<IRect>;
  readonly ParagraphStyle: IParagraphStyleConstructor<IColor>;
  readonly Font: IFontConstructor;
  readonly Path: IPathConstructorAndFactory<IRect, IPath<IRect>>;
  readonly Paint: DefaultConstructor<IPaint<IColor>>;
  readonly TextStyle: ITextStyleConstructor<IColor>;

  // Factories
  readonly ParagraphBuilder: IParagraphBuilderFactory<IColor>;
  readonly ColorFilter: IColorFilterFactory<IColor, IInputMatrix>;
  readonly ImageFilter: IImageFilterFactory<IColor>;
  readonly MaskFilter: IMaskFilterFactory;
  readonly PathEffect: IPathEffectFactory;
  readonly RuntimeEffect: IRuntimeEffectFactory<IMatrix>;
  readonly Shader: IShaderFactory<IColor, IPoint, IColorArray, IMatrix>;
  readonly Typeface: ITypefaceFactory;
  readonly TypefaceFontProvider: ITypefaceFontProviderFactory;

  // Misc

  // Core Enums
  readonly AlphaType: IAlphaTypeEnumValues;
  readonly BlendMode: IBlendModeEnumValues;
  readonly BlurStyle: IBlurStyleEnumValues;
  readonly ClipOp: IClipOpEnumValues;
  readonly ColorType: IColorTypeEnumValues;
  readonly FillType: IFillTypeEnumValues;
  readonly FilterMode: IFilterModeEnumValues;
  readonly FontEdging: IFontEdgingEnumValues;
  readonly FontHinting: IFontHintingEnumValues;
  readonly GlyphRunFlags: IGlyphRunFlagValues;
  readonly ImageFormat: IImageFormatEnumValues;
  readonly MipmapMode: IMipmapModeEnumValues;
  readonly PaintStyle: IPaintStyleEnumValues;
  readonly PathOp: IPathOpEnumValues;
  readonly PointMode: IPointModeEnumValues;
  readonly ColorSpace: IColorSpaceEnumValues;
  readonly StrokeCap: IStrokeCapEnumValues;
  readonly StrokeJoin: IStrokeJoinEnumValues;
  readonly TileMode: ITileModeEnumValues;
  readonly VertexMode: IVertexModeEnumValues;

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
  readonly Affinity: IAffinityEnumValues;
  readonly DecorationStyle: IDecorationStyleEnumValues;
  readonly FontSlant: IFontSlantEnumValues;
  readonly FontWeight: IFontWeightEnumValues;
  readonly FontWidth: IFontWidthEnumValues;
  readonly PlaceholderAlignment: IPlaceholderAlignmentEnumValues;
  readonly RectHeightStyle: IRectHeightStyleEnumValues;
  readonly RectWidthStyle: IRectWidthStyleEnumValues;
  readonly TextAlign: ITextAlignEnumValues;
  readonly TextBaseline: ITextBaselineEnumValues;
  readonly TextDirection: ITextDirectionEnumValues;
  readonly TextHeightBehavior: ITextHeightBehaviorEnumValues;

  // Paragraph Constants
  readonly NoDecoration: number;
  readonly UnderlineDecoration: number;
  readonly OverlineDecoration: number;
  readonly LineThroughDecoration: number;
}
