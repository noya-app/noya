import Sketch from 'noya-file-format';
import { sketchColorToRgbaString } from 'noya-utils';

const getRGBAColor = (value: Sketch.GradientStop[], num: 100 | 360) =>
  [...value]
    .sort((a, b) => a.position - b.position)
    .map(
      (g) =>
        `${sketchColorToRgbaString(g.color)} ${g.position * num}${
          num === 100 ? '%' : 'deg'
        }`,
    )
    .join(', \n');

export function getGradientBackground(
  value: Sketch.GradientStop[],
  type: Sketch.GradientType,
  direction?: number,
) {
  if (type === Sketch.GradientType.Angular) {
    return `conic-gradient(${getRGBAColor(value, 360)})`;
  }

  const color = getRGBAColor(value, 100);
  const position =
    type === Sketch.GradientType.Radial
      ? 'radial-gradient(circle'
      : `linear-gradient(${
          typeof direction !== undefined ? direction : 180
        }deg`;

  return `${position}, ${color})`;
}
