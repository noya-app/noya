import {
  Skia,
  SkShader,
  StrokeCap,
  BlendMode,
  PaintStyle,
  StrokeJoin,
  IPathEffect,
} from '@shopify/react-native-skia';

import { IPaint } from 'canvaskit-types';
import { JSEmbindObject } from './misc';
import { ColorFilterNative } from './ColorFilterNative';
import { ImageFilterNative } from './ImageFilterNative';
import { MaskFilterNative } from './MaskFilterNative';
import { Color, ColorSpace } from './types';

export default class PaintNative
  extends JSEmbindObject
  implements IPaint<Color>
{
  private _paint = Skia.Paint();
  private _paintStlye: PaintStyle = PaintStyle.Fill;

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

  setColorFilter(filter: ColorFilterNative): void {
    this._paint.setColorFilter(filter.getRNSColorFilter());
  }

  setColorInt(color: number, colorSpace?: ColorSpace): void {
    const a = ((color & 0xff000000) >> 24) / 255.0;
    const r = ((color & 0x00ff0000) >> 16) / 255.0;
    const g = ((color & 0x0000ff00) >> 8) / 255.0;
    const b = (color & 0x000000ff) / 255.0;

    // return [r, g, b, a];
    this._paint.setColor(new Float32Array([r, g, b, a]));
  }

  setImageFilter(filter: ImageFilterNative): void {
    this._paint.setImageFilter(filter.getRNSImageFilter());
  }

  setMaskFilter(filter: MaskFilterNative): void {
    this._paint.setMaskFilter(filter.getRNSMaskFilter());
  }

  setPathEffect(effect: IPathEffect): void {
    this._paint.setPathEffect(effect);
  }

  setShader(shader: SkShader): void {
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
    this._paintStlye = style;

    this._paint.setStyle(style);
  }

  getRNSkiaPaint() {
    return this._paint;
  }

  get style(): PaintStyle {
    return this._paintStlye;
  }
}
