import { EnumEntity } from './Enums';

export interface IShader {}

export interface IShaderFactory<IColor, IPoint, IColorArray, IMatrix> {
  MakeBlend(mode: EnumEntity, one: IShader, two: IShader): IShader;

  MakeColor(color: IColor, space: EnumEntity): IShader;

  MakeFractalNoise(
    baseFreqX: number,
    baseFreqY: number,
    octaves: number,
    seed: number,
    tileW: number,
    tileH: number,
  ): IShader;

  MakeLinearGradient(
    start: IPoint,
    end: IPoint,
    colors: IColorArray,
    pos: number[] | null,
    mode: EnumEntity,
    localMatrix?: IMatrix,
    flags?: number,
    colorSpace?: EnumEntity,
  ): IShader;

  MakeRadialGradient(
    center: IPoint,
    radius: number,
    colors: IColorArray,
    pos: number[] | null,
    mode: EnumEntity,
    localMatrix?: IMatrix,
    flags?: number,
    colorSpace?: EnumEntity,
  ): IShader;

  MakeSweepGradient(
    cx: number,
    cy: number,
    colors: IColorArray,
    pos: number[] | null,
    mode: EnumEntity,
    localMatrix?: IMatrix | null,
    flags?: number,
    startAngle?: number,
    endAngle?: number,
    colorSpace?: EnumEntity,
  ): IShader;

  MakeTurbulence(
    baseFreqX: number,
    baseFreqY: number,
    octaves: number,
    seed: number,
    tileW: number,
    tileH: number,
  ): IShader;

  MakeTwoPointConicalGradient(
    start: IPoint,
    startRadius: number,
    end: IPoint,
    endRadius: number,
    colors: IColorArray,
    pos: number[] | null,
    mode: EnumEntity,
    localMatrix?: IMatrix,
    flags?: number,
    colorSpace?: EnumEntity,
  ): IShader;
}
