import { Axis, Bounds, createBounds, Point, Rect } from 'noya-geometry';

export type DistanceMeasurementProps = {
  distance: number;
  midpoint: Point;
};

type BoundsKey = keyof Bounds;
export type Direction = '+' | '-';
type AxisDirectionPair = [Direction, Axis];

export const AXES: Axis[] = ['x', 'y'];
export const X_DIRECTIONS: AxisDirectionPair[] = [
  ['+', 'x'],
  ['-', 'x'],
];
export const Y_DIRECTIONS: AxisDirectionPair[] = [
  ['+', 'y'],
  ['-', 'y'],
];
export const ALL_DIRECTIONS = [...X_DIRECTIONS, ...Y_DIRECTIONS];

export function getAxisProperties(
  axis: Axis,
  direction: Direction,
): [BoundsKey, BoundsKey, BoundsKey] {
  switch (`${direction}${axis}` as const) {
    case '+x':
      return ['minX', 'midX', 'maxX'];
    case '-x':
      return ['maxX', 'midX', 'minX'];
    case '+y':
      return ['minY', 'midY', 'maxY'];
    case '-y':
      return ['maxY', 'midY', 'minY'];
  }
}

export type Guides = {
  extension: [Point, Point];
  measurement: [Point, Point];
};

export function getGuides(
  mainDirection: Direction,
  mainAxis: Axis,
  sourceRect: Rect,
  targetRect: Rect,
): Guides | undefined {
  const source = createBounds(sourceRect);
  const target = createBounds(targetRect);

  const m = mainAxis;
  const c = mainAxis === 'x' ? 'y' : 'x';

  const [minM, , maxM] = getAxisProperties(m, mainDirection);
  const [minC, midC, maxC] = getAxisProperties(c, '+');

  const [startC, endC] =
    source[midC] > target[midC]
      ? [target[maxC], source[maxC]]
      : [target[minC], source[minC]];

  // Is `a` further along the direction of the primary axis than `b`?
  const isFurther = (a: number, b: number) =>
    mainDirection === '+' ? a > b : a < b;

  let edge = isFurther(source[minM], target[maxM])
    ? target[maxM]
    : isFurther(source[maxM], target[maxM]) ||
      isFurther(source[minM], target[minM])
    ? target[minM]
    : undefined;

  if (edge === undefined) return;

  const extension: [Point, Point] = [
    { [m]: edge, [c]: startC } as Point,
    { [m]: edge, [c]: endC } as Point,
  ];

  const measurement: [Point, Point] = [
    { [m]: source[minM], [c]: source[midC] } as Point,
    { [m]: edge, [c]: source[midC] } as Point,
  ];

  return { extension, measurement };
}
