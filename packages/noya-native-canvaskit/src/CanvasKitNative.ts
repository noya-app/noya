import * as RNSkia from '@shopify/react-native-skia';
import parseColor from 'color-parse';

import { ICanvasKit, IShaderFactory } from 'canvaskit-types';
import { colorNumToArray } from './utils/color';
// import primitives separately for easier use
import type { Color, Rect, RRect, Point, ColorArray, Matrix } from './types';
import PaintNative from './PaintNative';
import * as Types from './types';

class CanvasKitNative
  implements ICanvasKit<Color, Rect, RRect, Point, ColorArray, Matrix>
{
  Color(r: number, g: number, b: number, a?: number): Color {
    let normalizedColor =
      (r << 24) | (g << 16) | (b << 8) | (Math.floor((a ?? 1) * 255) << 0);

    return ((normalizedColor << 24) | (normalizedColor >>> 8)) >>> 0;
  }

  Color4f(inR: number, inG: number, inB: number, inA?: number): Color {
    const a = Math.floor((inA ?? 1) * 255) << 0;
    const r = Math.floor(inR * 255) << 24;
    const g = Math.floor(inG * 255) << 16;
    const b = Math.floor(inB * 255) << 8;

    const normalizedColor = a | r | g | b;

    return ((normalizedColor << 24) | (normalizedColor >>> 8)) >>> 0;
  }

  ColorAsInt(r: number, g: number, b: number, a?: number): Color {
    return this.Color(r, g, b, a);
  }

  getColorComponents(color: Color): number[] {
    console.warn(`SkiaCanvasKit.getColorComponents not implemented!`);
    return colorNumToArray(color);
  }

  parseColorString(color: string, colorMap?: object): Color {
    const {
      values: [r, g, b],
      alpha,
    } = parseColor(color);

    return this.Color(r, g, b, alpha);
  }

  // @ts-ignore
  multiplyByAlpha(c: Color, alpha: number): Color {
    console.warn(`SkiaCanvasKit.multipyByAlpha not implemented!`);
  }

  // @ts-ignore
  computeTonalColors(colors: TonalColorsInput): TonalColorsOutput {
    console.warn(`SkiaCanvasKit.computeTonalColors not implemented!`);
  }

  LTRBRect(left: number, top: number, right: number, bottom: number): Rect {
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  }

  XYWHRect(x: number, y: number, width: number, height: number): Rect {
    return { x, y, width, height };
  }

  LTRBiRect(left: number, top: number, right: number, bottom: number): Rect {
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  }

  XYWHiRect(x: number, y: number, width: number, height: number): Rect {
    return { x, y, width, height };
  }

  RRectXY(rect: Rect, rx: number, ry: number): RRect {
    return { rect, rx, ry };
  }

  // // @ts-ignore
  // getShadowLocalBounds(
  //   ctm: InputMatrix,
  //   path: SkiaPath,
  //   zPlaneParams: InputVector3,
  //   lightPos: InputVector3,
  //   lightRadius: number,
  //   flags: number,
  //   dstRect?: Rect,
  //   // @ts-ignore
  // ): Rect | null {
  //   console.warn(`SkiaCanvasKit.getShadowLocalBounds not implemented!`);
  // },

  // Constructors, i.e. things made with `new CanvasKit.Foo()`;s
  ImageData = 0 as any;
  //   ParagraphStyle: SkiaParagraphStyle,
  ContourMeasureIter = 0 as any;
  //   Font: SkiaFont,
  //   Path: SkiaPath,
  Paint = PaintNative;
  PictureRecorder = 0 as any;
  //   TextStyle: SkiaTextStyle,

  // Factories, i.e. things made with CanvasKit.Foo.MakeTurboEncapsulator()
  //   ParagraphBuilder: SkiaParagraphBuilder,
  //   ColorFilter: SkiaColorFilterFactory,
  //   FontMgr: SkiaFontMgrFactory,
  //   ImageFilter: SkiaImageFilterFactory,
  //   MaskFilter: RNSkia.Skia.MaskFilter,
  //   PathEffect: RNSkia.Skia.PathEffect,
  //   RuntimeEffect: SkiaRuntimeEffectFactory,
  Shader: IShaderFactory<Color, Point, ColorArray, Matrix> = RNSkia.Skia.Shader;
  //   TextBlob: SkiaTextBlobFactory,
  //   Typeface: SkiaTypefaceFactory,
  //   TypefaceFontProvider: SkiaTypefaceFontProviderFactory,

  // Core Enums
  AlphaType = Types.AlphaType;
  BlendMode = RNSkia.BlendMode;
  BlurStyle = RNSkia.BlurStyle;
  ClipOp = RNSkia.ClipOp;
  ColorType = Types.ColorType;
  FillType = RNSkia.FillType;
  FilterMode = RNSkia.FilterMode;
  FontEdging = Types.FontEdging;
  FontHinting = Types.FontHinting;
  GlyphRunFlags = { IsWhiteSpace: 1 };
  ImageFormat = RNSkia.ImageFormat;
  MipmapMode = RNSkia.MipmapMode;
  PaintStyle = RNSkia.PaintStyle;
  PathOp = RNSkia.PathOp;
  PointMode = RNSkia.PointMode;
  ColorSpace = Types.ColorSpace;
  StrokeCap = RNSkia.StrokeCap;
  StrokeJoin = RNSkia.StrokeJoin;
  TileMode = RNSkia.TileMode;
  VertexMode = Types.VertexMode;

  // Core Constants
  TRANSPARENT = 0x0;
  BLACK = 0xff000000;
  WHITE = 0xffffffff;
  RED = 0xfffff0000;
  GREEN = 0xff00ff00;
  BLUE = 0xff0000ff;
  YELLOW = 0xffffff00;
  CYAN = 0xff00ffff;
  MAGENTA = 0xffff00ff;

  MOVE_VERB = 0;
  LINE_VERB = 1;
  QUAD_VERB = 2;
  CONIC_VERB = 3;
  CUBIC_VERB = 4;
  CLOSE_VERB = 5;

  SaveLayerInitWithPrevious = 4;
  SaveLayerF16ColorType = 16;

  ShadowTransparentOccluder = 0x1;
  ShadowGeometricOnly = 0x2;
  ShadowDirectionalLight = 0x4;

  gpu = false;
  managed_skottie = false;
  particles = false;
  rt_effect = false;
  skottie = false;

  // Paragraph Constants
  NoDecoration = 0x0;
  UnderlineDecoration = 0x1;
  OverlineDecoration = 0x2;
  LineThroughDecoration = 0x4;

  // Paragraph Enums
  Affinity = Types.Affinity;
  DecorationStyle = Types.DecorationStyle;
  FontSlant = RNSkia.FontSlant;
  FontWeight = RNSkia.FontWeight;
  FontWidth = RNSkia.FontWidth;
  PlaceholderAlignment = Types.PlaceholderAlignment;
  RectHeightStyle = Types.RectHeightStyle;
  RectWidthStyle = Types.RectWidthStyle;
  TextAlign = Types.TextAlign;
  TextBaseline = Types.TextBaseline;
  TextDirection = Types.TextDirection;
  TextHeightBehavior = Types.TextHeightBehavior;
}

