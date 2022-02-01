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

export class SkiaPaintWrapper extends JSEmbindObject implements Paint {
  private _paint = RNSkia.Skia.Paint();

  copy(): Paint {
    const paintCopy = this._paint.copy();

    const copy = new SkiaPaintWrapper();
    copy._paint = paintCopy;

    return copy;
  }

  getBlendMode(): BlendMode {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getColor(): Color {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getStrokeCap(): StrokeCap {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getStrokeJoin(): StrokeJoin {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
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
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setColor(color: InputColor, colorSpace?: ColorSpace): void {
    const [inR, inG, inB, inA] = color as number[];

    const a = Math.floor(inA * 255) << 24;
    const r = Math.floor(inR * 255) << 16;
    const g = Math.floor(inG * 255) << 8;
    const b = Math.floor(inB * 255) << 0;

    this._paint.setColor(r | g | b | a);
  }

  setColorComponents(
    r: number,
    g: number,
    b: number,
    a: number,
    colorSpace?: ColorSpace,
  ): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setColorFilter(filter: ColorFilter): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setColorInt(color: ColorInt, colorSpace?: ColorSpace): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setImageFilter(filter: ImageFilter): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setMaskFilter(filter: MaskFilter): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setPathEffect(effect: PathEffect): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setShader(shader: Shader): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setStrokeCap(cap: StrokeCap): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setStrokeJoin(join: StrokeJoin): void {
    throw new Error(
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

  get style(): PaintStyle {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }
}