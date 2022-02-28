import { IBlendMode, IColorSpace, ITileMode } from './Enums';
import { EmbindObject } from './misc';

export interface IShader extends EmbindObject {}

export interface IShaderFactory<IColor, IPoint, IColorArray, IMatrix> {
  MakeBlend(mode: IBlendMode, one: IShader, two: IShader): IShader;

  MakeColor(color: IColor, space: IColorSpace): IShader;

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
    mode: ITileMode,
    localMatrix?: IMatrix,
    flags?: number,
    colorSpace?: IColorSpace,
  ): IShader;

  MakeRadialGradient(
    center: IPoint,
    radius: number,
    colors: IColorArray,
    pos: number[] | null,
    mode: ITileMode,
    localMatrix?: IMatrix,
    flags?: number,
    colorSpace?: IColorSpace,
  ): IShader;

  MakeSweepGradient(
    cx: number,
    cy: number,
    colors: IColorArray,
    pos: number[] | null,
    mode: ITileMode,
    localMatrix?: IMatrix | null,
    flags?: number,
    startAngle?: number,
    endAngle?: number,
    colorSpace?: IColorSpace,
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
    mode: ITileMode,
    localMatrix?: IMatrix,
    flags?: number,
    colorSpace?: IColorSpace,
  ): IShader;
}
