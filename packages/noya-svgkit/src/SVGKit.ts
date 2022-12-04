import type {
  AnimatedImage,
  CanvasKit,
  Color,
  ColorInt,
  ColorIntArray,
  ColorSpace,
  EmulatedCanvas2D,
  FontMgr,
  GrDirectContext,
  Image,
  ImageInfo,
  InputFlattenedPointArray,
  InputMatrix,
  InputRect,
  InputVector3,
  IRect,
  MallocObj,
  ManagedSkottieAnimation,
  ParagraphStyle,
  Particles,
  Path,
  PathEffect,
  Rect,
  RRect,
  SkottieAnimation,
  SkPicture,
  SoundMap,
  Surface,
  TextStyle,
  TonalColorsInput,
  TonalColorsOutput,
  TypedArrayConstructor,
  VertexMode,
  Vertices,
  WebGLContextHandle,
  WebGLOptions,
} from 'canvaskit';
import parseColor from 'color-parse';
import { Embind, JSEmbindObject } from './Embind';
import { JSMaskFilter } from './JSMaskFilter';
import { JSPaint } from './JSPaint';
import { JSParagraphBuilder } from './JSParagraphBuilder';
import { JSShaderFactory } from './JSShaderFactory';

export type SerializableProperties<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

class JSParagraphStyle implements ParagraphStyle {}

class JSTextStyle implements TextStyle {}

class JSPathEffect extends JSEmbindObject implements PathEffect {
  static MakeCorner(radius: number): PathEffect | null {
    return new JSPathEffect();
  }

  static MakeDash(intervals: number[], phase?: number): PathEffect {
    return new JSPathEffect();
  }

  static MakeDiscrete(
    segLength: number,
    dev: number,
    seedAssist: number,
  ): PathEffect {
    return new JSPathEffect();
  }
}

