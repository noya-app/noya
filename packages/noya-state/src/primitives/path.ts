import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit, Path, PathOp } from 'canvaskit';
import { distance, Point, Rect } from 'noya-geometry';
import { parsePoint, stringifyPoint } from 'noya-state';
import { rotate, windowsOf, zip } from 'noya-utils';

/**
 * The radius of an edge should be less than half the length of that edge
 */
function getEdgeRadius(a: Point, b: Point, cornerRadius: number): number {
  const dist = distance(a, b);

  return dist <= cornerRadius * 2 ? dist / 2 : cornerRadius;
}

/**
 * The radius of a corner should be symmetric on both sides
 */
function getCornerRadius(
  before: Point,
  corner: Point,
  after: Point,
  cornerRadius: number,
): number {
  const beforeRadius = getEdgeRadius(corner, before, cornerRadius);
  const afterRadius = getEdgeRadius(corner, after, cornerRadius);
  return Math.min(beforeRadius, afterRadius);
}

// Implementation loosely follows:
// https://github.com/google/skia/blob/13d6c4f55db0d1429f889704ed9b2e48968ac7a3/src/effects/SkCornerPathEffect.cpp#L24
function getStep(
  a: Point,
  b: Point,
  radius: number,
): { step: Point; drawSegment: boolean } {
  let dist = distance(a, b);

  const step: Point = { x: b.x - a.x, y: b.y - a.y };

  // Since we clamp radius beforehand, the dist will never be < radius * 2, only equal
  if (dist <= radius * 2) {
    step.x /= 2;
    step.y /= 2;

    return { step, drawSegment: false };
  }

  step.x *= radius / dist;
  step.y *= radius / dist;

  return { step, drawSegment: true };
}

export type DecodedCurvePoint = Omit<
  Sketch.CurvePoint,
  'curveFrom' | 'curveTo' | 'point'
> & {
  curveFrom: Point;
  curveTo: Point;
  point: Point;
};

export function scalePoint(point: Point, { x, y, width, height }: Rect): Point {
  return { x: x + point.x * width, y: y + point.y * height };
}

export function unscalePoint(
  point: Point,
  { x, y, width, height }: Rect,
): Point {
  return { x: (point.x - x) / width, y: (point.y - y) / height };
}

export function decodeCurvePoint(
  curvePoint: Sketch.CurvePoint,
  frame: Rect,
): DecodedCurvePoint {
  return {
    ...curvePoint,
    hasCurveFrom: curvePoint.hasCurveTo,
    hasCurveTo: curvePoint.hasCurveFrom,
    curveFrom: scalePoint(parsePoint(curvePoint.curveTo), frame),
    curveTo: scalePoint(parsePoint(curvePoint.curveFrom), frame),
    point: scalePoint(parsePoint(curvePoint.point), frame),
  };
}

export function encodeCurvePoint(
  curvePoint: DecodedCurvePoint,
  frame: Rect,
): Sketch.CurvePoint {
  return {
    ...curvePoint,
    hasCurveFrom: curvePoint.hasCurveTo,
    hasCurveTo: curvePoint.hasCurveFrom,
    curveFrom: stringifyPoint(unscalePoint(curvePoint.curveTo, frame)),
    curveTo: stringifyPoint(unscalePoint(curvePoint.curveFrom, frame)),
    point: stringifyPoint(unscalePoint(curvePoint.point, frame)),
  };
}

function curveTo(
  path: Path,
  current: DecodedCurvePoint,
  next: DecodedCurvePoint,
) {
  const curveTo = current.hasCurveTo ? current.curveTo : current.point;
  const curveFrom = next.hasCurveFrom ? next.curveFrom : next.point;
  const nextPoint = next.point;

  path.cubicTo(
    curveTo.x,
    curveTo.y,
    curveFrom.x,
    curveFrom.y,
    nextPoint.x,
    nextPoint.y,
  );
}

function lineTo(path: Path, next: DecodedCurvePoint) {
  const nextPoint = next.point;

  path.lineTo(nextPoint.x, nextPoint.y);
}

function curveOrLineTo(
  path: Path,
  current: DecodedCurvePoint,
  next: DecodedCurvePoint,
) {
  if (
    current.curveMode === Sketch.CurveMode.Straight &&
    next.curveMode === Sketch.CurveMode.Straight
  ) {
    lineTo(path, next);
  } else {
    curveTo(path, current, next);
  }
}

type CurveInfo = {
  radius: number;
  step: Point;
  drawSegment: boolean;
};

