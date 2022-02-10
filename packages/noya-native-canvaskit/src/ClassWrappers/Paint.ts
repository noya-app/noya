import * as RNSkia from '@shopify/react-native-skia';

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
} from 'canvaskit';
import { JSEmbindObject } from './Embind';
import { colorArrayToNum, colorNumToArray } from '../utils/color';

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
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
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

  setColorFilter(filter: ColorFilter): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setColorInt(color: ColorInt, colorSpace?: ColorSpace): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setImageFilter(filter: ImageFilter): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setMaskFilter(filter: MaskFilter): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setPathEffect(effect: PathEffect): void {
    // @ts-expect-error
    this._paint.setPathEffect(effect._pathEffect);
  }

  setShader(shader: Shader): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setStrokeCap(cap: StrokeCap): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setStrokeJoin(join: StrokeJoin): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
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
