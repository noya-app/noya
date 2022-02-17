import { Skia, IRuntimeEffect, SkSLUniform } from '@shopify/react-native-skia';

import { JSEmbindObject } from './Embind';
import { SkiaShader } from './Shader';
import { SkiaMatrix } from './Matrix';

class SkiaRuntimeEffect extends JSEmbindObject {
  constructor(private _runtimeEffect: IRuntimeEffect) {
    super();
  }

  getRuntimeEffect() {
    return this._runtimeEffect;
  }

  makeShader(
    uniforms: Float32Array | number[],
    isOpaque?: boolean,
    localMatrix?: Float32Array | number[],
  ): SkiaShader {
    const shader = this._runtimeEffect.makeShader(
      uniforms as number[],
      isOpaque,
      SkiaMatrix.toRNSMatrix(localMatrix),
    );

    return new SkiaShader(shader);
  }

  makeShaderWithChildren(
    uniforms: Float32Array | number[],
    isOpaque?: boolean,
    children?: SkiaShader[],
    localMatrix?: Float32Array | number[],
  ): SkiaShader {
    const rnsChilds = (children ?? []).map((c) => c.getShader());

    const shader = this._runtimeEffect.makeShaderWithChildren(
      uniforms as number[],
      isOpaque,
      rnsChilds,
      SkiaMatrix.toRNSMatrix(localMatrix),
    );

    return new SkiaShader(shader);
  }

  getUniform(index: number): SkSLUniform {
    return this._runtimeEffect.getUniform(index);
  }

  getUniformCount(): number {
    return this._runtimeEffect.getUniformCount();
  }

  getUniformFloatCount(): number {
    return this._runtimeEffect.getUniformFloatCount();
  }

  getUniformName(index: number): string {
    return this._runtimeEffect.getUniformName(index);
  }
}

export const SkiaRuntimeEffectFactory = {
  Make(
    sksl: string,
    callback?: (err: string) => void,
  ): SkiaRuntimeEffect | null {
    const effect = Skia.RuntimeEffect.Make(sksl);

    if (effect) {
      return new SkiaRuntimeEffect(effect);
    }

    return null;
  },
};
