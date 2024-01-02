import type { Sketch } from '@noya-app/noya-file-format';
import {
  hsvaToRgbaString,
  RgbaColor,
  rgbaToHex,
  rgbaToHsva,
} from 'noya-colorpicker';

export function sketchColorToRgba(value: Sketch.Color): RgbaColor {
  return {
    r: Math.floor(value.red * 255),
    g: Math.floor(value.green * 255),
    b: Math.floor(value.blue * 255),
    a: value.alpha,
  };
}

export function sketchColorToRgbaString(value: Sketch.Color): string {
  return hsvaToRgbaString(rgbaToHsva(sketchColorToRgba(value)));
}

export function rgbaToSketchColor(value: RgbaColor): Sketch.Color {
  return {
    _class: 'color',
    alpha: value.a,
    red: value.r / 255,
    green: value.g / 255,
    blue: value.b / 255,
  };
}

export function sketchColorToHex(value: Sketch.Color): string {
  return rgbaToHex(sketchColorToRgba(value)).toUpperCase();
}
