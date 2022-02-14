import { Skia, IColorFilter } from '@shopify/react-native-skia';

import type {
  BlendMode,
  InputColor,
  ColorFilter,
  InputColorMatrix,
  ColorFilterFactory,
} from 'canvaskit';
import { JSEmbindObject } from './Embind';
import { colorArrayToNum } from '../utils/color';

export class SkiaColorFilter extends JSEmbindObject implements ColorFilter {
  constructor(private _colorFilter: IColorFilter) {
    super();
  }

  getColorFilter(): IColorFilter {
    return this._colorFilter;
  }
}

export const SkiaColorFilterFactory: ColorFilterFactory = {
  /**
   * Makes a color filter with the given color and blend mode.
   * @param color
   * @param mode
   */
  MakeBlend(color: InputColor, mode: BlendMode): SkiaColorFilter {
    return new SkiaColorFilter(
      Skia.ColorFilter.MakeBlend(
        colorArrayToNum(color as Float32Array),
        mode.value,
      ),
    );
  },

  /**
   * Makes a color filter composing two color filters.
   * @param outer
   * @param inner
   */
  MakeCompose(outer: SkiaColorFilter, inner: SkiaColorFilter): SkiaColorFilter {
    return new SkiaColorFilter(
      Skia.ColorFilter.MakeCompose(
        outer.getColorFilter(),
        inner.getColorFilter(),
      ),
    );
  },

  /**
   * Makes a color filter that is linearly interpolated between two other color filters.
   * @param t - a float in the range of 0.0 to 1.0.
   * @param dst
   * @param src
   */
  MakeLerp(
    t: number,
    dst: SkiaColorFilter,
    src: SkiaColorFilter,
  ): SkiaColorFilter {
    return new SkiaColorFilter(
      Skia.ColorFilter.MakeLerp(t, dst.getColorFilter(), src.getColorFilter()),
    );
  },

  /**
   * Makes a color filter that converts between linear colors and sRGB colors.
   */
  MakeLinearToSRGBGamma(): SkiaColorFilter {
    return new SkiaColorFilter(Skia.ColorFilter.MakeLinearToSRGBGamma());
  },

  /**
   * Creates a color filter using the provided color matrix.
   * @param cMatrix
   */
  MakeMatrix(cMatrix: InputColorMatrix): SkiaColorFilter {
    const skColorFilter = Skia.ColorFilter.MakeMatrix(
      Array.from(cMatrix as Float32Array | number[]),
    );

    return new SkiaColorFilter(skColorFilter);
  },

  /**
   * Makes a color filter that converts between sRGB colors and linear colors.
   */
  MakeSRGBToLinearGamma(): SkiaColorFilter {
    return new SkiaColorFilter(Skia.ColorFilter.MakeSRGBToLinearGamma());
  },
};
