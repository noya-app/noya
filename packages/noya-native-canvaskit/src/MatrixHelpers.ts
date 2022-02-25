import type { IMatrixHelpers, IColorMatrixHelpers } from 'canvaskit-types';

import type { Matrix, ColorMatrix } from './types';

function multiply(a: number[], b: number[]): number[] {
  const size = Math.sqrt(a.length);
  const result: number[] = new Array(a.length).fill(0);

  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < size; j += 1) {
      let aIdx = Math.floor(i / size) * size + j;
      let bIdx = j * size + (i % size);

      result[i] += a[aIdx] * b[bIdx];
    }
  }

  return result;
}

export const MatrixHelpers: IMatrixHelpers<Matrix> = {
  identity() {
    // prettier-ignore
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  },

  multiply(...matrices: Array<Matrix>): Matrix {
    let res = [...matrices[0]];

    for (let i = 1; i < matrices.length; i += 1) {
      const a = [...res];
      const b = matrices[i];

      res = multiply(a, b) as Matrix;
    }

    return res;
  },

  rotated(radians: number, px?: number, py?: number): Matrix {
    const tx = px ?? 0;
    const ty = py ?? 0;
    const cosR = Math.cos(radians);
    const sinR = Math.sin(radians);
    const rotation = [cosR, -sinR, 0, sinR, cosR, 0, 0, 0, 1];

    return this.multiply(
      this.translated(-tx, -ty),
      rotation,
      this.translated(tx, ty),
    );
  },

  scaled(sx: number, sy: number, px?: number, py?: number): Matrix {
    const tx = px ?? 0;
    const ty = py ?? 0;
    const scale = [sx, 0, 0, 0, sy, 0, 0, 0, 1];

    return this.multiply(
      this.translated(-tx, -ty),
      scale,
      this.translated(tx, ty),
    );
  },

  skewed(kx: number, ky: number, px?: number, py?: number): Matrix {
    const tx = px ?? 0;
    const ty = py ?? 0;
    const skew = [1, kx, 0, ky, 1, 0, 0, 0, 1];

    return this.multiply(
      this.translated(-tx, -ty),
      skew,
      this.translated(tx, ty),
    );
  },

  translated(dx: number, dy: number): Matrix {
    return [1, 0, dx, 0, 1, dy, 0, 0, 1];
  },
};

export const ColorMatrixHelpers: IColorMatrixHelpers<ColorMatrix> = {
  concat(outer: ColorMatrix, inner: ColorMatrix): ColorMatrix {
    return multiply(outer, inner) as ColorMatrix;
  },

  identity(): ColorMatrix {
    // prettier-ignore
    return  [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  postTranslate(
    m: ColorMatrix,
    dr: number,
    dg: number,
    db: number,
    da: number,
  ): ColorMatrix {
    console.warn(`SkiaColorMatrix.postTranslate not implemented!`);
    return this.identity();
  },

  rotated(axis: number, sine: number, cosine: number): ColorMatrix {
    console.warn(`SkiaColorMatrix.rotated not implemented!`);

    return this.identity();
  },

  scaled(
    redScale: number,
    greenScale: number,
    blueScale: number,
    alphaScale: number,
  ): ColorMatrix {
    console.warn(`SkiaColorMatrix.scaled not implemented!`);

    return this.identity();
  },
};
