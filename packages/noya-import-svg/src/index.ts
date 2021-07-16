import {
  CommandWithoutQuadratics,
  convert,
  getCommandPoints,
  mapCommandPoints,
  parseCSSColor,
  PathWithoutQuadratics,
} from '@lona/svg-model';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  AffineTransform,
  computeBoundsFromPoints,
  Point,
  Rect,
  resize,
  transformRect,
  unionRects,
} from 'noya-geometry';
import { PointString, SketchModel } from 'noya-sketch-model';

function getBoundingRectFromCommands(
  commands: CommandWithoutQuadratics[],
): Rect {
  return computeBoundsFromPoints(commands.flatMap(getCommandPoints));
}

function makeCurvePoint(
  curveMode: Sketch.CurveMode,
  point: Point,
  curveFrom?: Point,
  curveTo?: Point,
): Sketch.CurvePoint {
  return {
    _class: 'curvePoint',
    cornerRadius: 0,
    curveFrom: PointString.encode(curveFrom || point),
    curveMode: curveMode || Sketch.CurveMode.None,
    curveTo: PointString.encode(curveTo || point),
    hasCurveFrom: !!curveFrom,
    hasCurveTo: !!curveTo,
    point: PointString.encode(point),
  };
}

type Path = Pick<Sketch.ShapePath, 'isClosed' | 'points'>;

// This is a rough port of Lona's PDF to Sketch path conversion
// https://github.com/airbnb/Lona/blob/94fd0b26de3e3f4b4496cdaa4ab31c6d258dc4ac/studio/LonaStudio/Utils/Sketch.swift#L285
function makePathsFromCommands(commands: CommandWithoutQuadratics[]): Path[] {
  const paths: Path[] = [];
  let curvePoints: Sketch.CurvePoint[] = [];

  function finishPath(isClosed: boolean) {
    if (curvePoints.length === 0) return;

    paths.push({ points: curvePoints, isClosed });

    curvePoints = [];
  }

  commands.forEach((command) => {
    switch (command.type) {
      case 'move': {
        finishPath(false);

        const { to } = command;
        const curvePoint = makeCurvePoint(Sketch.CurveMode.Straight, to);
        curvePoints.push(curvePoint);
        break;
      }
      case 'line': {
        const { to } = command;
        const curvePoint = makeCurvePoint(Sketch.CurveMode.Straight, to);
        curvePoints.push(curvePoint);
        break;
      }
      case 'cubicCurve': {
        const { to, controlPoint1, controlPoint2 } = command;

        if (curvePoints.length > 0) {
          const last = curvePoints[curvePoints.length - 1];
          last.curveFrom = PointString.encode(controlPoint1);
          last.curveMode = Sketch.CurveMode.Mirrored;
          last.hasCurveFrom = true;
        }

        const curvePoint = makeCurvePoint(
          Sketch.CurveMode.Mirrored,
          to,
          undefined,
          controlPoint2,
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

function makeLineCapStyle(
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
  const [red, green, blue, alpha] = parseCSSColor(cssString) ?? [0, 0, 0, 1];

  return SketchModel.color({
    red: red / 255,
    green: green / 255,
    blue: blue / 255,
    alpha,
  });
}

/**
 * Return the original frame, and scale all points within [0, 1]
 */
function makeLayerPaths(commands: CommandWithoutQuadratics[]) {
  // Find the original frame
  const frame = getBoundingRectFromCommands(commands);

  const transform = AffineTransform.scale(
    1 / frame.width,
    1 / frame.height,
  ).translate(-frame.x, -frame.y);

  // Scale points to within [0, 1]
  const scaledCommands = commands.map((command) =>
    mapCommandPoints(command, (point) => transform.applyTo(point)),
  );

  const paths = makePathsFromCommands(scaledCommands);

  return { frame, paths };
}

function makeLayerFromPathElement(
  pathElement: PathWithoutQuadratics,
  scale: number,
  offset: Point,
) {
  const { commands, style } = pathElement;

  const { frame, paths } = makeLayerPaths(commands);

  const shapeGroupFrame = transformRect(
    frame,
    AffineTransform.scale(scale).translate(offset.x, offset.y),
  );

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

export function svgToLayer(name: string, svgString: string) {
  const { viewBox, width, height, children } = convert(svgString, {
    convertQuadraticsToCubics: true,
  });

  // The top-level frame is the union of every path within
  const originalFrame = unionRects(
    ...children.map((pathElement) =>
      getBoundingRectFromCommands(pathElement.commands),
    ),
  );

  // Figure out which dimensions to use for scaling
  const layoutWidth = width ?? viewBox?.width ?? originalFrame.width;
  const layoutHeight = height ?? viewBox?.height ?? originalFrame.height;
  const layoutSize = { width: layoutWidth, height: layoutHeight };
  const layoutFrame = viewBox ?? originalFrame;

  // Determine the rect to generate layers within
  const croppedRect = resize(layoutFrame, layoutSize, 'scaleAspectFit');
  const scale = croppedRect.width / layoutFrame.width;

  // Scale the frame to our resized scale
  const scaledFrame = transformRect(
    originalFrame,
    AffineTransform.scale(scale),
  );

  // Undo any translation in the frame so that our new layers appear at {0,0}
  const layerOffset = { x: -scaledFrame.x, y: -scaledFrame.y };

  const layers = children.map((element) =>
    makeLayerFromPathElement(element, scale, layerOffset),
  );

  return SketchModel.group({
    frame: SketchModel.rect({
      ...scaledFrame,
      x: 0,
      y: 0,
    }),
    name,
    layers,
  });
}
