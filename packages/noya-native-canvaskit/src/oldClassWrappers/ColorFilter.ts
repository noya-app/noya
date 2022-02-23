import { Skia, BlendMode, IColorFilter } from '@shopify/react-native-skia';

import type { InputColor, InputColorMatrix } from 'canvaskit';
import { colorArrayToNum } from '../oldUtils/color';

export const SkiaColorFilterFactory = {
  /**
   * Makes a color filter with the given color and blend mode.
   * @param color
   * @param mode
   */
  MakeBlend(color: InputColor, mode: BlendMode): IColorFilter {
    return Skia.ColorFilter.MakeBlend(
      colorArrayToNum(color as Float32Array),
      mode,
    );
  },

  /**
   * Makes a color filter composing two color filters.
   * @param outer
   * @param inner
   */
  MakeCompose(outer: IColorFilter, inner: IColorFilter): IColorFilter {
    return Skia.ColorFilter.MakeCompose(outer, inner);
  },

  /**
   * Makes a color filter that is linearly interpolated between two other color filters.
   * @param t - a float in the range of 0.0 to 1.0.
   * @param dst
   * @param src
   */
  MakeLerp(t: number, dst: IColorFilter, src: IColorFilter): IColorFilter {
    return Skia.ColorFilter.MakeLerp(t, dst, src);
  },

  /**
   * Makes a color filter that converts between linear colors and sRGB colors.
   */
  MakeLinearToSRGBGamma(): IColorFilter {
    return Skia.ColorFilter.MakeLinearToSRGBGamma();
  },

  /**
   * Creates a color filter using the provided color matrix.
   * @param cMatrix
   */
  MakeMatrix(cMatrix: InputColorMatrix): IColorFilter {
    return Skia.ColorFilter.MakeMatrix(
      Array.from(cMatrix as Float32Array | number[]),
    );
  },

  /**
   * Makes a color filter that converts between sRGB colors and linear colors.
   */
  MakeSRGBToLinearGamma(): IColorFilter {
    return Skia.ColorFilter.MakeSRGBToLinearGamma();
  },
};
