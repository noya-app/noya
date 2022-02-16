import * as RNSkia from '@shopify/react-native-skia';

import type {
  TileMode,
  BlendMode,
  InputColor,
  ImageFilter,
  ImageFilterFactory,
  InputMatrix,
  FilterOptions,
  CubicResampler,
} from 'canvaskit';
import { JSEmbindObject } from './Embind';
import { SkiaColorFilter } from './ColorFilter';
import { SkiaShader } from './Shader';

const { ImageFilter: FilterFactory } = RNSkia.Skia;

export class SkiaImageFilter extends JSEmbindObject implements ImageFilter {
  constructor(private _imageFilter: RNSkia.IImageFilter) {
    super();
  }

  getImageFilter(): RNSkia.IImageFilter {
    return this._imageFilter;
  }
}

export const SkiaImageFilterFactory: ImageFilterFactory = {
  MakeShader(shader: SkiaShader): SkiaImageFilter {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },

  MakeArithmetic(
    k1: number,
    k2: number,
    k3: number,
    k4: number,
    enforcePMColor: boolean,
    background: ImageFilter | null,
    foreground: ImageFilter | null,
  ): SkiaImageFilter {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },

  MakeErode(
    radiusX: number,
    radiusY: number,
    input: SkiaImageFilter | null,
  ): SkiaImageFilter {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },

  MakeOffset(
    dx: number,
    dy: number,
    input: SkiaImageFilter | null,
  ): SkiaImageFilter {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },

  /**
   *  Create a blend of two image filters.
   *  @param blendMode - BlendMode combining the two filters
   *  @param background - Background filter (dst)
   *  @param foreground - Foreground filter (src)
   */
  MakeBlend(
    blendMode: BlendMode,
    background: SkiaImageFilter,
    foreground: SkiaImageFilter,
  ): SkiaImageFilter {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
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
    input: SkiaImageFilter | null,
  ): SkiaImageFilter {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
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
    input: SkiaImageFilter | null,
  ): SkiaImageFilter {
    const [inR, inG, inB, inA] = color as number[];
    const a = Math.floor(inA * 255) << 24;
    const r = Math.floor(inR * 255) << 16;
    const g = Math.floor(inG * 255) << 8;
    const b = Math.floor(inB * 255) << 0;

    const skiaImageFilter = FilterFactory.MakeDropShadowOnly(
      dx,
      dy,
      sigmaX,
      sigmaY,
      a + r + g + b,
      input ? input.getImageFilter() : undefined,
    );

    return new SkiaImageFilter(skiaImageFilter);
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
    mode: RNSkia.TileMode,
    input: SkiaImageFilter | null,
  ): SkiaImageFilter {
    const filter = FilterFactory.MakeBlur(
      sigmaX,
      sigmaY,
      mode,
      input ? input.getImageFilter() : null,
    );

    return new SkiaImageFilter(filter);
  },

  /**
   * Create a filter that applies the color filter to the input filter results.
   * @param cf
   * @param input - if null, it will use the dynamic source image (e.g. a saved layer)
   */
  MakeColorFilter(
    cf: SkiaColorFilter,
    input: SkiaImageFilter | null,
  ): SkiaImageFilter {
    const filter = FilterFactory.MakeColorFilter(
      cf.getColorFilter(),
      input ? input.getImageFilter() : null,
    );

    return new SkiaImageFilter(filter);
  },

  /**
   * Create a filter that composes 'inner' with 'outer', such that the results of 'inner' are
   * treated as the source bitmap passed to 'outer'.
   * If either param is null, the other param will be returned.
   * @param outer
   * @param inner - if null, it will use the dynamic source image (e.g. a saved layer)
   */
  MakeCompose(
    outer: SkiaImageFilter | null,
    inner: SkiaImageFilter | null,
  ): SkiaImageFilter {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
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
    input: SkiaImageFilter | null,
  ): SkiaImageFilter {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
};
