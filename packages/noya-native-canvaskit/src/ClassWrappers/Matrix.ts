import { skiaMatrix3, Matrix } from '@shopify/react-native-skia';
import type { Matrix3x3, AngleInRadians } from 'canvaskit';

import * as matrixUtils from '../utils/matrix';

export const SkiaMatrix = {
  /**
   * Returns a new identity 3x3 matrix.
   */
  identity(): number[] {
    // prettier-ignore
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  },

  /**
   * Returns the inverse of the given 3x3 matrix or null if it is not invertible.
   * @param m
   */
  invert(m: Matrix3x3 | number[]): number[] | null {
    // TODO: NOT used within noya yet
    console.warn(`SkiaMatrix.invert not implemented!`);
    return m as number[];
  },

  /**
   * Maps the given 2d points according to the given 3x3 matrix.
   * @param m
   * @param points - the flattened points to map; the results are computed in place on this array.
   */
  mapPoints(m: Matrix3x3 | number[], points: number[]): number[] {
    // TODO: NOT used within noya yet
    console.warn(`SkiaMatrix.mapPoints not implemented!`);

    return m as number[];
  },

  /**
   * Multiplies the provided 3x3 matrices together from left to right.
   * @param matrices
   */
  multiply(...matrices: Array<Matrix3x3 | number[]>): number[] {
    // let res = [...matrices[0]];

    // for (let i = 1; i < matrices.length; i += 1) {
    //   const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = res;
    //   const [b00, b01, b02, b10, b11, b12, b20, b21, b22] = matrices[i];

    //   res = [
    //     a00 * b00 + a01 * b10 + a02 * b20,
    //     a00 * b01 + a01 * b11 + a02 * b21,
    //     a00 * b02 + a01 * b12 + a02 * b22,

    //     a10 * b00 + a11 * b10 + a12 * b20,
    //     a10 * b01 + a11 * b11 + a12 * b21,
    //     a10 * b02 + a11 * b12 + a12 * b22,

    //     a20 * b00 + a21 * b10 + a22 * b20,
    //     a20 * b01 + a21 * b11 + a22 * b21,
    //     a20 * b02 + a21 * b12 + a22 * b22,
    //   ];
    // }

    // return res;
    let res = [...matrices[0]];

    for (let i = 1; i < matrices.length; i += 1) {
      const a = [...res];
      const b = matrices[i];

      res = matrixUtils.multiply(a, b) as number[];
    }

    return res;
  },

  /**
   * Returns a new 3x3 matrix representing a rotation by n radians.
   * @param radians
   * @param px - the X value to rotate around, defaults to 0.
   * @param py - the Y value to rotate around, defaults to 0.
   */
  rotated(radians: AngleInRadians, px?: number, py?: number): number[] {
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

  /**
   * Returns a new 3x3 matrix representing a scale in the x and y directions.
   * @param sx - the scale in the X direction.
   * @param sy - the scale in the Y direction.
   * @param px - the X value to scale from, defaults to 0.
   * @param py - the Y value to scale from, defaults to 0.
   */
  scaled(sx: number, sy: number, px?: number, py?: number): number[] {
    const tx = px ?? 0;
    const ty = py ?? 0;
    const scale = [sx, 0, 0, 0, sy, 0, 0, 0, 1];

    return this.multiply(
      this.translated(-tx, -ty),
      scale,
      this.translated(tx, ty),
    );
  },

  /**
   * Returns a new 3x3 matrix representing a scale in the x and y directions.
   * @param kx - the kurtosis in the X direction.
   * @param ky - the kurtosis in the Y direction.
   * @param px - the X value to skew from, defaults to 0.
   * @param py - the Y value to skew from, defaults to 0.
   */
  skewed(kx: number, ky: number, px?: number, py?: number): number[] {
    const tx = px ?? 0;
    const ty = py ?? 0;
    const skew = [1, kx, 0, ky, 1, 0, 0, 0, 1];

    return this.multiply(
      this.translated(-tx, -ty),
      skew,
      this.translated(tx, ty),
    );
  },

  /**
   * Returns a new 3x3 matrix representing a translation in the x and y directions.
   * @param dx
   * @param dy
   */
  translated(dx: number, dy: number): number[] {
    return [1, 0, dx, 0, 1, dy, 0, 0, 1];
  },

  toRNSMatrix(inMat?: Float32Array | number[]): Matrix | undefined {
    if (!inMat) {
      return undefined;
    }

    return skiaMatrix3([
      [inMat[0], inMat[1], inMat[2]],
      [inMat[3], inMat[4], inMat[5]],
      [inMat[6], inMat[7], inMat[8]],
    ]);
  },
};
