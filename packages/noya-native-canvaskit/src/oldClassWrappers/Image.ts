import {
  IImage,
  TileMode,
  FilterMode,
  MipmapMode,
} from '@shopify/react-native-skia';

import type {
  MallocObj,
  ImageInfo,
  ColorSpace,
  PartialImageInfo,
  EncodedImageFormat,
} from 'canvaskit';
import { SkiaShader } from './Shader';
import { SkiaMatrix } from './Matrix';
import { JSEmbindObject } from './Embind';

export class SkiaImage extends JSEmbindObject {
  constructor(private _image: IImage) {
    super();
  }

  encodeToBytes(fmt?: EncodedImageFormat, quality?: number): Uint8Array | null {
    return this._image.encodeToBytes(fmt?.value, quality);
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
  makeCopyWithDefaultMipmaps(): SkiaImage {
    console.warn(`SkiaImage.makeCopyWithDefaultMipmaps not implemented!`);
  }

  makeShaderCubic(
    tx: TileMode,
    ty: TileMode,
    B: number,
    C: number,
    localMatrix?: Float32Array | number[],
  ): SkiaShader {
    const shader = this._image.makeShaderCubic(
      tx,
      ty,
      B,
      C,
      SkiaMatrix.toRNSMatrix(localMatrix),
    );

    return new SkiaShader(shader);
  }

  // @ts-ignore
  makeShaderOptions(
    tx: TileMode,
    ty: TileMode,
    fm: FilterMode,
    mm: MipmapMode,
    localMatrix?: Float32Array | number[],
  ): SkiaShader {
    const shader = this._image.makeShaderOptions(
      tx,
      ty,
      fm,
      mm,
      SkiaMatrix.toRNSMatrix(localMatrix),
    );

    return new SkiaShader(shader);
  }

  readPixels(
    srcX: number,
    srcY: number,
    imageInfo: ImageInfo,
    dest?: MallocObj,
    bytesPerRow?: number,
    // @ts-ignore
  ): Uint8Array | Float32Array | null {
    console.warn(`SkiaImage.readPixels not implemented!`);
  }

  width() {
    return this._image.width();
  }

  getImage() {
    return this._image;
  }
}
