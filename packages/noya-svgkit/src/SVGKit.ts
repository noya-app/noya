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
  RuntimeEffect,
  Shader,
  SkottieAnimation,
  SkPicture,
  SkSLUniform,
  SoundMap,
  Surface,
  TextStyle,
  TonalColorsInput,
  TonalColorsOutput,
  TypedArrayConstructor,
  TypefaceFontProvider,
  VertexMode,
  Vertices,
  WebGLContextHandle,
  WebGLOptions,
} from '@noya-app/noya-canvaskit';
import { constants } from './constants';
import { JSEmbindObject } from './Embind';
import { JSMaskFilter } from './JSMaskFilter';
import { JSPaint } from './JSPaint';
import { JSParagraphBuilder } from './JSParagraphBuilder';
import { JSShaderFactory } from './JSShaderFactory';
import parseColor from './parseColor';

class JSParagraphStyle implements ParagraphStyle {
  constructor(ps: ParagraphStyle) {
    Object.assign(this, ps);
  }
}

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

class JSTypefaceFontProvider
  extends JSEmbindObject
  implements TypefaceFontProvider
{
  static Make(): TypefaceFontProvider {
    return new JSTypefaceFontProvider();
  }

  registerFont(bytes: Uint8Array | ArrayBuffer, family: string): void {}
}

class JSShader extends JSEmbindObject implements Shader {}

class JSRuntimeEffect extends JSEmbindObject implements RuntimeEffect {
  static Make(
    sksl: string,
    callback?: ((err: string) => void) | undefined,
  ): RuntimeEffect | null {
    return new JSRuntimeEffect();
  }

  makeShader(
    uniforms: number[] | Float32Array,
    isOpaque?: boolean | undefined,
    localMatrix?: InputMatrix | undefined,
  ): Shader {
    return new JSShader();
  }

  makeShaderWithChildren(
    uniforms: number[] | Float32Array,
    isOpaque?: boolean | undefined,
    children?: Shader[] | undefined,
    localMatrix?: InputMatrix | undefined,
  ): Shader {
    throw new Error('Method not implemented.');
  }

  getUniform(index: number): SkSLUniform {
    throw new Error('Method not implemented.');
  }

  getUniformCount(): number {
    throw new Error('Method not implemented.');
  }

  getUniformFloatCount(): number {
    throw new Error('Method not implemented.');
  }

  getUniformName(index: number): string {
    throw new Error('Method not implemented.');
  }
}

export const SVGKit: CanvasKit = {
  ...constants,

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
    const {
      values: [r, g, b],
      alpha,
    } = parseColor(color);

    return new Float32Array([r / 255, g / 255, b / 255, alpha]);
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
  RuntimeEffect: JSRuntimeEffect,
  Shader: JSShaderFactory,
  TextBlob: 0 as any,
  Typeface: 0 as any,
  TypefaceFontProvider: JSTypefaceFontProvider,

  // Misc
  ColorMatrix: 0 as any,
  Matrix: 0 as any,
  M44: 0 as any,
  Vector: 0 as any,
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
