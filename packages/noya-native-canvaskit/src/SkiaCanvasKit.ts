import * as RNSkia from '@shopify/react-native-skia';

import type {
  Rect,
  IRect,
  RRect,
  Color,
  Surface,
  SoundMap,
  Vertices,
  ColorInt,
  MallocObj,
  Particles,
  ImageInfo,
  SkPicture,
  InputRect,
  VertexMode,
  ColorSpace,
  InputMatrix,
  InputVector3,
  WebGLOptions,
  ColorIntArray,
  AnimatedImage,
  GrDirectContext,
  TonalColorsInput,
  SkottieAnimation,
  EmulatedCanvas2D,
  TonalColorsOutput,
  WebGLContextHandle,
  TypedArrayConstructor,
  ManagedSkottieAnimation,
  InputFlattenedPointArray,
} from 'canvaskit';
import parseColor from 'color-parse';

import {
  SkiaPath,
  SkiaFont,
  SkiaPaint,
  SkiaImage,
  SkiaMatrix,
  SkiaTextStyle,
  SkiaColorMatrix,
  SkiaShaderFactory,
  SkiaParagraphStyle,
  SkiaFontMgrFactory,
  SkiaTextBlobFactory,
  SkiaTypefaceFactory,
  SkiaParagraphBuilder,
  SkiaImageFilterFactory,
  SkiaColorFilterFactory,
  SkiaRuntimeEffectFactory,
  SkiaTypefaceFontProviderFactory,
} from './ClassWrappers';
import * as Types from './types';

