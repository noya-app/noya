import * as RNSkia from '@shopify/react-native-skia';

import {
  Paint,
  Color,
  ColorInt,
  BlendMode,
  StrokeCap,
  ColorSpace,
  InputColor,
  PaintStyle,
  StrokeJoin,
} from 'canvaskit';
import { colorArrayToNum, colorNumToArray } from '../utils/color';
import { SkiaColorFilter } from './ColorFilter';
import { SkiaImageFilter } from './ImageFilter';
import { SkiaMaskFilter } from './MaskFilter';
import { SkiaPathEffect } from './PathEffect';
import { JSEmbindObject } from './Embind';
import { SkiaShader } from './Shader';

export class SkiaPaint extends JSEmbindObject implements Paint {
  private _paint = RNSkia.Skia.Paint();

  copy(): Paint {
    const paintCopy = this._paint.copy();

    const copy = new SkiaPaint();
    copy._paint = paintCopy;

    return copy;
  }

  getBlendMode(): BlendMode {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
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
    this._paint.setBlendMode(mode.value);
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
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setColorFilter(filter: SkiaColorFilter): void {
    this._paint.setColorFilter(filter.getColorFilter());
  }

  setColorInt(color: ColorInt, colorSpace?: ColorSpace): void {
    this._paint.setColor(color);
  }

  setImageFilter(filter: SkiaImageFilter): void {
    this._paint.setImageFilter(filter.getImageFilter());
  }

  setMaskFilter(filter: SkiaMaskFilter): void {
    this._paint.setMaskFilter(filter.getMaskFilter());
  }

  setPathEffect(effect: SkiaPathEffect): void {
    this._paint.setPathEffect(effect.getPathEffect());
  }

  setShader(shader: SkiaShader): void {
    this._paint.setShader(shader.getShader());
  }

  setStrokeCap(cap: StrokeCap): void {
    this._paint.setStrokeCap(cap.value);
  }

  setStrokeJoin(join: StrokeJoin): void {
    this._paint.setStrokeJoin(join.value);
  }

  setStrokeMiter(limit: number): void {
    this._paint.setStrokeMiter(limit);
  }

  setStrokeWidth(width: number): void {
    this._paint.setStrokeWidth(width);
  }

  setStyle(style: PaintStyle): void {
    this._paint.setStyle(style.value);
  }

  getRNSkiaPaint() {
    return this._paint;
  }

  get style(): PaintStyle {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }
}
