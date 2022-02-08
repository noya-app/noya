import type {
  // AnimatedImage,
  CanvasKit,
  // Color,
  // ColorInt,
  // ColorIntArray,
  // ColorSpace,
  // EmulatedCanvas2D,
  // FontMgr,
  GrDirectContext,
  // Image,
  ImageInfo,
  // InputFlattenedPointArray,
  // InputMatrix,
  // InputRect,
  // InputVector3,
  // IRect,
  // MallocObj,
  // ManagedSkottieAnimation,
  ParagraphStyle,
  // Particles,
  // Path,
  // Rect,
  // RRect,
  // SkottieAnimation,
  // SkPicture,
  // SoundMap,
  // Surface,
  TextStyle,
  // TonalColorsInput,
  // TonalColorsOutput,
  // TypedArrayConstructor,
  // VertexMode,
  // Vertices,
  // WebGLContextHandle,
  // WebGLOptions,
} from 'canvaskit';
import parseColor from 'color-parse';
import { Embind } from './Embind';
import { SkiaPaintWrapper } from './SkiaPaint';
import { SkiaImageFilterFactory } from './SkiaImageFilter';
import { SkiaTypefaceFontProviderFactory } from './TypefaceFontProvider';
import { SkiaParagraphBuilder } from './SkiaParagraphBuilder';
import { SkiaPathEffect } from './SkiaPathEffect';

class JSParagraphStyle implements ParagraphStyle {}

class JSTextStyle implements TextStyle {}

export const SkiaCanvasKit: CanvasKit = {
  Color(r, g, b, a) {
    return new Float32Array([r / 255, g / 255, b / 255, a ?? 0]);
  },
  Color4f(r, g, b, a) {
    return new Float32Array([r, g, b, a ?? 0]);
  },
  ColorAsInt(r, g, b, a) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  getColorComponents(c) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  parseColorString(color, colorMap) {
    const [r, g, b, a = 1] = parseColor(color).values;

    return new Float32Array([r / 255, g / 255, b / 255, a]);
  },
  multiplyByAlpha(color, alpha) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  computeTonalColors(colors) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  LTRBRect(left, top, right, bottom) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  XYWHRect(x, y, width, height) {
    return new Float32Array([x, y, x + width, y + height]);
  },
  LTRBiRect(left, top, right, bottom) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  XYWHiRect(x, y, width, height) {
    return new Int32Array([x, y, x + width, y + height]);
  },
  RRectXY(rect, rx, ry) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  getShadowLocalBounds(
    ctm,
    path,
    zPlaneParams,
    lightPos,
    lightRadius,
    flags,
    dstRect,
  ) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  Malloc(typedArray, len) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MallocGlyphIDs(len) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  Free(m) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeCanvasSurface(canvas) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeRasterDirectSurface(ii, pixels, bytesPerRow) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeSWCanvasSurface(canvas) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeWebGLCanvasSurface(canvas, colorSpace, opts) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeSurface(width, height) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  GetWebGLContext(canvas, opts) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeGrContext(ctx) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeOnScreenGLSurface(ctx, width, height, colorSpace) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeRenderTarget(
    ...args:
      | [ctx: GrDirectContext, info: ImageInfo]
      | [ctx: GrDirectContext, width: number, height: number]
  ) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  currentContext() {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  setCurrentContext(ctx) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  deleteContext(ctx) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  getDecodeCacheLimitBytes() {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  getDecodeCacheUsedBytes() {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  setDecodeCacheLimitBytes(size) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeAnimatedImageFromEncoded(bytes) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeCanvas(width, height) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeImage(info, bytes, bytesPerRow) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeImageFromEncoded(bytes) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeImageFromCanvasImageSource(src) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakePicture(bytes) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeVertices(
    mode,
    positions,
    textureCoordinates,
    colors,
    indices,
    isVolatile,
  ) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeAnimation(json) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeManagedAnimation(json, assets, filterPrefix, soundMap) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
  MakeParticles(json, assets) {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },

  // Constructors, i.e. things made with `new CanvasKit.Foo()`;s
  ImageData: 0 as any,
  ParagraphStyle: JSParagraphStyle,
  ContourMeasureIter: 0 as any,
  Font: 0 as any,
  Paint: SkiaPaintWrapper,

  Path: 0 as any,
  PictureRecorder: 0 as any,
  TextStyle: JSTextStyle,

  // Factories, i.e. things made with CanvasKit.Foo.MakeTurboEncapsulator()
  ParagraphBuilder: SkiaParagraphBuilder,
  ColorFilter: 0 as any,
  FontMgr: 0 as any,
  ImageFilter: new SkiaImageFilterFactory(),
  MaskFilter: 0 as any,
  PathEffect: SkiaPathEffect,
  RuntimeEffect: 0 as any,
  Shader: 0 as any,
  TextBlob: 0 as any,
  Typeface: 0 as any,
  TypefaceFontProvider: new SkiaTypefaceFontProviderFactory(),

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
