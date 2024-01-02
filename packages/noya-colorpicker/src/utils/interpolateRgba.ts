import { interpolate } from '@noya-app/noya-utils';
import { RgbaColor } from '../types';

export interface GradientStopRgba {
  color: RgbaColor;
  position: number;
}

const RGBA_COMPONENTS = ['r', 'g', 'b', 'a'] as const

export function interpolateRgba(stops: GradientStopRgba[], pos: number): RgbaColor {
  const color: RgbaColor = { r: 0, g: 0, b: 0, a: 1 };

  if (stops.length === 0) return color

  const sorted = [...stops].sort((a, b) => a.position - b.position);

  RGBA_COMPONENTS.forEach(component => {
    const inputRange = sorted.map(stop => stop.position)
    const outputRange = sorted.map(stop => stop.color[component])

    color[component] = interpolate(pos, { inputRange, outputRange })
  })

  return color;
} 