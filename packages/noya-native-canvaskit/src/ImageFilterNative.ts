import {
  Skia,
  SkShader,
  TileMode,
  BlendMode,
  SkImageFilter,
} from '@shopify/react-native-skia';

import {
  IImageFilterFactory,
  IImageFilter,
} from 'canvaskit-types/src/IImageFilter';
import { ColorFilterNative } from './ColorFilterNative';
import { JSEmbindObject } from './misc';
import { Color } from './types';

export class ImageFilterNative extends JSEmbindObject implements IImageFilter {
  constructor(private _filter: SkImageFilter) {
    super();
  }

  getRNSImageFilter() {
    return this._filter;
  }
}

const ImageFilterFactoryNative: IImageFilterFactory<Color> = {
  // @ts-ignore
  MakeShader(shader: SkShader): ImageFilterNative {
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
  ): ImageFilterNative {
    console.warn(`SkiaImageFilterFactory.MakeArithmetic not implemented!`);
  },

  MakeErode(
    radiusX: number,
    radiusY: number,
    input: IImageFilter | null,
  ): ImageFilterNative | null {
    console.warn(`SkiaImageFilterFactory.MakeErode not implemented!`);
    return null;
  },

  MakeOffset(
    dx: number,
    dy: number,
    input: ImageFilterNative | null,
    // @ts-ignore
  ): ImageFilterNative {
    console.warn(`SkiaImageFilterFactory.MakeOffset not implemented!`);
  },

  MakeBlend(
    blendMode: BlendMode,
    background: ImageFilterNative,
    foreground: ImageFilterNative,
    // @ts-ignore
  ): ImageFilterNative {
    console.warn(`SkiaImageFilterFactory.MakeBlend not implemented!`);
  },

  MakeDropShadow(
    dx: number,
    dy: number,
    sigmaX: number,
    sigmaY: number,
    color: Color,
    input: ImageFilterNative | null,
  ): ImageFilterNative {
    return new ImageFilterNative(
      Skia.ImageFilter.MakeDropShadow(
        dx,
        dy,
        sigmaX,
        sigmaY,
        color,
        input?.getRNSImageFilter() ?? null,
      ),
    );
  },

  MakeDropShadowOnly(
    dx: number,
    dy: number,
    sigmaX: number,
    sigmaY: number,
    color: Color,
    input: ImageFilterNative | null,
  ): ImageFilterNative {
    return new ImageFilterNative(
      Skia.ImageFilter.MakeDropShadowOnly(
        dx,
        dy,
        sigmaX,
        sigmaY,
        color,
        input?.getRNSImageFilter() ?? null,
      ),
    );
  },

  MakeBlur(
    sigmaX: number,
    sigmaY: number,
    mode: TileMode,
    input: ImageFilterNative | null,
  ): ImageFilterNative {
    return new ImageFilterNative(
      Skia.ImageFilter.MakeBlur(
        sigmaX,
        sigmaY,
        mode,
        input?.getRNSImageFilter() ?? null,
      ),
    );
  },

  MakeColorFilter(
    cf: ColorFilterNative,
    input: ImageFilterNative | null,
  ): ImageFilterNative {
    return new ImageFilterNative(
      Skia.ImageFilter.MakeColorFilter(
        cf.getRNSColorFilter(),
        input?.getRNSImageFilter() ?? null,
      ),
    );
  },

  MakeCompose(
    outer: ImageFilterNative | null,
    inner: ImageFilterNative | null,
  ): ImageFilterNative | null {
    if (!outer || !inner) {
      return null;
    }

    return new ImageFilterNative(
      Skia.ImageFilter.MakeCompose(
        outer.getRNSImageFilter(),
        inner.getRNSImageFilter(),
      ),
    );
  },
};

export default ImageFilterFactoryNative;
