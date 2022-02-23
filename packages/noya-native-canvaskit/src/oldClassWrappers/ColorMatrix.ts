import type { ColorMatrix } from 'canvaskit';

import * as matrixUtils from '../oldUtils/matrix';

/**
 * An ColorMatrix is a 4x4 color matrix that transforms the 4 color channels
 * with a 1x4 matrix that post-translates those 4 channels.
 * For example, the following is the layout with the scale (S) and post-transform
 * (PT) items indicated.
 * RS,  0,  0,  0 | RPT
 *  0, GS,  0,  0 | GPT
 *  0,  0, BS,  0 | BPT
 *  0,  0,  0, AS | APT
 */
export const SkiaColorMatrix = {
  /**
   * Returns a new ColorMatrix that is the result of multiplying outer*inner
   * @param outer
   * @param inner
   */
  concat(outer: ColorMatrix, inner: ColorMatrix): ColorMatrix {
    return matrixUtils.multiply(outer, inner) as ColorMatrix;
  },

  /**
   * Returns an identity ColorMatrix.
   */
  identity(): ColorMatrix {
    // prettier-ignore
    return  new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  },

  /**
   * Sets the 4 "special" params that will translate the colors after they are multiplied
   * by the 4x4 matrix.
   * @param m
   * @param dr - delta red
   * @param dg - delta green
   * @param db - delta blue
   * @param da - delta alpha
   */
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

  /**
   * Returns a new ColorMatrix that is rotated around a given axis.
   * @param axis - 0 for red, 1 for green, 2 for blue
   * @param sine - sin(angle)
   * @param cosine - cos(angle)
   */
  rotated(axis: number, sine: number, cosine: number): ColorMatrix {
    console.warn(`SkiaColorMatrix.rotated not implemented!`);

    return this.identity();
  },

  /**
   * Returns a new ColorMatrix that scales the colors as specified.
   * @param redScale
   * @param greenScale
   * @param blueScale
   * @param alphaScale
   */
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
