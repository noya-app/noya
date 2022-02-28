import {
  Skia,
  TileMode,
  FilterMode,
  MipmapMode,
  IImage as RNSImage,
} from '@shopify/react-native-skia';

import type { IImage, IShader } from 'canvaskit-types';
import type { ImageFormat, Matrix } from './types';
import { JSEmbindObject } from './misc';

export default class ImageNative
  extends JSEmbindObject
  implements IImage<Matrix>
{
  constructor(private _image: RNSImage) {
    super();
  }

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
    return this._image.makeShaderCubic(tx, ty, B, C, localMatrix);
  }

  // @ts-ignore
  makeShaderOptions(
    tx: TileMode,
    ty: TileMode,
    fm: FilterMode,
    mm: MipmapMode,
    localMatrix?: Matrix,
  ): IShader {
    return this._image.makeShaderOptions(tx, ty, fm, mm, localMatrix);
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

  getRNSImage() {
    return this._image;
  }
}