export const SVGKit: CanvasKit = {
  Color(r: number, g: number, b: number, a?: number): Color {
    return new Float32Array([r / 255, g / 255, b / 255, a ?? 0]);
  },
  Color4f(r: number, g: number, b: number, a?: number): Color {
    return new Float32Array([r, g, b, a ?? 0]);
  },
  ColorAsInt(r: number, g: number, b: number, a?: number): ColorInt {
    throw new Error('Not implemented');
  },
  getColorComponents(c: Color): number[] {
    throw new Error('Not implemented');
  },
  parseColorString(color: string, colorMap?: object): Color {
    const [r, g, b, a = 1] = parseColor(color).values;

    return new Float32Array([r / 255, g / 255, b / 255, a]);
  },
  multiplyByAlpha(c: Color, alpha: number): Color {
    throw new Error('Not implemented');
  },
  computeTonalColors(colors: TonalColorsInput): TonalColorsOutput {
    throw new Error('Not implemented');
  },

  LTRBRect(left: number, top: number, right: number, bottom: number): Rect {
    return new Float32Array([left, top, right, bottom]);
  },
  XYWHRect(x: number, y: number, width: number, height: number): Rect {
    return new Float32Array([x, y, x + width, y + height]);
  },
  LTRBiRect(left: number, top: number, right: number, bottom: number): IRect {
    return new Int32Array([left, top, right, bottom]);
  },

  XYWHiRect(x: number, y: number, width: number, height: number): IRect {
    return new Int32Array([x, y, x + width, y + height]);
  },
  RRectXY(rect: InputRect, rx: number, ry: number): RRect {
    const corners = new Float32Array([rx, ry, rx, ry, rx, ry, rx, ry]);

    const rrect = new Float32Array(rect.length + corners.length);
    rrect.set(rect as Float32Array);
    rrect.set(corners, rect.length);

    return rrect;
  },
  getShadowLocalBounds(
    ctm: InputMatrix,
    path: Path,
    zPlaneParams: InputVector3,
    lightPos: InputVector3,
    lightRadius: number,
    flags: number,
    dstRect?: Rect,
  ): Rect | null {
    throw new Error('Not implemented');
  },
  Malloc(typedArray: TypedArrayConstructor, len: number): MallocObj {
    throw new Error('Not implemented');
  },
  MallocGlyphIDs(len: number): MallocObj {
    throw new Error('Not implemented');
  },
  Free(m: MallocObj): void {},
  MakeCanvasSurface(canvas: HTMLCanvasElement | string): Surface | null {
    throw new Error('Not implemented');
  },
  MakeRasterDirectSurface(
    ii: ImageInfo,
    pixels: MallocObj,
    bytesPerRow: number,
  ): Surface | null {
    throw new Error('Not implemented');
  },
  MakeSWCanvasSurface(canvas: HTMLCanvasElement | string): Surface | null {
    throw new Error('Not implemented');
  },
  MakeWebGLCanvasSurface(
    canvas: HTMLCanvasElement | string,
    colorSpace?: ColorSpace,
    opts?: WebGLOptions,
  ): Surface | null {
    throw new Error('Not implemented');
  },
  MakeSurface(width: number, height: number): Surface | null {
    throw new Error('Not implemented');
  },
  GetWebGLContext(
    canvas: HTMLCanvasElement,
    opts?: WebGLOptions,
  ): WebGLContextHandle {
    throw new Error('Not implemented');
  },
  MakeGrContext(ctx: WebGLContextHandle): GrDirectContext {
    throw new Error('Not implemented');
  },
  MakeOnScreenGLSurface(
    ctx: GrDirectContext,
    width: number,
    height: number,
    colorSpace: ColorSpace,
  ): Surface | null {
    throw new Error('Not implemented');
  },
  MakeRenderTarget(
    ...args:
      | [ctx: GrDirectContext, info: ImageInfo]
      | [ctx: GrDirectContext, width: number, height: number]
  ): Surface | null {
    throw new Error('Not implemented');
  },
  currentContext(): WebGLContextHandle {
    throw new Error('Not implemented');
  },
  setCurrentContext(ctx: WebGLContextHandle): void {
    throw new Error('Not implemented');
  },
  deleteContext(ctx: WebGLContextHandle): void {
    throw new Error('Not implemented');
  },
  getDecodeCacheLimitBytes(): number {
    throw new Error('Not implemented');
  },
  getDecodeCacheUsedBytes(): number {
    throw new Error('Not implemented');
  },
  setDecodeCacheLimitBytes(size: number): void {
    throw new Error('Not implemented');
  },
  MakeAnimatedImageFromEncoded(
    bytes: Uint8Array | ArrayBuffer,
  ): AnimatedImage | null {
    throw new Error('Not implemented');
  },
  MakeCanvas(width: number, height: number): EmulatedCanvas2D {
    throw new Error('Not implemented');
  },
  MakeImage(
    info: ImageInfo,
    bytes: number[] | Uint8Array | Uint8ClampedArray,
    bytesPerRow: number,
  ): Image | null {
    throw new Error('Not implemented');
  },
  MakeImageFromEncoded(bytes: Uint8Array | ArrayBuffer): Image | null {
    throw new Error('Not implemented');
  },
  MakeImageFromCanvasImageSource(src: CanvasImageSource): Image {
    throw new Error('Not implemented');
  },
  MakePicture(bytes: Uint8Array | ArrayBuffer): SkPicture | null {
    throw new Error('Not implemented');
  },
  MakeVertices(
    mode: VertexMode,
    positions: InputFlattenedPointArray,
    textureCoordinates?: InputFlattenedPointArray | null,
    colors?: Float32Array | ColorIntArray | null,
    indices?: number[] | null,
    isVolatile?: boolean,
  ): Vertices {
    throw new Error('Not implemented');
  },
  MakeAnimation(json: string): SkottieAnimation {
    throw new Error('Not implemented');
  },
  MakeManagedAnimation(
    json: string,
    assets?: Record<string, ArrayBuffer>,
    filterPrefix?: string,
    soundMap?: SoundMap,
  ): ManagedSkottieAnimation {
    throw new Error('Not implemented');
  },
  MakeParticles(json: string, assets?: Record<string, ArrayBuffer>): Particles {
    throw new Error('Not implemented');
  },

  // Constructors, i.e. things made with `new CanvasKit.Foo()`;
  ImageData: 0 as any,
  ParagraphStyle: JSParagraphStyle,
  ContourMeasureIter: 0 as any,
  Font: 0 as any,
  Paint: JSPaint,
  Path: 0 as any, // This gets replaced later
  PictureRecorder: 0 as any,
  TextStyle: JSTextStyle,

  // Factories, i.e. things made with CanvasKit.Foo.MakeTurboEncapsulator()
  ParagraphBuilder: JSParagraphBuilder,
  ColorFilter: 0 as any,
  FontMgr: {
    FromData(...buffers: ArrayBuffer[]): FontMgr | null {
      return {} as FontMgr;
    },
    RefDefault(): FontMgr {
      return {} as FontMgr;
    },
  },
  ImageFilter: 0 as any,
  MaskFilter: JSMaskFilter,
  PathEffect: JSPathEffect,
  RuntimeEffect: 0 as any,
  Shader: JSShaderFactory,
  TextBlob: 0 as any,
  Typeface: 0 as any,
  TypefaceFontProvider: 0 as any,

  // Misc
  ColorMatrix: 0 as any,
  Matrix: 0 as any,
  M44: 0 as any,
  Vector: 0 as any,

  // Core Enums
  AlphaType: Embind.createEnum(['Opaque', 'Premul', 'Unpremul']),
  BlendMode: Embind.createEnum([
    'Clear',
    'Src',
    'Dst',
    'SrcOver',
    'DstOver',
    'SrcIn',
    'DstIn',
    'SrcOut',
    'DstOut',
    'SrcATop',
    'DstATop',
    'Xor',
    'Plus',
    'Modulate',
    'Screen',
    'Overlay',
    'Darken',
    'Lighten',
    'ColorDodge',
    'ColorBurn',
    'HardLight',
    'SoftLight',
    'Difference',
    'Exclusion',
    'Multiply',
    'Hue',
    'Saturation',
    'Color',
    'Luminosity',
  ]),
  BlurStyle: Embind.createEnum(['Normal', 'Solid', 'Outer', 'Inner']),
  ClipOp: Embind.createEnum(['Difference', 'Intersect']),
  ColorType: Embind.createEnum([
    'Alpha_8',
    'RGB_565',
    'RGBA_8888',
    'BGRA_8888',
    'RGBA_1010102',
    'RGB_101010x',
    'Gray_8',
    'RGBA_F16',
    'RGBA_F32',
  ]),
  FillType: Embind.createEnum(['Winding', 'EvenOdd']),
  FilterMode: Embind.createEnum(['Linear', 'Nearest']),
  FontEdging: Embind.createEnum(['Alias', 'AntiAlias', 'SubpixelAntiAlias']),
  FontHinting: Embind.createEnum(['None', 'Slight', 'Normal', 'Full']),
  GlyphRunFlags: {
    IsWhiteSpace: 1,
  },
  ImageFormat: Embind.createEnum(['PNG', 'JPEG', 'WEBP']),
  MipmapMode: Embind.createEnum(['None', 'Nearest', 'Linear']),
  PaintStyle: Embind.createEnum(['Fill', 'Stroke']),
  PathOp: Embind.createEnum([
    'Difference',
    'Intersect',
    'Union',
    'XOR',
    'ReverseDifference',
  ]),
  PointMode: Embind.createEnum(['Points', 'Lines', 'Polygon']),
  ColorSpace: 0 as any,
  // ColorSpace: class ColorSpace extends JSEmbindObject {

  //     'SRGB' = Embind .createEnumEntity(0)
  //     'DISPLAY_P3' = Embind .createEnumEntity(1)
  //     'ADOBE_RGB' = Embind.createEnumEntity(2)

  //     Equals(a, b) {
  //       return true;
  //     },
  // },
  StrokeCap: Embind.createEnum(['Butt', 'Round', 'Square']),
  StrokeJoin: Embind.createEnum(['Bevel', 'Miter', 'Round']),
  TileMode: Embind.createEnum(['Clamp', 'Decal', 'Mirror', 'Repeat']),
  VertexMode: Embind.createEnum(['Triangles', 'TrianglesStrip', 'TriangleFan']),

  // // Core Constants
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
  Affinity: Embind.createEnum(['Upstream', 'Downstream']),
  DecorationStyle: Embind.createEnum([
    'Solid',
    'Double',
    'Dotted',
    'Dashed',
    'Wavy',
  ]),
  FontSlant: Embind.createEnum(['Upright', 'Italic', 'Oblique']),
  FontWeight: Embind.createEnum([
    'Invisible',
    'Thin',
    'ExtraLight',
    'Light',
    'Normal',
    'Medium',
    'SemiBold',
    'Bold',
    'ExtraBold',
    'Black',
    'ExtraBlack',
  ]),
  FontWidth: Embind.createEnum([
    'UltraCondensed',
    'ExtraCondensed',
    'Condensed',
    'SemiCondensed',
    'Normal',
    'SemiExpanded',
    'Expanded',
    'ExtraExpanded',
    'UltraExpanded',
  ]),
  PlaceholderAlignment: Embind.createEnum([
    'Baseline',
    'AboveBaseline',
    'BelowBaseline',
    'Top',
    'Bottom',
    'Middle',
  ]),
  RectHeightStyle: Embind.createEnum([
    'Tight',
    'Max',
    'IncludeLineSpacingMiddle',
    'IncludeLineSpacingTop',
    'IncludeLineSpacingBottom',
    'Strut',
  ]),
  RectWidthStyle: Embind.createEnum(['Tight', 'Max']),
  TextAlign: Embind.createEnum([
    'Left',
    'Right',
    'Center',
    'Justify',
    'Start',
    'End',
  ]),
  TextBaseline: Embind.createEnum(['Alphabetic', 'Ideographic']),
  TextDirection: Embind.createEnum(['LTR', 'RTL']),
  TextHeightBehavior: Embind.createEnum([
    'All',
    'DisableFirstAscent',
    'DisableLastDescent',
    'DisableAll',
  ]),

  // Paragraph Constants
  NoDecoration: 0x0,
  UnderlineDecoration: 0x1,
  OverlineDecoration: 0x2,
  LineThroughDecoration: 0x4,
};

// Constructors, i.e. things made with `new CanvasKit.Foo()`;
// readonly ImageData: ImageDataConstructor;
// readonly ContourMeasureIter: ContourMeasureIterConstructor;
// readonly Font: FontConstructor;
// readonly Path: PathConstructorAndFactory;
// readonly PictureRecorder: DefaultConstructor<PictureRecorder>;
// readonly TextStyle: TextStyleConstructor;

// Factories, i.e. things made with CanvasKit.Foo.MakeTurboEncapsulator()
// readonly ParagraphBuilder: ParagraphBuilderFactory;
// readonly ColorFilter: ColorFilterFactory;
// readonly FontMgr: FontMgrFactory;
// readonly ImageFilter: ImageFilterFactory;
// readonly PathEffect: PathEffectFactory;
// readonly RuntimeEffect: RuntimeEffectFactory;
// readonly Shader: ShaderFactory;
// readonly TextBlob: TextBlobFactory;
// readonly fontManager: IFontManagerFactory;

// Misc
// readonly ColorMatrix: ColorMatrixHelpers;
// readonly Matrix: Matrix3x3Helpers;
// readonly M44: Matrix4x4Helpers;
// readonly Vector: VectorHelpers;
