import * as RNSkia from '@shopify/react-native-skia';
import parseColor from 'color-parse';

import { ICanvasKit, IShaderFactory } from 'canvaskit-types';
// import primitives separately for easier use
import type { Color, Rect, Point, ColorArray, Matrix } from './types';
import PaintNative from './PaintNative';
import PathNative from './PathNative';
import * as Types from './types';

class CanvasKitNative
  implements ICanvasKit<Color, Rect, Point, ColorArray, Matrix>
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

  //   MakeCanvasSurface(canvas: HTMLCanvasElement | string): Surface | null {
  //     throw new Error(`SkiaCanvasKit.MakeCanvasSurface not implemented!`);
  //   },

  //   // @ts-ignore
  //   MakeSurface(width: number, height: number): Surface | null {
  //     console.warn(`SkiaCanvasKit.MakeSurface not implemented!`);
  //   },

  //   MakeImageFromEncoded(bytes: Uint8Array | ArrayBuffer): SkiaImage | null {
  //     const data = RNSkia.Skia.Data.fromBytes(new Uint8Array(bytes));
  //     const img = RNSkia.Skia.MakeImageFromEncoded(data);

  //     if (!img) {
  //       return null;
  //     }

  //     return new SkiaImage(img);
  //   },

  //   // Misc
  //   ColorMatrix: SkiaColorMatrix,
  //   Matrix: SkiaMatrix,
  //   M44: 0 as any,
  //   Vector: 0 as any,

  // Constructors, i.e. things made with `new CanvasKit.Foo()`;s
  ImageData = 0 as any;
  //   ParagraphStyle: SkiaParagraphStyle,
  ContourMeasureIter = 0 as any;
  //   Font: SkiaFont,
  Path = PathNative;
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
  NoDecoration = 0x0;
  UnderlineDecoration = 0x1;
  OverlineDecoration = 0x2;
  LineThroughDecoration = 0x4;
}

export default new CanvasKitNative();
