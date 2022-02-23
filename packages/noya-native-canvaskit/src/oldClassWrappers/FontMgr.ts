import { Skia } from '@shopify/react-native-skia';

import type { FontMgr } from 'canvaskit';

export const SkiaFontMgrFactory = {
  // @ts-ignore
  FromData(...buffers: ArrayBuffer[]): FontMgr | null {
    console.warn(`SkiaFontMgrFactory.FromData not implemented!`);
  },

  RefDefault(): FontMgr {
    // TODO: fixme
    // @ts-expect-error
    return Skia.FontMgr.RefDefault();
  },
};
