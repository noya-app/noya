import { Skia, IRuntimeEffect } from '@shopify/react-native-skia';

import type {
  RuntimeEffect,
  RuntimeEffectFactory,
  Shader,
  InputMatrix,
  SkSLUniform,
} from 'canvaskit';
import { JSEmbindObject } from './Embind';

class SkiaRuntimeEffect extends JSEmbindObject implements RuntimeEffect {
  constructor(private _runtimeEffect: IRuntimeEffect) {
    super();
  }

  getRuntimeEffect() {
    return this._runtimeEffect;
  }

  makeShader(
    uniforms: Float32Array | number[],
    isOpaque?: boolean,
    localMatrix?: InputMatrix,
  ): Shader {
    // TODO: add after implementiong shader wrapper
    // this._runtimeEffect.makeShader(
    //   uniforms as number[],
    //   isOpaque,
    //   localMatrix ? (localMatrix as number[]) : undefined,
    // );
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  makeShaderWithChildren(
    uniforms: Float32Array | number[],
    isOpaque?: boolean,
    children?: Shader[],
    localMatrix?: InputMatrix,
  ): Shader {
    // TODO: add after implementiong shader wrapper
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getUniform(index: number): SkSLUniform {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
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

export const SkiaRuntimeEffectFactory: RuntimeEffectFactory = {
  Make(sksl: string, callback?: (err: string) => void): RuntimeEffect | null {
    const effect = Skia.RuntimeEffect.Make(sksl);

    if (effect) {
      return new SkiaRuntimeEffect(effect);
    }

    return null;
  },
};
