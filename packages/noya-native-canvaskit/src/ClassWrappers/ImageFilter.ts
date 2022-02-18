import {
  Skia,
  TileMode,
  BlendMode,
  IImageFilter,
  IColorFilter,
} from '@shopify/react-native-skia';

import type {
  InputColor,
  InputMatrix,
  FilterOptions,
  CubicResampler,
} from 'canvaskit';
import { colorArrayToNum } from '../utils/color';
import { SkiaShader } from './Shader';

const { ImageFilter: FilterFactory } = Skia;

export const SkiaImageFilterFactory = {
  // @ts-ignore
  MakeShader(shader: SkiaShader): IImageFilter {
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

  /**
   *  Create a blend of two image filters.
   *  @param blendMode - BlendMode combining the two filters
   *  @param background - Background filter (dst)
   *  @param foreground - Foreground filter (src)
   */
  MakeBlend(
    blendMode: BlendMode,
    background: IImageFilter,
    foreground: IImageFilter,
    // @ts-ignore
  ): IImageFilter {
    console.warn(`SkiaImageFilterFactory.MakeBlend not implemented!`);
  },

  /**
   *  Create a filter that draws a drop shadow under the input content. This filter produces an
   *  image that includes the inputs' content.
   *  @param dx       The X offset of the shadow.
   *  @param dy       The Y offset of the shadow.
   *  @param sigmaX   The blur radius for the shadow, along the X axis.
   *  @param sigmaY   The blur radius for the shadow, along the Y axis.
   *  @param color    The color of the drop shadow.
   *  @param input    The input filter, or will use the source bitmap if this is null.
   */
  MakeDropShadow(
    dx: number,
    dy: number,
    sigmaX: number,
    sigmaY: number,
    color: InputColor,
    input: IImageFilter | null,
  ): IImageFilter {
    return FilterFactory.MakeDropShadow(
      dx,
      dy,
      sigmaX,
      sigmaY,
      colorArrayToNum(color as Float32Array),
      input ?? undefined,
    );
  },

  /**
   *  Create a filter that renders a drop shadow, in exactly the same manner as MakeDropShadow,
   *  except that the resulting image does not include the input content. This allows the shadow
   *  and input to be composed by a filter DAG in a more flexible manner.
   *  @param dx       The X offset of the shadow.
   *  @param dy       The Y offset of the shadow.
   *  @param sigmaX   The blur radius for the shadow, along the X axis.
   *  @param sigmaY   The blur radius for the shadow, along the Y axis.
   *  @param color    The color of the drop shadow.
   *  @param input    The input filter, or will use the source bitmap if this is null.
   *  @param cropRect Optional rectangle that crops the input and output.
   */
  MakeDropShadowOnly(
    dx: number,
    dy: number,
    sigmaX: number,
    sigmaY: number,
    color: InputColor,
    input: IImageFilter | null,
  ): IImageFilter {
    return FilterFactory.MakeDropShadowOnly(
      dx,
      dy,
      sigmaX,
      sigmaY,
      colorArrayToNum(color as Float32Array),
      input ?? undefined,
    );
  },

  /**
   * Create a filter that blurs its input by the separate X and Y sigmas. The provided tile mode
   * is used when the blur kernel goes outside the input image.
   *
   * @param sigmaX - The Gaussian sigma value for blurring along the X axis.
   * @param sigmaY - The Gaussian sigma value for blurring along the Y axis.
   * @param mode
   * @param input - if null, it will use the dynamic source image (e.g. a saved layer)
   */
  MakeBlur(
    sigmaX: number,
    sigmaY: number,
    mode: TileMode,
    input: IImageFilter | null,
  ): IImageFilter {
    return FilterFactory.MakeBlur(sigmaX, sigmaY, mode, input);
  },

  /**
   * Create a filter that applies the color filter to the input filter results.
   * @param cf
   * @param input - if null, it will use the dynamic source image (e.g. a saved layer)
   */
  MakeColorFilter(cf: IColorFilter, input: IImageFilter | null): IImageFilter {
    return FilterFactory.MakeColorFilter(cf, input);
  },

  /**
   * Create a filter that composes 'inner' with 'outer', such that the results of 'inner' are
   * treated as the source bitmap passed to 'outer'.
   * If either param is null, the other param will be returned.
   * @param outer
   * @param inner - if null, it will use the dynamic source image (e.g. a saved layer)
   */
  MakeCompose(
    outer: IImageFilter | null,
    inner: IImageFilter | null,
  ): IImageFilter | null {
    if (!outer || !inner) {
      return null;
    }

    return FilterFactory.MakeCompose(outer, inner);
  },

  /**
   * Create a filter that transforms the input image by 'matrix'. This matrix transforms the
   * local space, which means it effectively happens prior to any transformation coming from the
   * Canvas initiating the filtering.
   * @param matr
   * @param sampling
   * @param input - if null, it will use the dynamic source image (e.g. a saved layer)
   */
  MakeMatrixTransform(
    matr: InputMatrix,
    sampling: FilterOptions | CubicResampler,
    input: IImageFilter | null,
    // @ts-ignore
  ): IImageFilter {
    console.warn(`SkiaImageFilterFactory.MakeMatrixTransform not implemented!`);
  },
};
