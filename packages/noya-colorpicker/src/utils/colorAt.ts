import { RgbaColor } from '../types';

export interface PositionHsva {
  color: RgbaColor;
  pos: number;
}

export const RGBA_MAX = { r: 256, g: 256, b: 256, a: 1 };
/**
 * Linearly compute the step size between start and end (not normalized)
 */
 function stepize(start: RgbaColor, end: RgbaColor, steps: number) {
    let step: RgbaColor = RGBA_MAX;

    let key: keyof RgbaColor;
    for (key in start) {
      step[key] = steps === 0 ? 0 : (end[key] - start[key]) / steps;
    }

    return step;
  }

  /**
   * Compute the final step color
   */
  function interpolate(
    step: RgbaColor,
    start: RgbaColor,
    i: number,
    max: RgbaColor,
  ) {
    let color: RgbaColor = RGBA_MAX;

    let k: keyof RgbaColor;
    for (k in start) {
        color[k] = step[k] * i + start[k];
        color[k] = color[k] < 0 ? color[k] + max[k] : color[k];
    }

    return color;
  }

  export function colorAt(stops: PositionHsva[], pos: number, max: RgbaColor) {
    let start, end;
    for (let i = 0, l = stops.length; i < l - 1; i++) {
      if (pos >= stops[i].pos && pos < stops[i + 1].pos) {
        start = stops[i];
        end = stops[i + 1];
        break;
      }
    }

    if (!start || !end) {
      start = end = stops[stops.length - 1];
    }

    const step = stepize(start.color, end.color, (end.pos - start.pos) * 100000);
    const color = interpolate(step, start.color, (pos - start.pos) * 100000, max);
    color.a = 1;
    return color;
  } 