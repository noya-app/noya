import type {
  // AnimatedImage,
  CanvasKit,
  // Color,
  // ColorInt,
  // ColorIntArray,
  // ColorSpace,
  EmbindEnum,
  EmbindEnumEntity,
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
  // PathEffect,
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
// import { Skia } from '@shopify/react-native-skia';

// Copied from svgkit
export class JSEmbindObject {
  _isDeleted = false;
  clone() {
    return this;
  }
  delete() {
    this._isDeleted = false;
  }
  deleteAfter() {
    throw new Error('Not implemented');
  }
  isAliasOf(other: any) {
    return this === other;
  }
  isDeleted() {
    return this._isDeleted;
  }
}

function createEnumEntity(value: number): EmbindEnumEntity {
  return { value };
}

function createEnum<K extends string>(
  caseNames: K[],
): EmbindEnum & Record<K, EmbindEnumEntity> {
  const entries = caseNames.map(
    (name, index) => [name, createEnumEntity(index)] as const,
  );
  const cases = Object.fromEntries(entries) as Record<K, EmbindEnumEntity>;

  return {
    ...cases,
    values: Object.values(cases),
  };
}

const Embind = {
  createEnumEntity,
  createEnum,
};

class JSParagraphStyle implements ParagraphStyle {}

class JSTextStyle implements TextStyle {}

export const SkiaKit: CanvasKit = {
  Color(r, g, b, a) {
    throw new Error('Not implemented');
  },
  Color4f(r, g, b, a) {
    throw new Error('Not implemented');
  },
  ColorAsInt(r, g, b, a) {
    throw new Error('Not implemented');
  },
  getColorComponents(c) {
    throw new Error('Not implemented');
  },
  parseColorString(color, colorMap) {
    throw new Error('Not implemented');
  },
  multiplyByAlpha(color, alpha) {
    throw new Error('Not implemented');
  },
  computeTonalColors(colors) {
    throw new Error('Not implemented');
  },
  LTRBRect(left, top, right, bottom) {
    throw new Error('Not implemented');
  },
  XYWHRect(x, y, width, height) {
    return new Float32Array([x, y, x + width, y + height]);
  },
  LTRBiRect(left, top, right, bottom) {
    throw new Error('Not implemented');
  },
  XYWHiRect(x, y, width, height) {
    return new Int32Array([x, y, x + width, y + height]);
  },
  RRectXY(rect, rx, ry) {
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
  },
  Malloc(typedArray, len) {
    throw new Error('Not implemented');
  },
  MallocGlyphIDs(len) {
    throw new Error('Not implemented');
  },
  Free(m) {
    throw new Error('Not implemented');
  },
  MakeCanvasSurface(canvas) {
    throw new Error('Not implemented');
  },
  MakeRasterDirectSurface(ii, pixels, bytesPerRow) {
    throw new Error('Not implemented');
  },
  MakeSWCanvasSurface(canvas) {
    throw new Error('Not implemented');
  },
  MakeWebGLCanvasSurface(canvas, colorSpace, opts) {
    throw new Error('Not implemented');
  },
  MakeSurface(width, height) {
    throw new Error('Not implemented');
  },
  GetWebGLContext(canvas, opts) {
    throw new Error('Not implemented');
  },
  MakeGrContext(ctx) {
    throw new Error('Not implemented');
  },
  MakeOnScreenGLSurface(ctx, width, height, colorSpace) {
    throw new Error('Not implemented');
  },
  MakeRenderTarget(
    ...args:
      | [ctx: GrDirectContext, info: ImageInfo]
      | [ctx: GrDirectContext, width: number, height: number]
  ) {
    throw new Error('Not implemented');
  },
  currentContext() {
    throw new Error('Not implemented');
  },
  setCurrentContext(ctx) {
    throw new Error('Not implemented');
  },
  deleteContext(ctx) {
    throw new Error('Not implemented');
  },
  getDecodeCacheLimitBytes() {
    throw new Error('Not implemented');
  },
  getDecodeCacheUsedBytes() {
    throw new Error('Not implemented');
  },
  setDecodeCacheLimitBytes(size) {
    throw new Error('Not implemented');
  },
  MakeAnimatedImageFromEncoded(bytes) {
    throw new Error('Not implemented');
  },
  MakeCanvas(width, height) {
    throw new Error('Not implemented');
  },
  MakeImage(info, bytes, bytesPerRow) {
    throw new Error('Not implemented');
  },
  MakeImageFromEncoded(bytes) {
    throw new Error('Not implemented');
  },
  MakeImageFromCanvasImageSource(src) {
    throw new Error('Not implemented');
  },
  MakePicture(bytes) {
    throw new Error('Not implemented');
  },
  MakeVertices(
    mode,
    positions,
    textureCoordinates,
    colors,
    indices,
    isVolatile,
  ) {
    throw new Error('Not implemented');
  },
  MakeAnimation(json) {
    throw new Error('Not implemented');
  },
  MakeManagedAnimation(json, assets, filterPrefix, soundMap) {
    throw new Error('Not implemented');
  },
  MakeParticles(json, assets) {
    throw new Error('Not implemented');
  },

  // Constructors, i.e. things made with `new CanvasKit.Foo()`;
  ImageData: 0 as any,
  ParagraphStyle: JSParagraphStyle,
  ContourMeasureIter: 0 as any,
  Font: 0 as any,
  Paint: 0 as any,
  // Path: class SkiaPath {
  //   // MakeFromCmds
  //   moveTo(x, y) {}
  // },

  Path: 0 as any,
  PictureRecorder: 0 as any,
  TextStyle: JSTextStyle,

  // Factories, i.e. things made with CanvasKit.Foo.MakeTurboEncapsulator()
  ParagraphBuilder: 0 as any,
  ColorFilter: 0 as any,
  FontMgr: 0 as any,
  ImageFilter: 0 as any,
  MaskFilter: 0 as any,
  PathEffect: 0 as any,
  RuntimeEffect: 0 as any,
  Shader: 0 as any,
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
