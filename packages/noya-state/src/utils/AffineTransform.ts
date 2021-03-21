import { Point } from '../types';

export interface Transformable {
  transform(affineTransform: AffineTransform): this;
}

/**
 * For more details:
 *
 * https://en.wikipedia.org/wiki/Transformation_matrix#Affine_transformations
 * https://people.cs.clemson.edu/~dhouse/courses/401/notes/affines-matrices.pdf
 */
export class AffineTransform implements Transformable {
  m00: number;
  m01: number;
  m02: number;
  m10: number;
  m11: number;
  m12: number;

  constructor([m00, m01, m02, m10, m11, m12]: number[] = [0, 0, 0, 0, 0, 0]) {
    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;
    this.m10 = m10;
    this.m11 = m11;
    this.m12 = m12;
  }

  // [ x']   [  m00  m01  m02  ] [ x ]   [ m00x + m01y + m02 ]
  // [ y'] = [  m10  m11  m12  ] [ y ] = [ m10x + m11y + m12 ]
  // [ 1 ]   [   0    0    1   ] [ 1 ]   [         1         ]
  applyTo(point: Point): Point {
    const { x, y } = point;
    const { m00, m01, m02, m10, m11, m12 } = this;

    return {
      x: m00 * x + m01 * y + m02,
      y: m10 * x + m11 * y + m12,
    };
  }

  transform(other: AffineTransform): this {
    return new AffineTransform([
      this.m00 * other.m00 + this.m01 * other.m10, // m00
      this.m00 * other.m01 + this.m01 * other.m11, // m01
      this.m00 * other.m02 + this.m01 * other.m12 + this.m02, // m02
      this.m10 * other.m00 + this.m11 * other.m10, // m10
      this.m10 * other.m01 + this.m11 * other.m11, // m11
      this.m10 * other.m02 + this.m11 * other.m12 + this.m12, // m12
    ]) as this;
  }

  get determinant() {
    return this.m00 * this.m11 - this.m01 * this.m10;
  }

  get isInvertible() {
    const det = this.determinant;

    return (
      isFinite(det) && isFinite(this.m02) && isFinite(this.m12) && det !== 0
    );
  }

  invert() {
    const det = this.determinant;

    return new AffineTransform([
      this.m11 / det, // m00
      -this.m01 / det, // m01
      (this.m01 * this.m12 - this.m11 * this.m02) / det, // m02
      -this.m10 / det, // m10
      this.m00 / det, // m11
      (this.m10 * this.m02 - this.m00 * this.m12) / det, // m12
    ]);
  }

  get float32Array(): Float32Array {
    return new Float32Array([
      this.m00,
      this.m01,
      this.m02,
      this.m10,
      this.m11,
      this.m12,
      0,
      0,
      1,
    ]);
  }

  // Static

  static get identity(): AffineTransform {
    return new AffineTransform([1, 0, 0, 0, 1, 0]);
  }

  static rotation(
    theta: number,
    rx: number = 0,
    ry: number = 0,
  ): AffineTransform {
    const rotation = new AffineTransform([
      Math.cos(theta),
      -Math.sin(theta),
      0,
      Math.sin(theta),
      Math.cos(theta),
      0,
    ]);

    if (rx !== 0 || ry !== 0) {
      return AffineTransform.multiply(
        AffineTransform.translation(-rx, -ry),
        rotation,
        AffineTransform.translation(rx, ry),
      );
    }

    return rotation;
  }

  static scale(sx: number, sy: number = sx): AffineTransform {
    return new AffineTransform([sx, 0, 0, 0, sy, 0]);
  }

  static translation(tx: number, ty: number): AffineTransform {
    return new AffineTransform([1, 0, tx, 0, 1, ty]);
  }

  static multiply(...[first, ...rest]: AffineTransform[]): AffineTransform {
    if (!first) return AffineTransform.identity;

    // if (!first) throw new Error('Bad call to AffineTransform.multiply');

    return rest.reduce((result, item) => item.transform(result), first);
  }
}
