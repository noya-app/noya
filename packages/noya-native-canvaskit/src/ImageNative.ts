import {
  Skia,
  TileMode,
  FilterMode,
  MipmapMode,
  IImage as RNSImage,
} from '@shopify/react-native-skia';

import type { IImage, IShader } from 'canvaskit-types';
import type { ImageFormat, Matrix } from './types';

const toRNSMatrix = (m?: Matrix) => {
  if (!m) {
    return undefined;
  }

  const r = Skia.Matrix();

  r.set(0, m[0]);
  r.set(1, m[1]);
  r.set(2, m[2]);
  r.set(3, m[3]);
  r.set(4, m[4]);
  r.set(5, m[5]);
  r.set(6, m[6]);
  r.set(7, m[7]);
  r.set(8, m[8]);

  return r;
};

export default class ImageNative implements IImage<Matrix> {
  constructor(private _image: RNSImage) {}

  encodeToBytes(fmt?: ImageFormat, quality?: number): Uint8Array | null {
    return this._image.encodeToBytes(fmt, quality);
  }

  // @ts-ignore
  getColorSpace(): ColorSpace {
    console.warn(`SkiaImage.getColorSpace not implemented!`);
  }

  // @ts-ignore
  getImageInfo(): PartialImageInfo {
    console.warn(`SkiaImage.getImageInfo not implemented!`);
  }

  height() {
    return this._image.height();
  }

  // @ts-ignore
  makeCopyWithDefaultMipmaps(): IImage<Matrix> {
    console.warn(`SkiaImage.makeCopyWithDefaultMipmaps not implemented!`);
  }

  makeShaderCubic(
    tx: TileMode,
    ty: TileMode,
    B: number,
    C: number,
    localMatrix?: Matrix,
  ): IShader {
    return this._image.makeShaderCubic(tx, ty, B, C, toRNSMatrix(localMatrix));
  }

  // @ts-ignore
  makeShaderOptions(
    tx: TileMode,
    ty: TileMode,
    fm: FilterMode,
    mm: MipmapMode,
    localMatrix?: Matrix,
  ): IShader {
    return this._image.makeShaderOptions(
      tx,
      ty,
      fm,
      mm,
      toRNSMatrix(localMatrix),
    );
  }

  readPixels(
    srcX: number,
    srcY: number,
    imageInfo: any,
    dest?: any,
    bytesPerRow?: number,
    // @ts-ignore
  ): Uint8Array | Float32Array | null {
    console.warn(`SkiaImage.readPixels not implemented!`);
  }

  width() {
    return this._image.width();
  }
}
