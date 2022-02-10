import { Skia, IShader } from '@shopify/react-native-skia';

import type {
  Shader,
  TileMode,
  BlendMode,
  InputPoint,
  InputColor,
  ColorSpace,
  InputMatrix,
  ShaderFactory,
  AngleInDegrees,
  InputFlexibleColorArray,
} from 'canvaskit';
import { colorArrayToNum } from '../utils/color';
import { JSEmbindObject } from './Embind';

class SkiaShader extends JSEmbindObject implements Shader {
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
    colors: InputFlexibleColorArray,
    pos: number[] | null,
    mode: TileMode,
    localMatrix?: InputMatrix,
    flags?: number,
    colorSpace?: ColorSpace,
  ): SkiaShader {
    // TODO: make sure the colors variable is processed correctly
    return new SkiaShader(
      Skia.Shader.MakeLinearGradient(
        { x: start[0], y: start[1] },
        { x: end[0], y: end[1] },
        // @ts-expect-error
        colors,
        pos,
        mode.value,
        localMatrix,
        flags,
      ),
    );
  },

  MakeRadialGradient(
    center: InputPoint,
    radius: number,
    colors: InputFlexibleColorArray,
    pos: number[] | null,
    mode: TileMode,
    localMatrix?: InputMatrix,
    flags?: number,
    colorSpace?: ColorSpace,
  ): SkiaShader {
    // TODO: make sure the colors variable is processed correctly
    return new SkiaShader(
      Skia.Shader.MakeRadialGradient(
        { x: center[0], y: center[1] },
        radius,
        // @ts-expect-error
        colors,
        pos,
        mode.value,
        localMatrix,
        flags,
      ),
    );
  },

  MakeSweepGradient(
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
  ): SkiaShader {
    // TODO: make sure the colors variable is processed correctly
    return new SkiaShader(
      Skia.Shader.MakeSweepGradient(
        cx,
        cy,
        // @ts-expect-error
        colors,
        pos,
        mode.value,
        localMatrix,
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
    colors: InputFlexibleColorArray,
    pos: number[] | null,
    mode: TileMode,
    localMatrix?: InputMatrix,
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
        // @ts-expect-error
        colors,
        pos,
        mode.value,
        localMatrix,
        flags,
      ),
    );
  },
};
