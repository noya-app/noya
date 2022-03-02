import type {
  IColorFilter,
  IMaskFilter,
  IPathEffect,
  EmbindObject,
} from './misc';
import type { IImageFilter } from './IImageFilter';
import type {
  IStrokeCap,
  IStrokeJoin,
  IBlendMode,
  IColorSpace,
  IPaintStyle,
} from './Enums';
import type { IShader } from './IShader';

export interface IPaint<IColor> extends EmbindObject {
  copy(): IPaint<IColor>;

  getColor(): IColor;
  getStrokeCap(): IStrokeCap;
  getStrokeJoin(): IStrokeJoin;
  getStrokeMiter(): number;
  getStrokeWidth(): number;

  setAlphaf(alpha: number): void;
  setAntiAlias(aa: boolean): void;
  setBlendMode(mode: IBlendMode): void;
  setColor(color: IColor): void;
  setColorComponents(
    r: number,
    g: number,
    b: number,
    a: number,
    colorSpace?: IColorSpace,
  ): void;
  setColorFilter(filter: IColorFilter): void;
  setColorInt(color: number, colorSpace?: IColorSpace): void;
  setImageFilter(filter: IImageFilter): void;
  setMaskFilter(filter: IMaskFilter): void;
  setPathEffect(effect: IPathEffect): void;
  setShader(shader: IShader): void;
  setStrokeCap(cap: IStrokeCap): void;
  setStrokeJoin(join: IStrokeJoin): void;
  setStrokeMiter(limit: number): void;
  setStrokeWidth(width: number): void;
  setStyle(style: IPaintStyle): void;
  get style(): IPaintStyle;
}
