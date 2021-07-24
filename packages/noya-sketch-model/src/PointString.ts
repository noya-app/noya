import { Point } from 'noya-geometry';

export const PointString = {
  decode(pointString: string): Point {
    const [x, y] = pointString.slice(1, -1).split(',');

    return { x: parseFloat(x), y: parseFloat(y) };
  },

  encode({ x, y }: Point): string {
    return `{${x.toString()},${y.toString()}}`;
  },
};
