import { Skia, IMaskFilter } from '@shopify/react-native-skia';

import type { MaskFilterFactory, MaskFilter, BlurStyle } from 'canvaskit';
import { JSEmbindObject } from './Embind';

class SkiaMaskFilter extends JSEmbindObject implements MaskFilter {
  constructor(private _maskFilter: IMaskFilter) {
    super();
  }

  getMaskFilter(): IMaskFilter {
    return this._maskFilter;
  }
}

export const SkiaMaskFilterFactory: MaskFilterFactory = {
  MakeBlur(
    style: BlurStyle,
    sigma: number,
    respectCTM: boolean,
  ): SkiaMaskFilter {
    return new SkiaMaskFilter(
      Skia.MaskFilter.MakeBlur(style.value, sigma, respectCTM),
    );
  },
};
