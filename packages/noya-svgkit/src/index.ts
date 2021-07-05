/* eslint-disable @typescript-eslint/no-use-before-define */
import type {
  AnimatedImage,
  BlendMode,
  BlurStyle,
  CanvasKit,
  Color,
  ColorFilter,
  ColorInt,
  ColorIntArray,
  ColorSpace,
  EmbindEnum,
  EmbindEnumEntity,
  EmulatedCanvas2D,
  GrDirectContext,
  Image,
  ImageFilter,
  ImageInfo,
  InputColor,
  InputFlattenedPointArray,
  InputMatrix,
  InputRect,
  InputVector3,
  IRect,
  MallocObj,
  ManagedSkottieAnimation,
  MaskFilter,
  Paint,
  PaintStyle,
  Particles,
  Path,
  PathEffect,
  Rect,
  RRect,
  Shader,
  SkottieAnimation,
  SkPicture,
  SoundMap,
  StrokeCap,
  StrokeJoin,
  Surface,
  TonalColorsInput,
  TonalColorsOutput,
  TypedArrayConstructor,
  VertexMode,
  Vertices,
  WebGLContextHandle,
  WebGLOptions,
} from 'canvaskit';

import parseColor from 'color-parse';

class JSEmbindObject {
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

const Embind = {
  createEnumEntity(value: number): EmbindEnumEntity {
    return { value };
  },
  createEnum<K extends string>(
    caseNames: K[],
  ): EmbindEnum & Record<K, EmbindEnumEntity> {
    const entries = caseNames.map(
      (name, index) => [name, this.createEnumEntity(index)] as const,
    );
    const cases = Object.fromEntries(entries) as Record<K, EmbindEnumEntity>;

    return {
      ...cases,
      values: Object.values(cases),
    };
  },
};

type SerializableProperties<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

class JSMaskFilter extends JSEmbindObject implements MaskFilter {
  static MakeBlur(
    style: BlurStyle,
    sigma: number,
    respectCTM: boolean,
  ): MaskFilter {
    return new JSMaskFilter();
  }
}

class JSPaint extends JSEmbindObject implements Paint {
  _antiAlias: boolean = true;
  _alpha: number = 1;
  _blendMode: BlendMode = SVGKit.BlendMode.Clear;
  _color: Color = SVGKit.BLACK;
  _strokeCap: StrokeCap = SVGKit.StrokeCap.Butt;
  _strokeJoin: StrokeJoin = SVGKit.StrokeJoin.Bevel;
  _strokeMiter: number = 0;
  _strokeWidth: number = 0;
  _style: PaintStyle = SVGKit.PaintStyle.Fill;

  copy(): Paint {
    const properties: SerializableProperties<JSPaint> = {
      _isDeleted: this._isDeleted,
      _antiAlias: this._antiAlias,
      _alpha: this._alpha,
      _blendMode: this._blendMode,
      _color: this._color,
      _strokeCap: this._strokeCap,
      _strokeJoin: this._strokeJoin,
      _strokeMiter: this._strokeMiter,
      _strokeWidth: this._strokeWidth,
      _style: this._style,
    };

    const copy = new JSPaint();

    Object.assign(copy, properties);

    return copy as any;
  }

  getBlendMode(): BlendMode {
    return this._blendMode;
  }

  getColor(): Color {
    return this._color;
  }

  getStrokeCap(): StrokeCap {
    return this._strokeCap;
  }

  getStrokeJoin(): StrokeJoin {
    return this._strokeJoin;
  }

  getStrokeMiter(): number {
    return this._strokeMiter;
  }

  getStrokeWidth(): number {
    return this._strokeWidth;
  }

  setAlphaf(alpha: number): void {
    this._alpha = alpha;
  }

  setAntiAlias(aa: boolean): void {
    this._antiAlias = aa;
  }

  setBlendMode(mode: BlendMode): void {
    this._blendMode = mode;
  }

  setColor(color: InputColor, colorSpace?: ColorSpace): void {
    // Ignore MallocObj
    const typedColor = color as Float32Array | number[];

    this._color =
      typedColor instanceof Array ? new Float32Array(typedColor) : typedColor;
  }

  setColorComponents(
    r: number,
    g: number,
    b: number,
    a: number,
    colorSpace?: ColorSpace,
  ): void {
    throw new Error('Not implemented');
  }

  setColorFilter(filter: ColorFilter): void {
    console.info('setColorFilter() not implemented by SVGKit');
  }

  setColorInt(color: ColorInt, colorSpace?: ColorSpace): void {
    throw new Error('Not implemented');
  }

  setImageFilter(filter: ImageFilter): void {
    console.info('setImageFilter() not implemented by SVGKit');
  }

  setMaskFilter(filter: MaskFilter): void {
    console.info('setMaskFilter() not implemented by SVGKit');
  }

  setPathEffect(effect: PathEffect): void {
    console.info('setPathEffect() not implemented by SVGKit');
  }

  setShader(shader: Shader): void {
    console.info('setShader() not implemented by SVGKit');
  }

  setStrokeCap(cap: StrokeCap): void {
    this._strokeCap = cap;
  }

  setStrokeJoin(join: StrokeJoin): void {
    this._strokeJoin = join;
  }

  setStrokeMiter(limit: number): void {
    this._strokeMiter = limit;
  }

  setStrokeWidth(width: number): void {
    this._strokeWidth = width;
  }

  setStyle(style: PaintStyle): void {
    this._style = style;
  }
}

const SVGKit: CanvasKit = {
  Color(r: number, g: number, b: number, a?: number): Color {
    return new Float32Array([r, g, b, a ?? 0]);
  },
  Color4f(r: number, g: number, b: number, a?: number): Color {
    return SVGKit.Color(r, g, b, a);
  },
  ColorAsInt(r: number, g: number, b: number, a?: number): ColorInt {
    throw new Error('Not implemented');
  },
  getColorComponents(c: Color): number[] {
    throw new Error('Not implemented');
  },
  parseColorString(color: string, colorMap?: object): Color {
    const components = parseColor(color).values;

    return new Float32Array(
      components.length === 3 ? [...components, 1] : components,
    );
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
  ParagraphStyle: 0 as any,
  ContourMeasureIter: 0 as any,
  Font: 0 as any,
  Paint: JSPaint,
  Path: 0 as any,
  PictureRecorder: 0 as any,
  TextStyle: 0 as any,

  // Factories, i.e. things made with CanvasKit.Foo.MakeTurboEncapsulator()
  ParagraphBuilder: 0 as any,
  ColorFilter: 0 as any,
  FontMgr: 1 as any,
  ImageFilter: 0 as any,
  MaskFilter: JSMaskFilter,
  PathEffect: 0 as any,
  RuntimeEffect: 0 as any,
  Shader: 0 as any,
  TextBlob: 0 as any,
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
  FilterQuality: Embind.createEnum(['None', 'Low', 'Medium', 'High']),
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

export default SVGKit;

// Constructors, i.e. things made with `new CanvasKit.Foo()`;
// readonly ImageData: ImageDataConstructor;
// readonly ParagraphStyle: ParagraphStyleConstructor;
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
// readonly TypefaceFontProvider: TypefaceFontProviderFactory;

// Misc
// readonly ColorMatrix: ColorMatrixHelpers;
// readonly Matrix: Matrix3x3Helpers;
// readonly M44: Matrix4x4Helpers;
// readonly Vector: VectorHelpers;
