import {
  BlendMode,
  Color,
  ColorFilter,
  ColorInt,
  ColorSpace,
  ImageFilter,
  InputColor,
  MaskFilter,
  Paint,
  PaintStyle,
  PathEffect,
  Shader,
  StrokeCap,
  StrokeJoin,
} from '@noya-app/noya-canvaskit';
import { constants } from './constants';
import { JSEmbindObject } from './Embind';

type SerializableProperties<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export class JSPaint extends JSEmbindObject implements Paint {
  _antiAlias: boolean = true;
  _alpha: number = 1;
  _blendMode: BlendMode = constants.BlendMode.Clear;
  _color: Color = constants.BLACK;
  _strokeCap: StrokeCap = constants.StrokeCap.Butt;
  _strokeJoin: StrokeJoin = constants.StrokeJoin.Bevel;
  _strokeMiter: number = 0;
  _strokeWidth: number = 0;
  _style: PaintStyle = constants.PaintStyle.Fill;
  _shader?: Shader;

  copy(): Paint {
    const properties: SerializableProperties<Omit<JSPaint, 'style'>> = {
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
      _shader: this._shader,
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

    // if ([...typedColor].find((value) => value > 1)) {
    //   console.log(typedColor);
    //   debugger;
    // }
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
    this._shader = shader;
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

  get style(): PaintStyle {
    return this._style;
  }
}
