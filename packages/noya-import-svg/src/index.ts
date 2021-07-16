import * as SVGModel from '@lona/svg-model';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import parseColor from 'color-parse';
import {
  computeBoundsFromPoints,
  Point,
  Rect,
  resize,
  scaleRect,
  unionRects,
} from 'noya-geometry';
import { SketchModel } from 'noya-sketch-model';

export function makeBoundingRectFromCommands(
  commands: SVGModel.CommandWithoutQuadratics[],
): Rect {
  const points: Point[] = commands.flatMap((command) => {
    switch (command.type) {
      case 'line':
      case 'move': {
        const { to } = command;
        return [to];
      }
      case 'cubicCurve': {
        const { to, controlPoint1, controlPoint2 } = command;
        return [controlPoint1, controlPoint2, to];
      }
      case 'close':
        return [];
      default:
        console.error(`Invalid SVG path command: ${JSON.stringify(command)}`);
        return [];
    }
  }, []);

  return computeBoundsFromPoints(points);
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
        const { to, controlPoint1, controlPoint2 } = command;

        if (curvePoints.length > 0) {
          const last = curvePoints[curvePoints.length - 1];
          last.curveFrom = describePoint(
            normalizePointInRect(controlPoint1, frame),
          );
          last.curveMode = Sketch.CurveMode.Mirrored;
          last.hasCurveFrom = true;
        }

        const curvePoint = makeCurvePoint(
          normalizePointInRect(to, frame),
          undefined,
          normalizePointInRect(controlPoint2, frame),
          2,
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
  parentFrame: Rect, // TODO: Do we need this?
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
  const shapePathFrame = {
    x: 0,
    y: 0,
    width: shapeGroupFrame.width,
    height: shapeGroupFrame.height,
  };

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
  const { viewBox = layout, children } = SVGModel.convert(svg, {
    convertQuadraticsToCubics: true,
  });

  // Determine the rect to generate layers within
  const croppedRect = resize(viewBox, layout, 'scaleAspectFit');
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
