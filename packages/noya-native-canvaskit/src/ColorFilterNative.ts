import {
  Skia,
  BlendMode,
  IColorFilter as RNSColorFilter,
} from '@shopify/react-native-skia';

import { IColorFilter, IColorFilterFactory } from 'canvaskit-types';
import { Color, InputMatrix } from './types';
import { JSEmbindObject } from './misc';

export class ColorFilterNative extends JSEmbindObject implements IColorFilter {
  constructor(private _filter: RNSColorFilter) {
    super();
  }

  getRNSColorFilter(): RNSColorFilter {
    return this._filter;
  }
}

export const ColorFilterFactoryNative: IColorFilterFactory<Color, InputMatrix> =
  {
    MakeBlend(color: Color, mode: BlendMode): ColorFilterNative {
      return new ColorFilterNative(Skia.ColorFilter.MakeBlend(color, mode));
    },

    MakeCompose(
      outer: ColorFilterNative,
      inner: ColorFilterNative,
    ): ColorFilterNative {
      return new ColorFilterNative(
        Skia.ColorFilter.MakeCompose(
          outer.getRNSColorFilter(),
          inner.getRNSColorFilter(),
        ),
      );
    },

    MakeMatrix(cMatrix: InputMatrix): IColorFilter {
      return new ColorFilterNative(Skia.ColorFilter.MakeMatrix(cMatrix));
    },
  };
