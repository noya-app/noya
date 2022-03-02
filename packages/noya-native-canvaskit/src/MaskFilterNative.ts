import {
  Skia,
  BlurStyle,
  IMaskFilter as RNSMaskFilter,
} from '@shopify/react-native-skia';

import { IMaskFilter, IMaskFilterFactory } from 'canvaskit-types';
import { JSEmbindObject } from './misc';

export class MaskFilterNative extends JSEmbindObject implements IMaskFilter {
  constructor(private _filter: RNSMaskFilter) {
    super();
  }

  getRNSMaskFilter(): RNSMaskFilter {
    return this._filter;
  }
}

export const MaskFilterFactoryNative: IMaskFilterFactory = {
  MakeBlur(
    blurStyle: BlurStyle,
    sigma: number,
    respectCTM: boolean,
  ): IMaskFilter {
    return new MaskFilterNative(
      Skia.MaskFilter.MakeBlur(blurStyle, sigma, respectCTM),
    );
  },
};
