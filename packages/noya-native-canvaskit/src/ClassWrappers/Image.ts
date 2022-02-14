import { IImage } from '@shopify/react-native-skia';

import type {
  Image,
  ColorSpace,
  EncodedImageFormat,
  PartialImageInfo,
  InputMatrix,
  Shader,
  TileMode,
  ImageInfo,
  MipmapMode,
  FilterMode,
  MallocObj,
} from 'canvaskit';
import { JSEmbindObject } from './Embind';
import { SkiaShader } from './Shader';

export class SkiaImage extends JSEmbindObject implements Image {
  constructor(private _image: IImage) {
    super();
  }

  encodeToBytes(fmt?: EncodedImageFormat, quality?: number): Uint8Array | null {
    return this._image.encodeToBytes(fmt?.value, quality);
  }

  getColorSpace(): ColorSpace {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getImageInfo(): PartialImageInfo {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  height() {
    return this._image.height();
  }

  makeCopyWithDefaultMipmaps(): Image {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  makeShaderCubic(
    tx: TileMode,
    ty: TileMode,
    B: number,
    C: number,
    localMatrix?: InputMatrix,
  ): SkiaShader {
    const shader = this._image.makeShaderCubic(
      tx.value,
      ty.value,
      B,
      C,
      /* , localMatrix */
    );

    return new SkiaShader(shader);
  }

  makeShaderOptions(
    tx: TileMode,
    ty: TileMode,
    fm: FilterMode,
    mm: MipmapMode,
    localMatrix?: InputMatrix,
  ): Shader {
    const shader = this._image.makeShaderOptions(
      tx.value,
      ty.value,
      fm.value,
      mm.value,
      /* localMatrix */
    );

    return new SkiaShader(shader);
  }

  readPixels(
    srcX: number,
    srcY: number,
    imageInfo: ImageInfo,
    dest?: MallocObj,
    bytesPerRow?: number,
  ): Uint8Array | Float32Array | null {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  width() {
    return this._image.width();
  }

  getImage() {
    return this._image;
  }
}
