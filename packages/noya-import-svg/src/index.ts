import Sketch from '@sketch-hq/sketch-file-format-ts';
import * as SVGModel from '@lona/svg-model';
import { Point, Rect, Size } from 'noya-geometry';
import { SketchModel } from 'noya-sketch-model';
import parseColor from 'color-parse';

function makeRect(x: number, y: number, width: number, height: number): Rect {
  return { x, y, width, height };
}

export function makeBoundingRectFromPoints(points: Point[]): Rect {
  const x = Math.min(...points.map((point) => point.x));
  const y = Math.min(...points.map((point) => point.y));
  const width = Math.max(...points.map((point) => point.x)) - x;
  const height = Math.max(...points.map((point) => point.y)) - y;

  return makeRect(x, y, width, height);
}

export function makeBoundingRectFromCommands(
  commands: SVGModel.CommandWithoutQuadratics[],
): Rect {
  const points: Point[] = commands.reduce(
    (acc: Point[], command: SVGModel.CommandWithoutQuadratics) => {
      switch (command.type) {
        case 'line':
        case 'move': {
          const { to } = command;
          return [...acc, to];
        }
        case 'cubicCurve': {
          const { to, controlPoint1, controlPoint2 } = command;
          return [...acc, to, controlPoint1, controlPoint2];
        }
        case 'close':
          return acc;
        default:
          console.error(`Invalid SVG path command: ${JSON.stringify(command)}`);
          return acc;
      }
    },
    [],
  );

  return makeBoundingRectFromPoints(points);
}

