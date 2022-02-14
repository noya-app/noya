import { Skia } from '@shopify/react-native-skia';

import type { Matrix3x3Helpers, Matrix3x3, AngleInRadians } from 'canvaskit';

export const SkiaMatrix: Matrix3x3Helpers = {
  /**
   * Returns a new identity 3x3 matrix.
   */
  identity(): number[] {
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  },

  /**
   * Returns the inverse of the given 3x3 matrix or null if it is not invertible.
   * @param m
   */
  invert(m: Matrix3x3 | number[]): number[] | null {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },

  /**
   * Maps the given 2d points according to the given 3x3 matrix.
   * @param m
   * @param points - the flattened points to map; the results are computed in place on this array.
   */
  mapPoints(m: Matrix3x3 | number[], points: number[]): number[] {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },

  /**
   * Multiplies the provided 3x3 matrices together from left to right.
   * @param matrices
   */
  multiply(...matrices: Array<Matrix3x3 | number[]>): number[] {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },

  /**
   * Returns a new 3x3 matrix representing a rotation by n radians.
   * @param radians
   * @param px - the X value to rotate around, defaults to 0.
   * @param py - the Y value to rotate around, defaults to 0.
   */
  rotated(radians: AngleInRadians, px?: number, py?: number): number[] {
    const cosR = Math.cos(radians);
    const sinR = Math.sin(radians);
    return [cosR, -sinR, 0, sinR, cosR, 0, 0, 0, 1];
  },

  /**
   * Returns a new 3x3 matrix representing a scale in the x and y directions.
   * @param sx - the scale in the X direction.
   * @param sy - the scale in the Y direction.
   * @param px - the X value to scale from, defaults to 0.
   * @param py - the Y value to scale from, defaults to 0.
   */
  scaled(sx: number, sy: number, px?: number, py?: number): number[] {
    return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
  },

  /**
   * Returns a new 3x3 matrix representing a scale in the x and y directions.
   * @param kx - the kurtosis in the X direction.
   * @param ky - the kurtosis in the Y direction.
   * @param px - the X value to skew from, defaults to 0.
   * @param py - the Y value to skew from, defaults to 0.
   */
  skewed(kx: number, ky: number, px?: number, py?: number): number[] {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
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
};
