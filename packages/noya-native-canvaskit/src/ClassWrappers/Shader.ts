import { Skia, IShader, TileMode } from '@shopify/react-native-skia';

import type {
  Shader,
  BlendMode,
  InputPoint,
  InputColor,
  ColorSpace,
  ShaderFactory,
  AngleInDegrees,
} from 'canvaskit';
import { colorArrayToNum } from '../utils/color';
import { JSEmbindObject } from './Embind';
import { SkiaMatrix } from './Matrix';

export class SkiaShader extends JSEmbindObject implements Shader {
  constructor(private _shader: IShader) {
    super();
  }

  getShader(): IShader {
    return this._shader;
  }
}

export const SkiaShaderFactory: ShaderFactory = {
  MakeBlend(mode: BlendMode, one: SkiaShader, two: SkiaShader): SkiaShader {
    return new SkiaShader(
      Skia.Shader.MakeBlend(mode.value, one.getShader(), two.getShader()),
    );
  },

  MakeColor(color: InputColor, space: ColorSpace): SkiaShader {
    return new SkiaShader(
      Skia.Shader.MakeColor(colorArrayToNum(color as Float32Array)),
    );
  },

  MakeFractalNoise(
    baseFreqX: number,
    baseFreqY: number,
    octaves: number,
    seed: number,
    tileW: number,
    tileH: number,
  ): SkiaShader {
    return new SkiaShader(
      Skia.Shader.MakeFractalNoise(
        baseFreqX,
        baseFreqY,
        octaves,
        seed,
        tileW,
        tileH,
      ),
    );
  },

  MakeLinearGradient(
    start: InputPoint,
    end: InputPoint,
    colors: Float32Array[],
    pos: number[] | null,
    mode: TileMode,
    localMatrix?: Float32Array | number[],
    flags?: number,
    colorSpace?: ColorSpace,
  ): SkiaShader {
    return new SkiaShader(
      Skia.Shader.MakeLinearGradient(
        { x: start[0], y: start[1] },
        { x: end[0], y: end[1] },
        colors.map((c) => colorArrayToNum(c)),
        pos,
        mode,
        SkiaMatrix.toRNSMatrix(localMatrix),
        flags,
      ),
    );
  },

  MakeRadialGradient(
    center: InputPoint,
    radius: number,
    colors: Float32Array[],
    pos: number[] | null,
    mode: TileMode,
    localMatrix?: Float32Array | number[],
    flags?: number,
    colorSpace?: ColorSpace,
  ): SkiaShader {
    // TODO: make sure the colors variable is processed correctly
    return new SkiaShader(
      Skia.Shader.MakeRadialGradient(
        { x: center[0], y: center[1] },
        radius,
        colors.map((c) => colorArrayToNum(c)),
        pos,
        mode,
        SkiaMatrix.toRNSMatrix(localMatrix),
        flags,
      ),
    );
  },

  MakeSweepGradient(
    cx: number,
    cy: number,
    colors: Float32Array[],
    pos: number[] | null,
    mode: TileMode,
    localMatrix?: Float32Array | number[],
    flags?: number,
    startAngle?: AngleInDegrees,
    endAngle?: AngleInDegrees,
    colorSpace?: ColorSpace,
  ): SkiaShader {
    // TODO: make sure the colors variable is processed correctly
    return new SkiaShader(
      Skia.Shader.MakeSweepGradient(
        cx,
        cy,
        colors.map((c) => colorArrayToNum(c)),
        pos,
        mode,
        SkiaMatrix.toRNSMatrix(localMatrix),
        flags,
        startAngle,
        endAngle,
      ),
    );
  },

  MakeTurbulence(
    baseFreqX: number,
    baseFreqY: number,
    octaves: number,
    seed: number,
    tileW: number,
    tileH: number,
  ): SkiaShader {
    return new SkiaShader(
      Skia.Shader.MakeTurbulence(
        baseFreqX,
        baseFreqY,
        octaves,
        seed,
        tileW,
        tileH,
      ),
    );
  },

  MakeTwoPointConicalGradient(
    start: InputPoint,
    startRadius: number,
    end: InputPoint,
    endRadius: number,
    colors: Float32Array[],
    pos: number[] | null,
    mode: TileMode,
    localMatrix?: Float32Array | number[],
    flags?: number,
    colorSpace?: ColorSpace,
  ): SkiaShader {
    // TODO: make sure the colors variable is processed correctly
    return new SkiaShader(
      Skia.Shader.MakeTwoPointConicalGradient(
        { x: start[0], y: start[1] },
        startRadius,
        { x: end[0], y: end[0] },
        endRadius,
        colors.map((c) => colorArrayToNum(c)),
        pos,
        mode,
        SkiaMatrix.toRNSMatrix(localMatrix),
        flags,
      ),
    );
  },
};
