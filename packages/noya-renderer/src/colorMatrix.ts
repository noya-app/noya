import { toRadians } from 'noya-geometry';

// Descriptions of color filters:
// https://www.w3.org/TR/filter-effects-1

// Guide to brightness/contrast/saturation matrix:
// https://docs.rainmeter.net/tips/colormatrix-guide/

const lumR = 0.2125;
const lumG = 0.7154;
const lumB = 0.0721;

export function getSaturationMatrix(s: number) {
  const sr = lumR * (1 - s);
  const sg = lumG * (1 - s);
  const sb = lumB * (1 - s);

  return new Float32Array(
    [
      [sr + s, sg, sb, 0, 0],
      [sr, sg + s, sb, 0, 0],
      [sr, sg, sb + s, 0, 0],
      [0, 0, 0, 1, 0],
    ].flat(),
  );
}

export function getBrightnessMatrix(w: number) {
  return new Float32Array(
    [
      [1, 0, 0, 0, w],
      [0, 1, 0, 0, w],
      [0, 0, 1, 0, w],
      [0, 0, 0, 1, 0],
    ].flat(),
  );
}

export function getContrastMatrix(c: number) {
  const t = (1 - c) / 2.0;
  return new Float32Array(
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
export function getHueRotationMatrix(degrees: number) {
  const theta = toRadians(degrees);
  const c = Math.cos(theta);
  const s = Math.sin(theta);

  return new Float32Array(
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
