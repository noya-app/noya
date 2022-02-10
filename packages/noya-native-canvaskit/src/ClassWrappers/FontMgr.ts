import { Skia } from '@shopify/react-native-skia';

import type { FontMgr, FontMgrFactory } from 'canvaskit';

export const SkiaFontMgrFactory: FontMgrFactory = {
  FromData(...buffers: ArrayBuffer[]): FontMgr | null {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },

  RefDefault(): FontMgr {
    // TODO: fixme
    // @ts-expect-error
    return Skia.FontMgr.RefDefault();
  },
};
