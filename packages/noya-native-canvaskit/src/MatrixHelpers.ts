import type { IMatrixHelpers, IColorMatrixHelpers } from 'canvaskit-types';

import type { InputMatrix } from './types';

function multiply(a: InputMatrix, b: InputMatrix): InputMatrix {
  const size = Math.sqrt(a.length);
  const result: InputMatrix = new Array(a.length).fill(0);

  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < size; j += 1) {
      let aIdx = Math.floor(i / size) * size + j;
      let bIdx = j * size + (i % size);

      result[i] += a[aIdx] * b[bIdx];
    }
  }

  return result;
}

export const MatrixHelpers: IMatrixHelpers<InputMatrix> = {
  identity() {
    // prettier-ignore
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  },

  multiply(...matrices: Array<InputMatrix>): InputMatrix {
    let res = [...matrices[0]];

    for (let i = 1; i < matrices.length; i += 1) {
      const a = [...res];
      const b = matrices[i];

      res = multiply(a, b);
    }

    return res;
  },

  rotated(radians: number, px?: number, py?: number): InputMatrix {
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

  scaled(sx: number, sy: number, px?: number, py?: number): InputMatrix {
    const tx = px ?? 0;
    const ty = py ?? 0;
    const scale = [sx, 0, 0, 0, sy, 0, 0, 0, 1];

    return this.multiply(
      this.translated(-tx, -ty),
      scale,
      this.translated(tx, ty),
    );
  },

  skewed(kx: number, ky: number, px?: number, py?: number): InputMatrix {
    const tx = px ?? 0;
    const ty = py ?? 0;
    const skew = [1, kx, 0, ky, 1, 0, 0, 0, 1];

    return this.multiply(
      this.translated(-tx, -ty),
      skew,
      this.translated(tx, ty),
    );
  },

  translated(dx: number, dy: number): InputMatrix {
    // prettier-ignore
    return [
      1, 0, dx,
      0, 1, dy,
      0, 0, 1
    ];
  },
};

export const ColorMatrixHelpers: IColorMatrixHelpers<InputMatrix> = {
  concat(outer: InputMatrix, inner: InputMatrix): InputMatrix {
    return multiply(outer, inner) as InputMatrix;
  },

  identity(): InputMatrix {
    // prettier-ignore
    return  [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  postTranslate(
    m: InputMatrix,
    dr: number,
    dg: number,
    db: number,
    da: number,
  ): InputMatrix {
    console.warn(`SkiaColorMatrix.postTranslate not implemented!`);
    return this.identity();
  },

  rotated(axis: number, sine: number, cosine: number): InputMatrix {
    console.warn(`SkiaColorMatrix.rotated not implemented!`);

    return this.identity();
  },

  scaled(
    redScale: number,
    greenScale: number,
    blueScale: number,
    alphaScale: number,
  ): InputMatrix {
    console.warn(`SkiaColorMatrix.scaled not implemented!`);

    return this.identity();
  },
};
