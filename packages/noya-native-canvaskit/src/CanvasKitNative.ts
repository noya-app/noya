import * as RNSkia from '@shopify/react-native-skia';
import parseColor from 'color-parse';

import {
  ICanvasKit,
  IParagraphBuilderFactory,
  IShaderFactory,
} from 'canvaskit-types';
// import primitives separately for easier use
import type {
  Rect,
  Color,
  Point,
  Matrix,
  ColorArray,
  InputMatrix,
} from './types';
import { Colors, ParagraphDecoration } from './constants';
import {
  FontNative,
  toRNSMatrix,
  TextStyleNative,
  ParagraphStyleNative,
  TypefaceFactoryNative,
  TypefaceFontProviderFactoryNative,
} from './misc';
import ImageFilterFactoryNative from './ImageFilterNative';
import { ParagraphBuilderFactoryNative } from './ParagraphNative';
import { MatrixHelpers, ColorMatrixHelpers } from './MatrixHelpers';
import { ColorFilterFactoryNative } from './ColorFilterNative';
import { MaskFilterFactoryNative } from './MaskFilterNative';
import { RuntimeEffectFactoryNative } from './RuntimeEffectNative';
import ImageNative from './ImageNative';
import PaintNative from './PaintNative';
import PathNative from './PathNative';
import * as Types from './types';

class CanvasKitNative
  implements
    ICanvasKit<
      Color,
      Rect,
      Point,
      ColorArray,
      Matrix,
      InputMatrix,
      // @ts-ignore surfaces aren't used in native implementation
      RNSkia.ISurface
    >
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

  getColorComponents(color: number): number[] {
    const a = ((color & 0xff000000) >> 24) / 255.0;
    const r = ((color & 0x00ff0000) >> 16) / 255.0;
    const g = ((color & 0x0000ff00) >> 8) / 255.0;
    const b = (color & 0x000000ff) / 255.0;

    return [r, g, b, a];
  }

  parseColorString(color: string, colorMap?: object): Color {
    const {
      values: [r, g, b],
      alpha,
    } = parseColor(color);

    return this.Color(r, g, b, alpha);
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

  MakeCanvasSurface(canvas: HTMLCanvasElement | string): any {
    console.warn(`SkiaCanvasKit.MakeCanvasSurface not implemented!`);
  }

  MakeSurface(width: number, height: number): any {
    console.warn(`SkiaCanvasKit.MakeSurface not implemented!`);
  }

  MakeImageFromEncoded(bytes: Uint8Array | ArrayBuffer): ImageNative | null {
    const data = RNSkia.Skia.Data.fromBytes(new Uint8Array(bytes));
    const img = RNSkia.Skia.MakeImageFromEncoded(data);

    if (!img) {
      return null;
    }

    return new ImageNative(img);
  }

  Point(x: number, y: number): Point {
    return { x, y };
  }

  CreateMatrix(inMat: number[] | InputMatrix): Matrix {
    return toRNSMatrix(inMat)!;
  }

  CreateInputMatrix(inMat: number[]): InputMatrix {
    return inMat;
  }

  // Misc
  ColorMatrix = ColorMatrixHelpers;
  Matrix = MatrixHelpers;

  // Constructors, i.e. things made with `new CanvasKit.Foo()`;s
  ParagraphStyle = ParagraphStyleNative;
  ContourMeasureIter = 0 as any;
  Font = FontNative;
  Path = PathNative;
  Paint = PaintNative;
  TextStyle = TextStyleNative;

  // Factories, i.e. things made with CanvasKit.Foo.MakeTurboEncapsulator()
  ParagraphBuilder: IParagraphBuilderFactory<Color> =
    ParagraphBuilderFactoryNative;
  ColorFilter = ColorFilterFactoryNative;
  ImageFilter = ImageFilterFactoryNative;
  MaskFilter = MaskFilterFactoryNative;
  PathEffect = RNSkia.Skia.PathEffect;
  RuntimeEffect = RuntimeEffectFactoryNative;
  Shader: IShaderFactory<Color, Point, ColorArray, Matrix> = RNSkia.Skia.Shader;
  Typeface = TypefaceFactoryNative;
  TypefaceFontProvider = TypefaceFontProviderFactoryNative;

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
  TRANSPARENT = Colors.TRANSPARENT;
  BLACK = Colors.BLACK;
  WHITE = Colors.WHITE;
  RED = Colors.RED;
  GREEN = Colors.GREEN;
  BLUE = Colors.BLUE;
  YELLOW = Colors.YELLOW;
  CYAN = Colors.CYAN;
  MAGENTA = Colors.MAGENTA;

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

  // Paragraph Constants
  NoDecoration = ParagraphDecoration.NoDecoration;
  UnderlineDecoration = ParagraphDecoration.UnderlineDecoration;
  OverlineDecoration = ParagraphDecoration.OverlineDecoration;
  LineThroughDecoration = ParagraphDecoration.LineThroughDecoration;
}

export default new CanvasKitNative();