export default new CanvasKitNative();

//   // @ts-ignore
//   Malloc(typedArray: TypedArrayConstructor, len: number): MallocObj {
//     console.warn(`SkiaCanvasKit.Malloc not implemented!`);
//   },

//   // @ts-ignore
//   MallocGlyphIDs(len: number): MallocObj {
//     console.warn(`SkiaCanvasKit.MallocGlyphIDs not implemented!`);
//   },

//   Free(m: MallocObj): void {
//     console.warn(`SkiaCanvasKit.Free not implemented!`);
//   },

//   MakeCanvasSurface(canvas: HTMLCanvasElement | string): Surface | null {
//     throw new Error(`SkiaCanvasKit.MakeCanvasSurface not implemented!`);
//   },

//   MakeRasterDirectSurface(
//     ii: ImageInfo,
//     pixels: MallocObj,
//     bytesPerRow: number,
//     // @ts-ignore
//   ): Surface | null {
//     console.warn(`SkiaCanvasKit.MakeRasterDirectSurface not implemented!`);
//   },

//   // @ts-ignore
//   MakeSWCanvasSurface(canvas: HTMLCanvasElement | string): Surface | null {
//     console.warn(`SkiaCanvasKit.MakeSWCanvasSurface not implemented!`);
//   },

//   MakeWebGLCanvasSurface(
//     canvas: HTMLCanvasElement | string,
//     colorSpace?: ColorSpace,
//     opts?: WebGLOptions,
//     // @ts-ignore
//   ): Surface | null {
//     console.warn(`SkiaCanvasKit.MakeWebGLCanvasSurface not implemented!`);
//   },

//   // @ts-ignore
//   MakeSurface(width: number, height: number): Surface | null {
//     console.warn(`SkiaCanvasKit.MakeSurface not implemented!`);
//   },

//   GetWebGLContext(
//     canvas: HTMLCanvasElement,
//     opts?: WebGLOptions,
//     // @ts-ignore
//   ): WebGLContextHandle {
//     console.warn(`SkiaCanvasKit.GetWebGLContext not implemented!`);
//   },

//   // @ts-ignore
//   MakeGrContext(ctx: WebGLContextHandle): GrDirectContext {
//     console.warn(`SkiaCanvasKit.MakeGrContext not implemented!`);
//   },

