import {
  Skia,
  IShader,
  StrokeCap,
  BlendMode,
  PaintStyle,
  StrokeJoin,
  IPathEffect,
  IMaskFilter,
  IImageFilter,
  IColorFilter,
} from '@shopify/react-native-skia';

import { IPaint } from 'canvaskit-types';
import { JSEmbindObject } from './misc';
import { Color, ColorSpace } from './types';

export default class PaintNative
  extends JSEmbindObject
  implements IPaint<Color>
{
  private _paint = Skia.Paint();

  copy(): PaintNative {
    const paintCopy = this._paint.copy();

    const copy = new PaintNative();
    copy._paint = paintCopy;

    return copy;
  }

  // @ts-ignore
  getBlendMode(): BlendMode {
    console.warn(`SkiaPaint.getBlendMode not implemented!`);
  }

  getColor(): Color {
    return this._paint.getColor();
  }

  getStrokeCap(): StrokeCap {
    return this._paint.getStrokeCap();
  }

  getStrokeJoin(): StrokeJoin {
    return this._paint.getStrokeJoin();
  }

  getStrokeMiter(): number {
    return this._paint.getStrokeMiter();
  }

  getStrokeWidth(): number {
    return this._paint.getStrokeWidth();
  }

  setAlphaf(alpha: number): void {
    this._paint.setAlphaf(alpha);
  }

  setAntiAlias(aa: boolean): void {
    this._paint.setAntiAlias(aa);
  }

  setBlendMode(mode: BlendMode): void {
    this._paint.setBlendMode(mode);
  }

  setColor(color: Color, colorSpace?: ColorSpace): void {
    this._paint.setColor(color);
  }

  setColorComponents(
    r: number,
    g: number,
    b: number,
    a: number,
    colorSpace?: ColorSpace,
  ): void {
    console.warn(`SkiaPaint.setColorComponents not implemented!`);
  }

  setColorFilter(filter: IColorFilter): void {
    this._paint.setColorFilter(filter);
  }

  setColorInt(color: Color, colorSpace?: ColorSpace): void {
    this._paint.setColor(color);
  }

  setImageFilter(filter: IImageFilter): void {
    this._paint.setImageFilter(filter);
  }

  setMaskFilter(filter: IMaskFilter): void {
    this._paint.setMaskFilter(filter);
  }

  setPathEffect(effect: IPathEffect): void {
    this._paint.setPathEffect(effect);
  }

  setShader(shader: IShader): void {
    this._paint.setShader(shader);
  }

  setStrokeCap(cap: StrokeCap): void {
    this._paint.setStrokeCap(cap);
  }

  setStrokeJoin(join: StrokeJoin): void {
    this._paint.setStrokeJoin(join);
  }

  setStrokeMiter(limit: number): void {
    this._paint.setStrokeMiter(limit);
  }

  setStrokeWidth(width: number): void {
    this._paint.setStrokeWidth(width);
  }

  setStyle(style: PaintStyle): void {
    this._paint.setStyle(style);
  }

  getRNSkiaPaint() {
    return this._paint;
  }

  get style(): PaintStyle {
    console.warn(`SkiaPaint.get style not implemented!`);
    return 0;
  }
}
