import {
  Skia,
  IRuntimeEffect as RNSRuntimeEffect,
} from '@shopify/react-native-skia';

import { IRuntimeEffect, IRuntimeEffectFactory } from 'canvaskit-types';
import { JSEmbindObject } from './misc';
import { Matrix } from './types';

export class RuntimeEffectNative
  extends JSEmbindObject
  implements IRuntimeEffect<Matrix>
{
  constructor(private _effect: RNSRuntimeEffect) {
    super();
  }

  getRNSRuntimeEffect(): RNSRuntimeEffect {
    return this._effect;
  }

  makeShader(uniforms: number[], isOpaque?: boolean, localMatrix?: Matrix) {
    return this._effect.makeShader(uniforms, isOpaque, localMatrix);
  }
}

export const RuntimeEffectFactoryNative: IRuntimeEffectFactory<Matrix> = {
  Make(
    sksl: string,
    _callback?: (err: string) => void,
  ): RuntimeEffectNative | null {
    const effect = Skia.RuntimeEffect.Make(sksl);

    if (!effect) {
      return null;
    }

    return new RuntimeEffectNative(effect);
  },
};
