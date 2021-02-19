import { Point } from '../types';

export interface Transformable {
  transform(affineTransformation: AffineTransformation): this;
}

/**
 * For more details:
 *
 * https://en.wikipedia.org/wiki/Transformation_matrix#Affine_transformations
 * https://people.cs.clemson.edu/~dhouse/courses/401/notes/affines-matrices.pdf
 */
export class AffineTransformation implements Transformable {
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

  transform(other: AffineTransformation): this {
    return new AffineTransformation([
      this.m00 * other.m00 + this.m01 * other.m10, // m00
      this.m00 * other.m01 + this.m01 * other.m11, // m01
      this.m00 * other.m02 + this.m01 * other.m12 + this.m02, // m02
      this.m10 * other.m00 + this.m11 * other.m10, // m10
      this.m10 * other.m01 + this.m11 * other.m11, // m11
      this.m10 * other.m02 + this.m11 * other.m12 + this.m12, // m12
    ]) as this;
  }

  // Static

  static get identity(): AffineTransformation {
    return new AffineTransformation([1, 0, 0, 0, 1, 0]);
  }

  static rotation(theta: number): AffineTransformation {
    return new AffineTransformation([
      Math.cos(theta),
      -Math.sin(theta),
      0,
      Math.sin(theta),
      Math.cos(theta),
      0,
    ]);
  }

  static scale(sx: number, sy: number = sx): AffineTransformation {
    return new AffineTransformation([sx, 0, 0, 0, sy, 0]);
  }

  static translation(tx: number, ty: number): AffineTransformation {
    return new AffineTransformation([1, 0, tx, 0, 1, ty]);
  }

  static multiply(
    ...[first, ...rest]: AffineTransformation[]
  ): AffineTransformation {
    if (!first) throw new Error('Bad call to AffineTransformation.multiply');

    return rest.reduce((result, item) => item.transform(result), first);
  }
}
