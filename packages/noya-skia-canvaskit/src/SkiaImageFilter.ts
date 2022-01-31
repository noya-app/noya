import * as RNSkia from '@shopify/react-native-skia';

import type {
  Shader,
  TileMode,
  BlendMode,
  InputColor,
  ColorFilter,
  ImageFilter,
  ImageFilterFactory,
  InputMatrix,
  FilterOptions,
  CubicResampler,
} from 'canvaskit';
import { JSEmbindObject } from './Embind';

export class SkiaImageFilter extends JSEmbindObject implements ImageFilter {
  private _imageFilter: RNSkia.IImageFilter;

  constructor(imgFil: RNSkia.IImageFilter) {
    super();

    this._imageFilter = imgFil;
  }

  getImageFilter(): RNSkia.IImageFilter {
    return this._imageFilter;
  }
}

export class SkiaImageFilterFactory
  extends JSEmbindObject
  implements ImageFilterFactory
{
  private _filterFactory = RNSkia.Skia.ImageFilter;

  MakeShader(shader: Shader): ImageFilter {
    throw new Error('Not implemented');
  }

  MakeArithmetic(
    k1: number,
    k2: number,
    k3: number,
    k4: number,
    enforcePMColor: boolean,
    background: ImageFilter | null,
    foreground: ImageFilter | null,
  ): ImageFilter {
    throw new Error('Not implemented');
  }

  MakeErode(
    radiusX: number,
    radiusY: number,
    input: ImageFilter | null,
  ): ImageFilter {
    throw new Error('Not implemented');
  }

  MakeOffset(dx: number, dy: number, input: ImageFilter | null): ImageFilter {
    throw new Error('Not implemented');
  }

  /**
   *  Create a blend of two image filters.
   *  @param blendMode - BlendMode combining the two filters
   *  @param background - Background filter (dst)
   *  @param foreground - Foreground filter (src)
   */
  MakeBlend(
    blendMode: BlendMode,
    background: ImageFilter,
    foreground: ImageFilter,
  ): ImageFilter {
    throw new Error('Not implemented');
  }

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
    input: ImageFilter | null,
  ): ImageFilter {
    throw new Error('Not implemented');
  }

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
    input: ImageFilter | null,
  ): ImageFilter {
    const [inR, inG, inB, inA] = color as number[];
    const a = Math.floor(inA * 255) << 24;
    const r = Math.floor(inR * 255) << 16;
    const g = Math.floor(inG * 255) << 8;
    const b = Math.floor(inB * 255) << 0;

    const skiaImageFilter = this._filterFactory.MakeDropShadowOnly(
      dx,
      dy,
      sigmaX,
      sigmaY,
      a + r + g + b,
      input ? (input as SkiaImageFilter).getImageFilter() : undefined,
    );

    return new SkiaImageFilter(skiaImageFilter);
  }

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
    input: ImageFilter | null,
  ): ImageFilter {
    throw new Error('Not implemented');
  }

  /**
   * Create a filter that applies the color filter to the input filter results.
   * @param cf
   * @param input - if null, it will use the dynamic source image (e.g. a saved layer)
   */
  MakeColorFilter(cf: ColorFilter, input: ImageFilter | null): ImageFilter {
    throw new Error('Not implemented');
  }

  /**
   * Create a filter that composes 'inner' with 'outer', such that the results of 'inner' are
   * treated as the source bitmap passed to 'outer'.
   * If either param is null, the other param will be returned.
   * @param outer
   * @param inner - if null, it will use the dynamic source image (e.g. a saved layer)
   */
  MakeCompose(
    outer: ImageFilter | null,
    inner: ImageFilter | null,
  ): ImageFilter {
    throw new Error('Not implemented');
  }

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
    input: ImageFilter | null,
  ): ImageFilter {
    throw new Error('Not implemented');
  }
}
