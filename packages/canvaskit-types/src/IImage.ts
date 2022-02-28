import type {
  IImageFormat,
  IColorSpace,
  ITileMode,
  IMipmapMode,
} from './Enums';
import type { IShader } from './IShader';
import type {
  MallocObj,
  IImageInfo,
  EmbindObject,
  IPartialImageInfo,
} from './misc';

export interface IImage<IMatrix> extends EmbindObject {
  encodeToBytes(fmt?: IImageFormat, quality?: number): Uint8Array | null;
  getColorSpace(): IColorSpace;
  getImageInfo(): IPartialImageInfo;
  height(): number;
  makeCopyWithDefaultMipmaps(): IImage<IMatrix>;
  makeShaderCubic(
    tx: ITileMode,
    ty: ITileMode,
    B: number,
    C: number,
    localMatrix?: IMatrix,
  ): IShader;
  makeShaderOptions(
    tx: ITileMode,
    ty: ITileMode,
    fm: IImageFormat,
    mm: IMipmapMode,
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
