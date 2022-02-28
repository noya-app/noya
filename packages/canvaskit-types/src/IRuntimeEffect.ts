import { EmbindObject } from './misc';
import { IShader } from './IShader';

export interface IRuntimeEffect<IMatrix> extends EmbindObject {
  makeShader(
    uniforms: number[],
    isOpaque?: boolean,
    localMatrix?: IMatrix,
  ): IShader;
}

export interface IRuntimeEffectFactory<IMatrix> {
  Make(
    sksl: string,
    callback?: (err: string) => void,
  ): IRuntimeEffect<IMatrix> | null;
}
