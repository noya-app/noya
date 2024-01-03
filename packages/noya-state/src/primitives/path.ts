import { Sketch } from '@noya-app/noya-file-format';
import { Point, Rect, distance } from '@noya-app/noya-geometry';
import { PointString, SketchModel } from '@noya-app/noya-sketch-model';
import { clamp, rotate, windowsOf, zip } from '@noya-app/noya-utils';
import { CanvasKit, Path, PathOp } from 'canvaskit';
import {
  CommandWithoutQuadratics,
  makePathsFromCommands,
} from 'noya-import-svg';
import {
  lineCapStyle,
  lineJoinStyle,
  parsePoint,
  stringifyPoint,
} from 'noya-state';
import { PathCommand, PathCommandVerb, parsePathCmds } from './pathCommand';

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
  lineCap: Sketch.LineCapStyle,
  lineJoin: Sketch.LineJoinStyle,
  pathOp?: PathOp,
): Path {
  const copy = path.copy();

  // A 0-width path will never change the original when unioned
  if (width === 0 && pathOp === CanvasKit.PathOp.Union) return copy;

  if (
    !copy.stroke({
      width,
      cap: lineCapStyle(CanvasKit, lineCap),
      join: lineJoinStyle(CanvasKit, lineJoin),
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
  lineCap: Sketch.LineCapStyle,
  lineJoin: Sketch.LineJoinStyle,
) {
  switch (borderPosition) {
    case Sketch.BorderPosition.Center:
      break;
    case Sketch.BorderPosition.Outside:
    case Sketch.BorderPosition.Inside:
      borderWidth *= 2;
  }

  const pathOp = getBorderPositionPathOp(CanvasKit, borderPosition);

  return getStrokedPath(
    CanvasKit,
    path,
    borderWidth,
    lineCap,
    lineJoin,
    pathOp,
  );
}

export function unscaleCurvePoint(curvePoint: Sketch.CurvePoint, frame: Rect) {
  const unscale = (value: string) =>
    PointString.encode(unscalePoint(PointString.decode(value), frame));

  return {
    ...curvePoint,
    curveFrom: unscale(curvePoint.curveFrom),
    curveTo: unscale(curvePoint.curveTo),
    point: unscale(curvePoint.point),
  };
}

function pathCommandToSVGCommand(
  command: PathCommand,
): CommandWithoutQuadratics {
  switch (command[0]) {
    case PathCommandVerb.move: {
      const [, x, y] = command;
      return { type: 'move', to: { x, y } };
    }
    case PathCommandVerb.cubic: {
      const [, x1, y1, x2, y2, x3, y3] = command;
      return {
        type: 'cubicCurve',
        to: { x: x3, y: y3 },
        controlPoint1: { x: x1, y: y1 },
        controlPoint2: { x: x2, y: y2 },
      };
    }
    default:
      throw new Error('Path command not handled');
  }
}

export function pathToCurvePoints(
  path: Path,
  frame: Rect,
): Sketch.CurvePoint[] {
  const svgCommands = parsePathCmds(path.toCmds()).map(pathCommandToSVGCommand);

  // Assume a single path. `isClosed` should already be handled, before calling
  // this function, so we can ignore it here.
  const curvePoints = makePathsFromCommands(svgCommands)[0].points;

  return curvePoints.map((curvePoint) => unscaleCurvePoint(curvePoint, frame));
}

export function joinCurvePoints(
  segments: Sketch.CurvePoint[][],
  wrapsAround: boolean,
): Sketch.CurvePoint[] {
  const nonEmptySegments = segments.filter((segment) => segment.length > 0);

  if (nonEmptySegments.length === 0) return [];

  const [first, ...rest] = nonEmptySegments;

  const merged = rest.reduce((start, end) => {
    const lastStartPoint = start[start.length - 1];
    const firstEndPoint = end[0];

    return [
      ...start.slice(0, -1),
      SketchModel.curvePoint({
        curveMode: Sketch.CurveMode.Mirrored,
        hasCurveFrom: true,
        hasCurveTo: true,
        point: lastStartPoint.point,
        curveFrom: firstEndPoint.curveFrom,
        curveTo: lastStartPoint.curveTo,
      }),
      ...end.slice(1),
    ];
  }, first);

  if (wrapsAround) {
    const lastIndex = merged.length - 1;
    const last = merged[lastIndex];
    merged.splice(lastIndex, 1);
    merged[0].curveTo = last.curveTo;
  }

  return merged;
}

export function splitPath(path: Path, t: number): [Path, Path] {
  t = clamp(t, 0, 1);

  return [path.copy().trim(0, t, false)!, path.copy().trim(t, 1, false)!];
}