function stepToCurve(
  path: Path,
  current: DecodedCurvePoint,
  curveInfo: CurveInfo,
) {
  const currentPoint = current.point;

  const { radius, step } = curveInfo;

  if (radius > 0) {
    path.arcToTangent(
      currentPoint.x,
      currentPoint.y,
      currentPoint.x + step.x,
      currentPoint.y + step.y,
      radius,
    );
  } else {
    path.lineTo(currentPoint.x + step.x, currentPoint.y + step.y);
  }
}

export function path(
  CanvasKit: CanvasKit,
  points: Sketch.CurvePoint[],
  frame: Rect,
  isClosed: boolean,
): Path {
  const path = new CanvasKit.Path();

  if (points.length < 2) return path;

  const curvePoints = points.map((point) => decodeCurvePoint(point, frame));

  // Curves with only 2 points don't support corner radius, so we handle this
  // case specially
  if (curvePoints.length === 2) {
    const [current, next] = curvePoints;

    path.moveTo(current.point.x, current.point.y);

    curveOrLineTo(path, current, next);

    if (isClosed) {
      curveOrLineTo(path, next, current);

      path.close();
    }

    return path;
  }

  // Create an array of point tuples, [prev, current, next]
  const pairs = rotate(windowsOf(curvePoints, 3, true), -1);

  const curveInfoList: CurveInfo[] = pairs.map((pair) => {
    const [prev, current, next] = pair;

    const currentPoint = current.point;
    const nextPoint = next.point;
    const prevPoint = prev.point;

    const radius = getCornerRadius(
      prevPoint,
      currentPoint,
      nextPoint,
      current.cornerRadius,
    );

    const { step, drawSegment } = getStep(currentPoint, nextPoint, radius);

    return { radius, step, drawSegment };
  });

  zip(pairs, curveInfoList).forEach(([pair, curveInfo], index) => {
    const [, current, next] = pair;
    const isLast = index === pairs.length - 1;

    const currentPoint = current.point;
    const nextPoint = next.point;

    if (index === 0) {
      const { step } = curveInfo;

      path.moveTo(currentPoint.x + step.x, currentPoint.y + step.y);

      if (next.curveMode !== Sketch.CurveMode.Straight) {
        curveTo(path, current, next);
      }
    } else {
      if (
        // TODO: Handle one straight point with radius and one curve
        current.curveMode === Sketch.CurveMode.Straight &&
        next.curveMode === Sketch.CurveMode.Straight
      ) {
        stepToCurve(path, current, curveInfo);

        const { step, drawSegment } = curveInfo;

        if (drawSegment && (isClosed || !isLast)) {
          path.lineTo(nextPoint.x - step.x, nextPoint.y - step.y);
        }
      } else if (isClosed || !isLast) {
        curveTo(path, current, next);
      }
    }

    if (isClosed && isLast) {
      const [, current, next] = pairs[0];

      // If we have a corner radius, draw the final curve
      if (
        current.curveMode === Sketch.CurveMode.Straight &&
        next.curveMode === Sketch.CurveMode.Straight
      ) {
        stepToCurve(path, current, curveInfoList[0]);
      }

      // We need the path to be closed for line caps to draw correctly
      path.close();
    }
  });

  return path;
}

const getBorderPositionPathOp = (
  CanvasKit: CanvasKit,
  position: Sketch.BorderPosition,
): PathOp | undefined => {
  switch (position) {
    case Sketch.BorderPosition.Center:
      return;
    case Sketch.BorderPosition.Outside:
      return CanvasKit.PathOp.Difference;
    case Sketch.BorderPosition.Inside:
      return CanvasKit.PathOp.Intersect;
  }
};

export function getStrokedPath(
  CanvasKit: CanvasKit,
  path: Path,
  width: number,
  pathOp?: PathOp,
) {
  const copy = path.copy();

  // A 0-width path will never change the original when unioned
  if (width === 0 && pathOp === CanvasKit.PathOp.Union) return copy;

  if (
    !copy.stroke({
      width,
    })
  ) {
    console.info('[getStrokedPath] Failed to stroke path');
    return copy;
  }

  if (pathOp !== undefined) {
    if (!copy.op(path, pathOp)) {
      console.info('[getStrokedPath] Failed to combine paths');
    }
  }

  return copy;
}

export function getStrokedBorderPath(
  CanvasKit: CanvasKit,
  path: Path,
  borderWidth: number,
  borderPosition: Sketch.BorderPosition,
) {
  switch (borderPosition) {
    case Sketch.BorderPosition.Center:
      break;
    case Sketch.BorderPosition.Outside:
    case Sketch.BorderPosition.Inside:
      borderWidth *= 2;
  }

  const pathOp = getBorderPositionPathOp(CanvasKit, borderPosition);

  return getStrokedPath(CanvasKit, path, borderWidth, pathOp);
}
