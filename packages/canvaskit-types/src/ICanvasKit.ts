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

import type { DefaultConstructor, ITonalColor } from './misc';
import { IShaderFactory } from './IShader';
import type { IPaint } from './IPaint';
import type { IPath } from './IPath';

export interface ICanvasKit<
  IColor,
  IRect,
  IRRect,
  IPoint,
  IColorArray,
  IMatrix,
> {
  // Colors
  Color(r: number, g: number, b: number, a?: number): IColor;
  Color4f(r: number, g: number, b: number, a?: number): IColor;
  ColorAsInt(r: number, g: number, b: number, a?: number): number;
  getColorComponents(c: IColor): number[];
  parseColorString(color: string, colorMap?: object): IColor;
  multiplyByAlpha(c: IColor, alpha: number): IColor;
  computeTonalColors(colors: ITonalColor<IColor>): ITonalColor<IColor>;

  // Rects
  LTRBRect(left: number, top: number, right: number, bottom: number): IRect;
  XYWHRect(x: number, y: number, width: number, height: number): IRect;
  LTRBiRect(left: number, top: number, right: number, bottom: number): IRect;
  XYWHiRect(x: number, y: number, width: number, height: number): IRect;
  RRectXY(rect: IRect, rx: number, ry: number): IRRect;

  // getShadowLocalBounds(
  //   ctm: InputMatrix,
  //   path: IPath,
  //   zPlaneParams: InputVector3,
  //   lightPos: InputVector3,
  //   lightRadius: number,
  //   flags: number,
  //   dstRect?: IRect,
  // ): IRect | null;

  // Malloc(typedArray: TypedArrayConstructor, len: number): MallocObj;
  // MallocGlyphIDs(len: number): MallocObj;
  // Free(m: MallocObj): void;

  // MakeCanvasSurface(canvas: HTMLCanvasElement | string): Surface | null;
  // MakeRasterDirectSurface(
  //   ii: ImageInfo,
  //   pixels: MallocObj,
  //   bytesPerRow: number,
  // ): Surface | null;
  // MakeSWCanvasSurface(canvas: HTMLCanvasElement | string): Surface | null;
  // MakeWebGLCanvasSurface(
  //   canvas: HTMLCanvasElement | string,
  //   colorSpace?: ColorSpace,
  //   opts?: WebGLOptions,
  // ): Surface | null;
  // MakeSurface(width: number, height: number): Surface | null;

  // GetWebGLContext(
  //   canvas: HTMLCanvasElement,
  //   opts?: WebGLOptions,
  // ): WebGLContextHandle;
  // MakeGrContext(ctx: WebGLContextHandle): GrDirectContext;

  // MakeOnScreenGLSurface(
  //   ctx: GrDirectContext,
  //   width: number,
  //   height: number,
  //   colorSpace: ColorSpace,
  // ): Surface | null;
  // MakeRenderTarget(
  //   ctx: GrDirectContext,
  //   width: number,
  //   height: number,
  // ): Surface | null;
  // MakeRenderTarget(ctx: GrDirectContext, info: ImageInfo): Surface | null;
  // currentContext(): WebGLContextHandle;
  // setCurrentContext(ctx: WebGLContextHandle): void;
  // deleteContext(ctx: WebGLContextHandle): void;

  // getDecodeCacheLimitBytes(): number;
  // getDecodeCacheUsedBytes(): number;
  // setDecodeCacheLimitBytes(size: number): void;

  // MakeAnimatedImageFromEncoded(
  //   bytes: Uint8Array | ArrayBuffer,
  // ): AnimatedImage | null;
  // MakeCanvas(width: number, height: number): EmulatedCanvas2D;

  // MakeImage(
  //   info: IImageInfo,
  //   bytes: number[] | Uint8Array | Uint8ClampedArray,
  //   bytesPerRow: number,
  // ): IImage | null;
  // MakeImageFromEncoded(bytes: Uint8Array | ArrayBuffer): IImage | null;
  // // MakeImageFromCanvasImageSource(src: CanvasImageSource): Image;
  // MakePicture(bytes: Uint8Array | ArrayBuffer): ISkPicture | null;
  // MakeVertices(
  //   mode: VertexMode,
  //   positions: InputFlattenedPointArray,
  //   textureCoordinates?: InputFlattenedPointArray | null,
  //   colors?: Float32Array | ColorIntArray | null,
  //   indices?: number[] | null,
  //   isVolatile?: boolean,
  // ): Vertices;
  // MakeAnimation(json: string): SkottieAnimation;
  // MakeManagedAnimation(
  //   json: string,
  //   assets?: Record<string, ArrayBuffer>,
  //   filterPrefix?: string,
  //   soundMap?: SoundMap,
  // ): ManagedSkottieAnimation;
  // MakeParticles(json: string, assets?: Record<string, ArrayBuffer>): Particles;

  // Constructors
  readonly Paint: DefaultConstructor<IPaint<IColor>>;
  readonly Path: IPath;

  // Factories
  readonly Shader: IShaderFactory<IColor, IPoint, IColorArray, IMatrix>;

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

  readonly MOVE_VERB: number;
  readonly LINE_VERB: number;
  readonly QUAD_VERB: number;
  readonly CONIC_VERB: number;
  readonly CUBIC_VERB: number;
  readonly CLOSE_VERB: number;

  readonly SaveLayerInitWithPrevious: number;
  readonly SaveLayerF16ColorType: number;

  readonly ShadowTransparentOccluder: number;
  readonly ShadowGeometricOnly: number;
  readonly ShadowDirectionalLight: number;

  readonly gpu?: boolean;
  readonly managed_skottie?: boolean;
  readonly particles?: boolean;
  readonly rt_effect?: boolean;
  readonly skottie?: boolean;

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
