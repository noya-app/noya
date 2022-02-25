import type { IColorFilter, IMaskFilter, IPathEffect } from './misc';
import type { IImageFilter } from './IImageFilter';
import type { EnumEntity } from './Enums';
import type { IShader } from './IShader';

export interface IPaint<IColor> {
  copy(): IPaint<IColor>;

  getColor(): IColor;
  getStrokeCap(): EnumEntity;
  getStrokeJoin(): EnumEntity;
  getStrokeMiter(): number;
  getStrokeWidth(): number;

  setAlphaf(alpha: number): void;
  setAntiAlias(aa: boolean): void;
  setBlendMode(mode: EnumEntity): void;
  setColor(color: IColor): void;
  setColorComponents(
    r: number,
    g: number,
    b: number,
    a: number,
    colorSpace?: EnumEntity,
  ): void;
  setColorFilter(filter: IColorFilter): void;
  setColorInt(color: number, colorSpace?: EnumEntity): void;
  setImageFilter(filter: IImageFilter): void;
  setMaskFilter(filter: IMaskFilter): void;
  setPathEffect(effect: IPathEffect): void;
  setShader(shader: IShader): void;
  setStrokeCap(cap: EnumEntity): void;
  setStrokeJoin(join: EnumEntity): void;
  setStrokeMiter(limit: number): void;
  setStrokeWidth(width: number): void;
  setStyle(style: EnumEntity): void;
}
