import {
  Skia,
  StrokeCap,
  BlendMode,
  PaintStyle,
  StrokeJoin,
  IPathEffect,
  IMaskFilter,
  IImageFilter,
  IColorFilter,
} from '@shopify/react-native-skia';

import { Color, ColorInt, ColorSpace, InputColor } from 'canvaskit';
import { colorArrayToNum, colorNumToArray } from '../utils/color';
import { JSEmbindObject } from './Embind';
import { SkiaShader } from './Shader';

export class SkiaPaint extends JSEmbindObject {
  private _paint = Skia.Paint();

  copy(): SkiaPaint {
    const paintCopy = this._paint.copy();

    const copy = new SkiaPaint();
    copy._paint = paintCopy;

    return copy;
  }

  // @ts-ignore
  getBlendMode(): BlendMode {
    console.warn(`SkiaPaint.getBlendMode not implemented!`);
  }

  getColor(): Color {
    return colorNumToArray(this._paint.getColor());
  }

  getStrokeCap(): StrokeCap {
    return this._paint.getStrokeCap() as unknown as StrokeCap;
  }

  getStrokeJoin(): StrokeJoin {
    return this._paint.getStrokeJoin() as unknown as StrokeJoin;
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

  setColor(color: InputColor, colorSpace?: ColorSpace): void {
    this._paint.setColor(colorArrayToNum(color as Float32Array));
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

  setColorInt(color: ColorInt, colorSpace?: ColorSpace): void {
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

  setShader(shader: SkiaShader): void {
    this._paint.setShader(shader.getShader());
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