export function unionRects(...rects: Rect[]): Rect {
  function union(a: Rect, b: Rect) {
    const minX = Math.min(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const maxX = Math.max(a.x + a.width, b.x + b.width);
    const maxY = Math.max(a.y + a.height, b.y + b.height);

    return makeRect(minX, minY, maxX - minX, maxY - minY);
  }

  if (rects.length === 0) {
    throw new Error('No rects to union');
  }

  return rects.reduce((acc, rect) => union(acc, rect), rects[0]);
}

export function scaleRect(rect: Rect, scale: number) {
  return makeRect(
    rect.x * scale,
    rect.y * scale,
    rect.width * scale,
    rect.height * scale,
  );
}

// Port of Lona's resizing algorithm
// https://github.com/airbnb/Lona/blob/94fd0b26de3e3f4b4496cdaa4ab31c6d258dc4ac/examples/generated/test/swift/CGSize%2BResizing.swift
export function resize(
  source: Size,
  destination: Size,
  resizingMode: 'cover' | 'contain' | 'stretch',
) {
  const newSize = { ...destination };

  const sourceAspectRatio = source.height / source.width;
  const destinationAspectRatio = destination.height / destination.width;

  const sourceIsWiderThanDestination =
    sourceAspectRatio < destinationAspectRatio;

  switch (resizingMode) {
    case 'contain':
      if (sourceIsWiderThanDestination) {
        newSize.height = destination.width * sourceAspectRatio;
      } else {
        newSize.width = destination.height / sourceAspectRatio;
      }
      break;
    case 'cover':
      if (sourceIsWiderThanDestination) {
        newSize.width = destination.height / sourceAspectRatio;
      } else {
        newSize.height = destination.width * sourceAspectRatio;
      }
      break;
    case 'stretch':
      break;
    default:
      throw new Error('Invalid resizing mode');
  }

  return makeRect(
    (destination.width - newSize.width) / 2.0,
    (destination.height - newSize.height) / 2.0,
    newSize.width,
    newSize.height,
  );
}

export function normalizePointInRect(point: Point, rect: Rect): Point {
  const x = (point.x - rect.x) / rect.width;
  const y = (point.y - rect.y) / rect.height;
  return { x, y };
}

export function describePoint(point: Point): string {
  const { x, y } = point;
  return `{${x}, ${y}}`;
}

export function makeCurvePoint(
  point: Point,
  curveFrom?: Point,
  curveTo?: Point,
  curveMode?: Sketch.CurveMode,
): Sketch.CurvePoint {
  return {
    _class: 'curvePoint',
    cornerRadius: 0,
    curveFrom: describePoint(curveFrom || point),
    curveMode: curveMode || Sketch.CurveMode.None,
    curveTo: describePoint(curveTo || point),
    hasCurveFrom: !!curveFrom,
    hasCurveTo: !!curveTo,
    point: describePoint(point),
  };
}

type Path = Pick<Sketch.ShapePath, 'isClosed' | 'points'>;

function makePath(curvePoints: Sketch.CurvePoint[], isClosed: boolean): Path {
  return {
    isClosed,
    points: curvePoints,
  };
}

function convertCubicToCurvePoint(
  curvePoints: Sketch.CurvePoint[],
  frame: Rect,
  command: SVGModel.CubicCurve,
) {
  const { to, controlPoint1, controlPoint2 } = command;

  if (curvePoints.length > 0) {
    const last = curvePoints[curvePoints.length - 1];
    last.curveFrom = describePoint(normalizePointInRect(controlPoint1, frame));
    last.curveMode = Sketch.CurveMode.Mirrored;
    last.hasCurveFrom = true;
  }

  return makeCurvePoint(
    normalizePointInRect(to, frame),
    undefined,
    normalizePointInRect(controlPoint2, frame),
    2,
  );
}

// Points are normalized between 0 and 1, relative to the frame.
// We use the original frame here and can scale it later.
//
// This is a rough port of Lona's PDF to Sketch path conversion
// https://github.com/airbnb/Lona/blob/94fd0b26de3e3f4b4496cdaa4ab31c6d258dc4ac/studio/LonaStudio/Utils/Sketch.swift#L285
export function makePathsFromCommands(
  commands: SVGModel.Command[],
  frame: Rect,
): Path[] {
  const paths: Path[] = [];
  let curvePoints: Sketch.CurvePoint[] = [];

  function finishPath(isClosed: boolean) {
    if (curvePoints.length === 0) return;

    const path = makePath(curvePoints, isClosed);
    paths.push(path);

    curvePoints = [];
  }

  commands.forEach((command) => {
    switch (command.type) {
      case 'move': {
        finishPath(false);

        const { to } = command;
        const curvePoint = makeCurvePoint(
          normalizePointInRect(to, frame),
          undefined,
          undefined,
          Sketch.CurveMode.Straight,
        );
        curvePoints.push(curvePoint);
        break;
      }
      case 'line': {
        const { to } = command;
        const curvePoint = makeCurvePoint(
          normalizePointInRect(to, frame),
          undefined,
          undefined,
          Sketch.CurveMode.Straight,
        );
        curvePoints.push(curvePoint);
        break;
      }
      case 'cubicCurve': {
        const curvePoint = convertCubicToCurvePoint(
          curvePoints,
          frame,
          command,
        );

        curvePoints.push(curvePoint);
        break;
      }
      case 'close': {
        // If first and last points are equal, combine them
        if (curvePoints.length > 0) {
          const first = curvePoints[0];
          const last = curvePoints[curvePoints.length - 1];

          if (first.point === last.point && last.hasCurveTo) {
            first.curveTo = last.curveTo;
            first.hasCurveTo = last.hasCurveTo;
            first.curveMode = Sketch.CurveMode.Mirrored;

            curvePoints.pop();
          }
        }

        finishPath(true);
        break;
      }
      default:
        throw new Error(`Invalid SVG path command: ${JSON.stringify(command)}`);
    }
  });

  finishPath(false);

  return paths;
}

export function makeLineCapStyle(
  strokeLineCap: 'butt' | 'round' | 'square',
): Sketch.LineCapStyle {
  switch (strokeLineCap) {
    case 'butt':
      return Sketch.LineCapStyle.Butt;
    case 'round':
      return Sketch.LineCapStyle.Round;
    case 'square':
      return Sketch.LineCapStyle.Projecting;
    default:
      throw new Error(`Invalid SVG stroke line cap: ${strokeLineCap}`);
  }
}

function makeColor(cssString: string) {
  const {
    values: [red, green, blue],
    alpha,
  } = parseColor(cssString);

  return SketchModel.color({ red, green, blue, alpha });
}

function makeLayerFromPathElement(
  pathElement: SVGModel.PathWithoutQuadratics,
  _parentFrame: Rect,
  scale: number,
) {
  const { commands, style } = pathElement;

  // Paths are created using the original frame
  const pathFrame = makeBoundingRectFromCommands(commands);
  const paths = makePathsFromCommands(commands, pathFrame);

  // Scale the frame to fill the viewBox
  const shapeGroupFrame = scaleRect(pathFrame, scale);

  // Each shape path has an origin of {0, 0}, since the shapeGroup layer stores the real origin,
  // and we don't want to apply the origin translation twice.
  const shapePathFrame = makeRect(
    0,
    0,
    shapeGroupFrame.width,
    shapeGroupFrame.height,
  );

  const shapePaths = paths.map((path) =>
    SketchModel.shapePath({
      frame: SketchModel.rect(shapePathFrame),
      points: path.points,
      isClosed: path.isClosed,
    }),
  );

  const shapeGroup = SketchModel.shapeGroup({
    frame: SketchModel.rect(shapeGroupFrame),
    layers: shapePaths,
    style: SketchModel.style({
      fills: style.fill
        ? [
            SketchModel.fill({
              color: makeColor(style.fill),
            }),
          ]
        : [],
    }),
  });

  if (style.stroke && shapeGroup.style) {
    const border = SketchModel.border({
      thickness: style.strokeWidth * scale,
      color: makeColor(style.stroke),
      position: Sketch.BorderPosition.Center,
    });

    shapeGroup.style = {
      ...shapeGroup.style,
      borders: [border],
      borderOptions: {
        ...shapeGroup.style.borderOptions,
        lineCapStyle: makeLineCapStyle(style.strokeLineCap),
      },
    };
  }

  return shapeGroup;
}

export function makeSvgLayer(layout: Rect, name: string, svg: string) {
  const { viewBox = layout, children } = SVGModel.convertSync(svg, {
    convertQuadraticsToCubics: true,
  });

  // Determine the rect to generate layers within
  const croppedRect = resize(viewBox, layout, 'contain');
  const scale = croppedRect.width / viewBox.width;

  // The top-level frame is the union of every path within
  const frame = unionRects(
    ...children.map((pathElement) =>
      makeBoundingRectFromCommands(pathElement.commands),
    ),
  );

  // Scale the frame to fill the viewBox
  const scaledFrame = scaleRect(frame, scale);

  const layers = children.map((element) =>
    makeLayerFromPathElement(element, scaledFrame, scale),
  );

  return SketchModel.group({
    frame: SketchModel.rect(croppedRect),
    name,
    layers,
  });
}

export function svgToLayer(svgString: string) {
  return makeSvgLayer(
    {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    },
    'svg',
    svgString,
  );
}
