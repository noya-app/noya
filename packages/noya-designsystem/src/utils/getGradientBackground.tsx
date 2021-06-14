import Sketch from '@sketch-hq/sketch-file-format-ts';
import { sketchColorToRgbaString } from '..';

export function getGradientBackground(
  value: Sketch.GradientStop[],
  type?: Sketch.GradientType,
) {
  if (type === Sketch.GradientType.Angular) {
    const color = [...value]
      .sort((a, b) => a.position - b.position)
      .map((g) => `${sketchColorToRgbaString(g.color)} ${g.position * 360}deg`)
      .join(', \n');

    return `conic-gradient(${color})`;
  }

  const color = [...value]
    .sort((a, b) => a.position - b.position)
    .map((g) => `${sketchColorToRgbaString(g.color)} ${g.position * 100}%`)
    .join(', \n');

  const position =
    type === Sketch.GradientType.Radial
      ? 'radial-gradient(circle'
      : `linear-gradient(${type !== undefined ? 0 : 90}deg`;

  return `${position}, ${color})`;
}
