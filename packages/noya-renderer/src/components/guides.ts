import { Bounds, distance, Point, Axis } from 'noya-geometry';

export type DistanceMeasurementProps = {
  distance: number;
  midpoint: Point;
};

type BoundsKey = keyof Bounds;
export type Direction = '+' | '-';
type AxisDirectionPair = [Direction, Axis];

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
  extension: Point[];
  measurement: Point[];
  distanceMeasurement: DistanceMeasurementProps;
};

export function getGuides(
  mainDirection: Direction,
  mainAxis: Axis,
  selected: Bounds,
  highlighted: Bounds,
): Guides | undefined {
  const m = mainAxis;
  const c = mainAxis === 'x' ? 'y' : 'x';

  const [minM, , maxM] = getAxisProperties(m, mainDirection);
  const [minC, midC, maxC] = getAxisProperties(c, '+');

  const [startC, endC] =
    selected[midC] > highlighted[midC]
      ? [highlighted[maxC], selected[maxC]]
      : [highlighted[minC], selected[minC]];

  // Is `a` further along the direction of the primary axis than `b`?
  const isFurther = (a: number, b: number) =>
    mainDirection === '+' ? a > b : a < b;

  let edge = isFurther(selected[minM], highlighted[maxM])
    ? highlighted[maxM]
    : isFurther(selected[maxM], highlighted[maxM]) ||
      isFurther(selected[minM], highlighted[minM])
    ? highlighted[minM]
    : undefined;

  if (edge === undefined) return;

  const extension = [
    { [m]: edge, [c]: startC } as Point,
    { [m]: edge, [c]: endC } as Point,
  ];

  const measurement = [
    { [m]: selected[minM], [c]: selected[midC] } as Point,
    { [m]: edge, [c]: selected[midC] } as Point,
  ];

  const itemDistance = distance(
    { [m]: selected[minM], [c]: selected[midC] } as Point,
    { [m]: edge, [c]: selected[midC] } as Point,
  );

  const distanceMeasurement: DistanceMeasurementProps = {
    distance: itemDistance,
    midpoint: {
      [m]: (selected[minM] + edge) / 2,
      [c]: selected[midC],
    } as Point,
  };

  return { extension, measurement, distanceMeasurement };
}
