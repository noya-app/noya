import type { EnumEntity } from './Enums';
import type { IShader } from './IShader';
import type { IPartialImageInfo, IImageInfo, MallocObj } from './misc';

export interface IImage<IMatrix> {
  encodeToBytes(fmt?: EnumEntity, quality?: number): Uint8Array | null;
  getColorSpace(): EnumEntity;
  getImageInfo(): IPartialImageInfo;
  height(): number;
  makeCopyWithDefaultMipmaps(): IImage<IMatrix>;
  makeShaderCubic(
    tx: EnumEntity,
    ty: EnumEntity,
    B: number,
    C: number,
    localMatrix?: IMatrix,
  ): IShader;
  makeShaderOptions(
    tx: EnumEntity,
    ty: EnumEntity,
    fm: EnumEntity,
    mm: EnumEntity,
    localMatrix?: IMatrix,
  ): IShader;
  readPixels(
    srcX: number,
    srcY: number,
    imageInfo: IImageInfo,
    dest?: MallocObj,
    bytesPerRow?: number,
    // TODO: probably different type
  ): Uint8Array | Float32Array | null;
  width(): number;
}
