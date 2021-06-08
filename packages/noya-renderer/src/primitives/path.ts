import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit, Path, PathOp } from 'canvaskit';
import { distance, Rect } from 'noya-geometry';
import { Point } from 'noya-state';
import { windowsOf } from 'noya-utils';
import { parsePoint, stringifyPoint } from '../primitives';

/**
 * The radius of an edge should be less than half the length of that edge
 */
function getEdgeRadius(a: Point, b: Point, fixedRadius: number): number {
  const dist = distance(a, b);

  return dist <= fixedRadius * 2 ? dist / 2 : fixedRadius;
}

/**
 * The radius of a corner should be symmetric on both sides
 */
function getCornerRadius(
  before: Point,
  corner: Point,
  after: Point,
  fixedRadius: number,
): number {
  const beforeRadius = getEdgeRadius(corner, before, fixedRadius);
  const afterRadius = getEdgeRadius(corner, after, fixedRadius);
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

export type ParsedCurvePoint = Omit<
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

export function parseCurvePoint(
  curvePoint: Sketch.CurvePoint,
  frame: Rect,
): ParsedCurvePoint {
  return {
    ...curvePoint,
    curveFrom: scalePoint(parsePoint(curvePoint.curveTo), frame),
    curveTo: scalePoint(parsePoint(curvePoint.curveFrom), frame),
    point: scalePoint(parsePoint(curvePoint.point), frame),
  };
}

export function unparseCurvePoint(
  curvePoint: ParsedCurvePoint,
  frame: Rect,
): Sketch.CurvePoint {
  return {
    ...curvePoint,
    curveFrom: stringifyPoint(unscalePoint(curvePoint.curveTo, frame)),
    curveTo: stringifyPoint(unscalePoint(curvePoint.curveFrom, frame)),
    point: stringifyPoint(unscalePoint(curvePoint.point, frame)),
  };
}

export function path(
  CanvasKit: CanvasKit,
  points: Sketch.CurvePoint[],
  frame: Rect,
): Path {
  const curvePoints = points.map((point) => parseCurvePoint(point, frame));

  const pairs = windowsOf(curvePoints, 3, true);

  const path = new CanvasKit.Path();

  // Move to the starting point
  if (pairs[pairs.length - 1]) {
    const [prev, current, next] = pairs[pairs.length - 1];
    const currentPoint = current.point;
    const nextPoint = next.point;
    const prevPoint = prev.point;

    if (next.curveMode === Sketch.CurveMode.Straight) {
      const radius = getCornerRadius(
        prevPoint,
        currentPoint,
        nextPoint,
        current.cornerRadius,
      );

      const { step } = getStep(currentPoint, nextPoint, radius);

      path.moveTo(currentPoint.x + step.x, currentPoint.y + step.y);
    } else {
      path.moveTo(nextPoint.x, nextPoint.y);
    }
  }

  pairs.forEach((pair) => {
    const [prev, current, next] = pair;

    const currentPoint = current.point;
    const currentCurveTo = current.curveTo;
    const nextCurveFrom = next.curveFrom;
    const nextPoint = next.point;
    const prevPoint = prev.point;

    if (next.curveMode === Sketch.CurveMode.Straight) {
      const radius = getCornerRadius(
        prevPoint,
        currentPoint,
        nextPoint,
        current.cornerRadius,
      );

      const { step, drawSegment } = getStep(currentPoint, nextPoint, radius);

      if (current.cornerRadius > 0) {
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

      if (drawSegment) {
        path.lineTo(nextPoint.x - step.x, nextPoint.y - step.y);
      }
    } else {
      path.cubicTo(
        currentCurveTo.x,
        currentCurveTo.y,
        nextCurveFrom.x,
        nextCurveFrom.y,
        nextPoint.x,
        nextPoint.y,
      );
    }
  });

  path.close();

  // console.log(path.toCmds());

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