//   MakeOnScreenGLSurface(
//     ctx: GrDirectContext,
//     width: number,
//     height: number,
//     colorSpace: ColorSpace,
//     // @ts-ignore
//   ): Surface | null {
//     console.warn(`SkiaCanvasKit.MakeOnScreenGLSurface not implemented!`);
//   },

//   MakeRenderTarget(
//     ctx: GrDirectContext,
//     width: number,
//     height: number,
//     // @ts-ignore
//   ): Surface | null {
//     console.warn(`SkiaCanvasKit.MakeRenderTarget not implemented!`);
//   },

//   // @ts-ignore
//   currentContext(): WebGLContextHandle {
//     console.warn(`SkiaCanvasKit.currentContext not implemented!`);
//   },

//   setCurrentContext(ctx: WebGLContextHandle): void {
//     console.warn(`SkiaCanvasKit.setCurrentContext not implemented!`);
//   },

//   deleteContext(ctx: WebGLContextHandle): void {
//     console.warn(`SkiaCanvasKit.deleteContext not implemented!`);
//   },

//   // @ts-ignore
//   getDecodeCacheLimitBytes(): number {
//     console.warn(`SkiaCanvasKit.getDecodeCacheLimitBytes not implemented!`);
//   },

//   // @ts-ignore
//   getDecodeCacheUsedBytes(): number {
//     console.warn(`SkiaCanvasKit.getDecodeCacheUsedBytes not implemented!`);
//   },

//   setDecodeCacheLimitBytes(size: number): void {
//     console.warn(`SkiaCanvasKit.setDecodeCacheLimitBytes not implemented!`);
//   },

//   MakeAnimatedImageFromEncoded(
//     bytes: Uint8Array | ArrayBuffer,
//     // @ts-ignore
//   ): AnimatedImage | null {
//     console.warn(`SkiaCanvasKit.MakeAnimatedImageFromEncoded not implemented!`);
//   },

//   // @ts-ignore
//   MakeCanvas(width: number, height: number): EmulatedCanvas2D {
//     console.warn(`SkiaCanvasKit.MakeCanvas not implemented!`);
//   },

//   MakeImage(
//     info: ImageInfo,
//     bytes: number[] | Uint8Array | Uint8ClampedArray,
//     bytesPerRow: number,
//     // @ts-ignore
//   ): SkiaImage | null {
//     console.warn(`SkiaCanvasKit.MakeImage not implemented!`);
//   },

//   MakeImageFromEncoded(bytes: Uint8Array | ArrayBuffer): SkiaImage | null {
//     const data = RNSkia.Skia.Data.fromBytes(new Uint8Array(bytes));
//     const img = RNSkia.Skia.MakeImageFromEncoded(data);

//     if (!img) {
//       return null;
//     }

//     return new SkiaImage(img);
//   },

//   // @ts-ignore
//   MakeImageFromCanvasImageSource(src: CanvasImageSource): SkiaImage {
//     console.warn(
//       `SkiaCanvasKit.MakeImageFromCanvasImageSource not implemented!`,
//     );
//   },

//   // @ts-ignore
//   MakePicture(bytes: Uint8Array | ArrayBuffer): SkPicture | null {
//     console.warn(`SkiaCanvasKit.MakePicture not implemented!`);
//   },

//   MakeVertices(
//     mode: VertexMode,
//     positions: InputFlattenedPointArray,
//     textureCoordinates?: InputFlattenedPointArray | null,
//     colors?: Float32Array | ColorIntArray | null,
//     indices?: number[] | null,
//     isVolatile?: boolean,
//     // @ts-ignore
//   ): Vertices {
//     console.warn(`SkiaCanvasKit.MakeVertices not implemented!`);
//   },

//   // @ts-ignore
//   MakeAnimation(json: string): SkottieAnimation {
//     console.warn(`SkiaCanvasKit.MakeAnimation not implemented!`);
//   },

//   MakeManagedAnimation(
//     json: string,
//     assets?: Record<string, ArrayBuffer>,
//     filterPrefix?: string,
//     soundMap?: SoundMap,
//     // @ts-ignore
//   ): ManagedSkottieAnimation {
//     console.warn(`SkiaCanvasKit.MakeManagedAnimation not implemented!`);
//   },

//   // @ts-ignore
//   MakeParticles(json: string, assets?: Record<string, ArrayBuffer>): Particles {
//     console.warn(`SkiaCanvasKit.MakeParticles not implemented!`);
//   },

//   // Misc
//   ColorMatrix: SkiaColorMatrix,
//   Matrix: SkiaMatrix,
//   M44: 0 as any,
//   Vector: 0 as any,
