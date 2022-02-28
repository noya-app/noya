import type { CanvasKit } from 'canvaskit-types';
import { toRadians } from 'noya-geometry';

// Descriptions of color filters:
// https://www.w3.org/TR/filter-effects-1

// Guide to brightness/contrast/saturation matrix:
// https://docs.rainmeter.net/tips/colormatrix-guide/

const lumR = 0.2125;
const lumG = 0.7154;
const lumB = 0.0721;

// https://en.wikipedia.org/wiki/SRGB#The_reverse_transformation_(sRGB_to_CIE_XYZ)
export function getGammaExpandedComponent(c: number) {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Returns the luminance, a value in the range 0 to 1.
 *
 * Color components should be in the range 0 to 1.
 *
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(r: number, g: number, b: number) {
  return (
    lumR * getGammaExpandedComponent(r) +
    lumG * getGammaExpandedComponent(g) +
    lumB * getGammaExpandedComponent(b)
  );
}

export function getSaturationMatrix(CanvasKit: CanvasKit, s: number) {
  const sr = lumR * (1 - s);
  const sg = lumG * (1 - s);
  const sb = lumB * (1 - s);

  return CanvasKit.CreateMatrix(
    [
      [sr + s, sg, sb, 0, 0],
      [sr, sg + s, sb, 0, 0],
      [sr, sg, sb + s, 0, 0],
      [0, 0, 0, 1, 0],
    ].flat(),
  );
}

export function getBrightnessMatrix(CanvasKit: CanvasKit, w: number) {
  return CanvasKit.CreateMatrix(
    [
      [1, 0, 0, 0, w],
      [0, 1, 0, 0, w],
      [0, 0, 1, 0, w],
      [0, 0, 0, 1, 0],
    ].flat(),
  );
}

export function getContrastMatrix(CanvasKit: CanvasKit, c: number) {
  const t = (1 - c) / 2.0;
  return CanvasKit.CreateMatrix(
    [
      [c, 0, 0, 0, t],
      [0, c, 0, 0, t],
      [0, 0, c, 0, t],
      [0, 0, 0, 1, 0],
    ].flat(),
  );
}

// Hue rotation matrix code taken from Skia (BSD 3-Clause):
// https://github.com/google/skia/blob/a1feabd38305ea7f5e3961f96585fbe1f1c00f91/modules/svg/src/SkSVGFeColorMatrix.cpp#L56
export function getHueRotationMatrix(CanvasKit: CanvasKit, degrees: number) {
  const theta = toRadians(degrees);
  const c = Math.cos(theta);
  const s = Math.sin(theta);

  return CanvasKit.CreateMatrix(
    [
      [
        0.213 + c * 0.787 + s * -0.213,
        0.715 + c * -0.715 + s * -0.715,
        0.072 + c * -0.072 + s * 0.928,
        0,
        0,
      ],
      [
        0.213 + c * -0.213 + s * 0.143,
        0.715 + c * 0.285 + s * 0.14,
        0.072 + c * -0.072 + s * -0.283,
        0,
        0,
      ],
      [
        0.213 + c * -0.213 + s * -0.787,
        0.715 + c * -0.715 + s * 0.715,
        0.072 + c * 0.928 + s * 0.072,
        0,
        0,
      ],
      [0, 0, 0, 1, 0],
    ].flat(),
  );
}
