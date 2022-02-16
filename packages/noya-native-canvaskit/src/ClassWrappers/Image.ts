import { IImage, TileMode as SkiaTileMode } from '@shopify/react-native-skia';

import type {
  Image,
  Shader,
  MallocObj,
  ImageInfo,
  MipmapMode,
  FilterMode,
  ColorSpace,
  PartialImageInfo,
  EncodedImageFormat,
} from 'canvaskit';
import { JSEmbindObject } from './Embind';
import { SkiaShader } from './Shader';
import { SkiaMatrix } from './Matrix';

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
    tx: SkiaTileMode,
    ty: SkiaTileMode,
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

  makeShaderOptions(
    tx: SkiaTileMode,
    ty: SkiaTileMode,
    fm: FilterMode,
    mm: MipmapMode,
    localMatrix?: Float32Array | number[],
  ): Shader {
    const shader = this._image.makeShaderOptions(
      tx,
      ty,
      fm.value,
      mm.value,
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