export const SkiaCanvasKit = {
  Color(r: number, g: number, b: number, a?: number): Color {
    return new Float32Array([r / 255, g / 255, b / 255, a ?? 0]);
  },

  Color4f(r: number, g: number, b: number, a?: number): Color {
    return new Float32Array([r, g, b, a ?? 1]);
  },

  // @ts-ignore
  ColorAsInt(r: number, g: number, b: number, a?: number): ColorInt {
    console.warn(`SkiaCanvasKit.ColorAsInt not implemented!`);
  },

  // @ts-ignore
  getColorComponents(c: Color): number[] {
    console.warn(`SkiaCanvasKit.getColorComponents not implemented!`);
  },

  parseColorString(color: string, colorMap?: object): Color {
    const {
      values: [r, g, b],
      alpha,
    } = parseColor(color);

    return new Float32Array([r / 255, g / 255, b / 255, alpha ?? 1]);
  },

  // @ts-ignore
  multiplyByAlpha(c: Color, alpha: number): Color {
    console.warn(`SkiaCanvasKit.multipyByAlpha not implemented!`);
  },

  // @ts-ignore
  computeTonalColors(colors: TonalColorsInput): TonalColorsOutput {
    console.warn(`SkiaCanvasKit.computeTonalColors not implemented!`);
  },

  LTRBRect(left: number, top: number, right: number, bottom: number): Rect {
    return new Float32Array([left, top, right, bottom]);
  },

  XYWHRect(x: number, y: number, width: number, height: number): Rect {
    return new Float32Array([x, y, x + width, y + height]);
  },

  // @ts-ignore
  LTRBiRect(left: number, top: number, right: number, bottom: number): IRect {
    console.warn(`SkiaCanvasKit.LTRBiRect not implemented!`);
  },

  XYWHiRect(x: number, y: number, width: number, height: number): IRect {
    return new Int32Array([x, y, x + width, y + height]);
  },

  // @ts-ignore
  RRectXY(rect: InputRect, rx: number, ry: number): RRect {
    console.warn(`SkiaCanvasKit.RRectXY not implemented!`);
  },

  getShadowLocalBounds(
    ctm: InputMatrix,
    path: SkiaPath,
    zPlaneParams: InputVector3,
    lightPos: InputVector3,
    lightRadius: number,
    flags: number,
    dstRect?: Rect,
    // @ts-ignore
  ): Rect | null {
    console.warn(`SkiaCanvasKit.getShadowLocalBounds not implemented!`);
  },

  // @ts-ignore
  Malloc(typedArray: TypedArrayConstructor, len: number): MallocObj {
    console.warn(`SkiaCanvasKit.Malloc not implemented!`);
  },

  // @ts-ignore
  MallocGlyphIDs(len: number): MallocObj {
    console.warn(`SkiaCanvasKit.MallocGlyphIDs not implemented!`);
  },

  Free(m: MallocObj): void {
    console.warn(`SkiaCanvasKit.Free not implemented!`);
  },

  MakeCanvasSurface(canvas: HTMLCanvasElement | string): Surface | null {
    throw new Error(`SkiaCanvasKit.MakeCanvasSurface not implemented!`);
  },

  MakeRasterDirectSurface(
    ii: ImageInfo,
    pixels: MallocObj,
    bytesPerRow: number,
    // @ts-ignore
  ): Surface | null {
    console.warn(`SkiaCanvasKit.MakeRasterDirectSurface not implemented!`);
  },

  // @ts-ignore
  MakeSWCanvasSurface(canvas: HTMLCanvasElement | string): Surface | null {
    console.warn(`SkiaCanvasKit.MakeSWCanvasSurface not implemented!`);
  },

  MakeWebGLCanvasSurface(
    canvas: HTMLCanvasElement | string,
    colorSpace?: ColorSpace,
    opts?: WebGLOptions,
    // @ts-ignore
  ): Surface | null {
    console.warn(`SkiaCanvasKit.MakeWebGLCanvasSurface not implemented!`);
  },

  // @ts-ignore
  MakeSurface(width: number, height: number): Surface | null {
    console.warn(`SkiaCanvasKit.MakeSurface not implemented!`);
  },

  GetWebGLContext(
    canvas: HTMLCanvasElement,
    opts?: WebGLOptions,
    // @ts-ignore
  ): WebGLContextHandle {
    console.warn(`SkiaCanvasKit.GetWebGLContext not implemented!`);
  },

  // @ts-ignore
  MakeGrContext(ctx: WebGLContextHandle): GrDirectContext {
    console.warn(`SkiaCanvasKit.MakeGrContext not implemented!`);
  },

  MakeOnScreenGLSurface(
    ctx: GrDirectContext,
    width: number,
    height: number,
    colorSpace: ColorSpace,
    // @ts-ignore
  ): Surface | null {
    console.warn(`SkiaCanvasKit.MakeOnScreenGLSurface not implemented!`);
  },

  MakeRenderTarget(
    ctx: GrDirectContext,
    width: number,
    height: number,
    // @ts-ignore
  ): Surface | null {
    console.warn(`SkiaCanvasKit.MakeRenderTarget not implemented!`);
  },

  // @ts-ignore
  currentContext(): WebGLContextHandle {
    console.warn(`SkiaCanvasKit.currentContext not implemented!`);
  },

  setCurrentContext(ctx: WebGLContextHandle): void {
    console.warn(`SkiaCanvasKit.setCurrentContext not implemented!`);
  },

  deleteContext(ctx: WebGLContextHandle): void {
    console.warn(`SkiaCanvasKit.deleteContext not implemented!`);
  },

  // @ts-ignore
  getDecodeCacheLimitBytes(): number {
    console.warn(`SkiaCanvasKit.getDecodeCacheLimitBytes not implemented!`);
  },

  // @ts-ignore
  getDecodeCacheUsedBytes(): number {
    console.warn(`SkiaCanvasKit.getDecodeCacheUsedBytes not implemented!`);
  },

  setDecodeCacheLimitBytes(size: number): void {
    console.warn(`SkiaCanvasKit.setDecodeCacheLimitBytes not implemented!`);
  },

  MakeAnimatedImageFromEncoded(
    bytes: Uint8Array | ArrayBuffer,
    // @ts-ignore
  ): AnimatedImage | null {
    console.warn(`SkiaCanvasKit.MakeAnimatedImageFromEncoded not implemented!`);
  },

  // @ts-ignore
  MakeCanvas(width: number, height: number): EmulatedCanvas2D {
    console.warn(`SkiaCanvasKit.MakeCanvas not implemented!`);
  },

  MakeImage(
    info: ImageInfo,
    bytes: number[] | Uint8Array | Uint8ClampedArray,
    bytesPerRow: number,
    // @ts-ignore
  ): SkiaImage | null {
    console.warn(`SkiaCanvasKit.MakeImage not implemented!`);
  },

  MakeImageFromEncoded(bytes: Uint8Array | ArrayBuffer): SkiaImage | null {
    const data = RNSkia.Skia.Data.fromBytes(new Uint8Array(bytes));
    const img = RNSkia.Skia.MakeImageFromEncoded(data);

    if (!img) {
      return null;
    }

    return new SkiaImage(img);
  },

  // @ts-ignore
  MakeImageFromCanvasImageSource(src: CanvasImageSource): SkiaImage {
    console.warn(
      `SkiaCanvasKit.MakeImageFromCanvasImageSource not implemented!`,
    );
  },

  // @ts-ignore
  MakePicture(bytes: Uint8Array | ArrayBuffer): SkPicture | null {
    console.warn(`SkiaCanvasKit.MakePicture not implemented!`);
  },

  MakeVertices(
    mode: VertexMode,
    positions: InputFlattenedPointArray,
    textureCoordinates?: InputFlattenedPointArray | null,
    colors?: Float32Array | ColorIntArray | null,
    indices?: number[] | null,
    isVolatile?: boolean,
    // @ts-ignore
  ): Vertices {
    console.warn(`SkiaCanvasKit.MakeVertices not implemented!`);
  },

  // @ts-ignore
  MakeAnimation(json: string): SkottieAnimation {
    console.warn(`SkiaCanvasKit.MakeAnimation not implemented!`);
  },

  MakeManagedAnimation(
    json: string,
    assets?: Record<string, ArrayBuffer>,
    filterPrefix?: string,
    soundMap?: SoundMap,
    // @ts-ignore
  ): ManagedSkottieAnimation {
    console.warn(`SkiaCanvasKit.MakeManagedAnimation not implemented!`);
  },

  // @ts-ignore
  MakeParticles(json: string, assets?: Record<string, ArrayBuffer>): Particles {
    console.warn(`SkiaCanvasKit.MakeParticles not implemented!`);
  },

  // Constructors, i.e. things made with `new CanvasKit.Foo()`;s
  ImageData: 0 as any,
  ParagraphStyle: SkiaParagraphStyle,
  ContourMeasureIter: 0 as any,
  Font: SkiaFont,
  Path: SkiaPath,
  Paint: SkiaPaint,
  PictureRecorder: 0 as any,
  TextStyle: SkiaTextStyle,

  // Factories, i.e. things made with CanvasKit.Foo.MakeTurboEncapsulator()
  ParagraphBuilder: SkiaParagraphBuilder,
  ColorFilter: SkiaColorFilterFactory,
  FontMgr: SkiaFontMgrFactory,
  ImageFilter: SkiaImageFilterFactory,
  MaskFilter: RNSkia.Skia.MaskFilter,
  PathEffect: RNSkia.Skia.PathEffect,
  RuntimeEffect: SkiaRuntimeEffectFactory,
  Shader: SkiaShaderFactory,
  TextBlob: SkiaTextBlobFactory,
  Typeface: SkiaTypefaceFactory,
  TypefaceFontProvider: SkiaTypefaceFontProviderFactory,

  // Misc
  ColorMatrix: SkiaColorMatrix,
  Matrix: SkiaMatrix,
  M44: 0 as any,
  Vector: 0 as any,

  // Core Enums
  AlphaType: Types.AlphaType,
  BlendMode: RNSkia.BlendMode,
  BlurStyle: RNSkia.BlurStyle,
  ClipOp: RNSkia.ClipOp,
  ColorType: Types.ColorType,
  FillType: RNSkia.FillType,
  FilterMode: RNSkia.FilterMode,
  FontEdging: Types.FontEdging,
  FontHinting: Types.FontHinting,
  GlyphRunFlags: { IsWhiteSpace: 1 },
  ImageFormat: RNSkia.ImageFormat,
  MipmapMode: RNSkia.MipmapMode,
  PaintStyle: RNSkia.PaintStyle,
  PathOp: RNSkia.PathOp,
  PointMode: RNSkia.PointMode,
  ColorSpace: 0 as any,

  StrokeCap: RNSkia.StrokeCap,
  StrokeJoin: RNSkia.StrokeJoin,
  TileMode: RNSkia.TileMode,
  VertexMode: Types.VertexMode,

  // Core Constants
  TRANSPARENT: new Float32Array([0, 0, 0, 0]),
  BLACK: new Float32Array([0, 0, 0, 1]),
  WHITE: new Float32Array([1, 1, 1, 1]),
  RED: new Float32Array([1, 0, 0, 1]),
  GREEN: new Float32Array([0, 1, 0, 1]),
  BLUE: new Float32Array([0, 0, 1, 1]),
  YELLOW: new Float32Array([1, 1, 0, 1]),
  CYAN: new Float32Array([0, 1, 1, 1]),
  MAGENTA: new Float32Array([1, 0, 1, 1]),

  MOVE_VERB: 0,
  LINE_VERB: 1,
  QUAD_VERB: 2,
  CONIC_VERB: 3,
  CUBIC_VERB: 4,
  CLOSE_VERB: 5,

  SaveLayerInitWithPrevious: 4,
  SaveLayerF16ColorType: 16,

  ShadowTransparentOccluder: 0x1,
  ShadowGeometricOnly: 0x2,
  ShadowDirectionalLight: 0x4,

  gpu: false, // true if GPU code was compiled in
  managed_skottie: false, // true if advanced (managed) Skottie code was compiled in
  particles: false, // true if Particles code was compiled in
  rt_effect: false, // true if RuntimeEffect was compiled in
  skottie: false, // true if base Skottie code was compiled in

  // Paragraph Enums
  Affinity: Types.Affinity,
  DecorationStyle: Types.DecorationStyle,
  FontSlant: RNSkia.FontSlant,
  FontWeight: RNSkia.FontWeight,
  FontWidth: RNSkia.FontWidth,
  PlaceholderAlignment: Types.PlaceholderAlignment,
  RectHeightStyle: Types.RectHeightStyle,
  RectWidthStyle: Types.RectWidthStyle,
  TextAlign: Types.TextAlign,
  TextBaseline: Types.TextBaseline,
  TextDirection: Types.TextDirection,
  TextHeightBehavior: Types.TextHeightBehavior,

  // Paragraph Constants
  NoDecoration: 0x0,
  UnderlineDecoration: 0x1,
  OverlineDecoration: 0x2,
  LineThroughDecoration: 0x4,
};
