import { Color } from '../types';

export function color4fToNum(color: Float32Array): Color {
  const [inR, inG, inB, inA] = color;

  const a = Math.floor(inA * 255) << 0;
  const r = Math.floor(inR * 255) << 24;
  const g = Math.floor(inG * 255) << 16;
  const b = Math.floor(inB * 255) << 8;

  const normalizedColor = a | r | g | b;

  // Stolen from react-native processColor :)
  return ((normalizedColor << 24) | (normalizedColor >>> 8)) >>> 0;
}

export function colorNumToArray(color: Color): number[] {
  const a = ((color & 0xff000000) >> 24) / 255.0;
  const r = ((color & 0x00ff0000) >> 16) / 255.0;
  const g = ((color & 0x0000ff00) >> 8) / 255.0;
  const b = (color & 0x000000ff) / 255.0;

  return [r, g, b, a];
}
