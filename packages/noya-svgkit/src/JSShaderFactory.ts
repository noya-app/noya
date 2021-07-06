import {
  AngleInDegrees,
  BlendMode,
  ColorSpace,
  InputColor,
  InputFlexibleColorArray,
  InputMatrix,
  InputPoint,
  Shader,
  TileMode,
} from 'canvaskit';

export class JSShaderFactory {
  static MakeBlend(mode: BlendMode, one: Shader, two: Shader): Shader {
    return (null as unknown) as Shader;
  }
  static MakeColor(color: InputColor, space: ColorSpace): Shader {
    return (null as unknown) as Shader;
  }
  static MakeFractalNoise(
    baseFreqX: number,
    baseFreqY: number,
    octaves: number,
    seed: number,
    tileW: number,
    tileH: number,
  ): Shader {
    return (null as unknown) as Shader;
  }
  static MakeLerp(t: number, one: Shader, two: Shader): Shader {
    return (null as unknown) as Shader;
  }

  static MakeLinearGradient(
    start: InputPoint,
    end: InputPoint,
    colors: InputFlexibleColorArray,
    pos: number[] | null,
    mode: TileMode,
    localMatrix?: InputMatrix,
    flags?: number,
    colorSpace?: ColorSpace,
  ): Shader {
    return (null as unknown) as Shader;
  }

  static MakeRadialGradient(
    center: InputPoint,
    radius: number,
    colors: InputFlexibleColorArray,
    pos: number[] | null,
    mode: TileMode,
    localMatrix?: InputMatrix,
    flags?: number,
    colorSpace?: ColorSpace,
  ): Shader {
    return (null as unknown) as Shader;
  }

  static MakeSweepGradient(
    cx: number,
    cy: number,
    colors: InputFlexibleColorArray,
    pos: number[] | null,
    mode: TileMode,
    localMatrix?: InputMatrix | null,
    flags?: number,
    startAngle?: AngleInDegrees,
    endAngle?: AngleInDegrees,
    colorSpace?: ColorSpace,
  ): Shader {
    return (null as unknown) as Shader;
  }

  static MakeTurbulence(
    baseFreqX: number,
    baseFreqY: number,
    octaves: number,
    seed: number,
    tileW: number,
    tileH: number,
  ): Shader {
    return (null as unknown) as Shader;
  }

  static MakeTwoPointConicalGradient(
    start: InputPoint,
    startRadius: number,
    end: InputPoint,
    endRadius: number,
    colors: InputFlexibleColorArray,
    pos: number[] | null,
    mode: TileMode,
    localMatrix?: InputMatrix,
    flags?: number,
    colorSpace?: ColorSpace,
  ): Shader {
    return (null as unknown) as Shader;
  }
}
