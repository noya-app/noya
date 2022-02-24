import {
  Skia,
  IShader,
  TileMode,
  BlendMode,
  IImageFilter,
  IColorFilter,
} from '@shopify/react-native-skia';

import { IImageFilterFactory } from 'canvaskit-types/src/IImageFilter';
import { Color } from './types';

const { ImageFilter: FilterFactory } = Skia;

const ImageFilterFactoryNative: IImageFilterFactory<Color> = {
  // @ts-ignore
  MakeShader(shader: IShader): IImageFilter {
    console.warn(`SkiaImageFilterFactory.MakeShader not implemented!`);
  },

  MakeArithmetic(
    k1: number,
    k2: number,
    k3: number,
    k4: number,
    enforcePMColor: boolean,
    background: IImageFilter | null,
    foreground: IImageFilter | null,
    // @ts-ignore
  ): IImageFilter {
    console.warn(`SkiaImageFilterFactory.MakeArithmetic not implemented!`);
  },

  MakeErode(
    radiusX: number,
    radiusY: number,
    input: IImageFilter | null,
  ): IImageFilter | null {
    console.warn(`SkiaImageFilterFactory.MakeErode not implemented!`);
    return null;
  },

  MakeOffset(
    dx: number,
    dy: number,
    input: IImageFilter | null,
    // @ts-ignore
  ): IImageFilter {
    console.warn(`SkiaImageFilterFactory.MakeOffset not implemented!`);
  },

  MakeBlend(
    blendMode: BlendMode,
    background: IImageFilter,
    foreground: IImageFilter,
    // @ts-ignore
  ): IImageFilter {
    console.warn(`SkiaImageFilterFactory.MakeBlend not implemented!`);
  },

  MakeDropShadow(
    dx: number,
    dy: number,
    sigmaX: number,
    sigmaY: number,
    color: Color,
    input: IImageFilter | null,
  ): IImageFilter {
    return FilterFactory.MakeDropShadow(
      dx,
      dy,
      sigmaX,
      sigmaY,
      color,
      input ?? undefined,
    );
  },

  MakeDropShadowOnly(
    dx: number,
    dy: number,
    sigmaX: number,
    sigmaY: number,
    color: Color,
    input: IImageFilter | null,
  ): IImageFilter {
    return FilterFactory.MakeDropShadowOnly(
      dx,
      dy,
      sigmaX,
      sigmaY,
      color,
      input ?? undefined,
    );
  },

  MakeBlur(
    sigmaX: number,
    sigmaY: number,
    mode: TileMode,
    input: IImageFilter | null,
  ): IImageFilter {
    return FilterFactory.MakeBlur(sigmaX, sigmaY, mode, input);
  },

  MakeColorFilter(cf: IColorFilter, input: IImageFilter | null): IImageFilter {
    return FilterFactory.MakeColorFilter(cf, input);
  },

  MakeCompose(
    outer: IImageFilter | null,
    inner: IImageFilter | null,
  ): IImageFilter | null {
    if (!outer || !inner) {
      return null;
    }

    return FilterFactory.MakeCompose(outer, inner);
  },
};

export default ImageFilterFactoryNative;
