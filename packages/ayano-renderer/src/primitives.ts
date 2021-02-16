import Sketch from '@sketch-hq/sketch-file-format-ts';
import type { Point, Rect } from 'ayano-state';
import type { CanvasKit, Paint, Path, TextStyle } from 'canvaskit-wasm';

export function distance(
  { x: x1, y: y1 }: Point,
  { x: x2, y: y2 }: Point,
): number {
  const a = x1 - x2;
  const b = y1 - y2;

  return Math.sqrt(a * a + b * b);
}

export function rectContainsPoint(rect: Rect, point: Point): boolean {
  return (
    rect.x <= point.x &&
    point.x <= rect.x + rect.width &&
    rect.y <= point.y &&
    point.y <= rect.y + rect.height
  );
}

export function point(point: Point): number[] {
  return [point.x, point.y];
}

export function color(CanvasKit: CanvasKit, color: Sketch.Color) {
  return CanvasKit.Color4f(color.red, color.green, color.blue, color.alpha);
}

export function rect<T extends Rect>(CanvasKit: CanvasKit, rect: T) {
  return CanvasKit.XYWHRect(rect.x, rect.y, rect.width, rect.height);
}

export function clearColor(CanvasKit: CanvasKit) {
  return CanvasKit.Color4f(0, 0, 0, 0);
}

export function fill(
  CanvasKit: CanvasKit,
  fill: Sketch.Fill,
  localMatrix: Float32Array | number[],
): Paint {
  const paint = new CanvasKit.Paint();

  switch (fill.fillType) {
    case Sketch.FillType.Color:
      paint.setColor(
        fill.color ? color(CanvasKit, fill.color) : clearColor(CanvasKit),
      );
      break;
    case Sketch.FillType.Gradient: {
      let colors: Float32Array[] = [];
      let positions: number[] = [];

      fill.gradient.stops.forEach((stop) => {
        colors.push(color(CanvasKit, stop.color));
        positions.push(stop.position);
      });

      const fromPoint = parsePoint(fill.gradient.from);
      const toPoint = parsePoint(fill.gradient.to);

      switch (fill.gradient.gradientType) {
        case Sketch.GradientType.Linear: {
          paint.setShader(
            CanvasKit.Shader.MakeLinearGradient(
              point(fromPoint),
              point(toPoint),
              colors,
              positions,
              CanvasKit.TileMode.Clamp,
              localMatrix,
            ),
          );
          break;
        }
        case Sketch.GradientType.Radial: {
          paint.setShader(
            CanvasKit.Shader.MakeRadialGradient(
              point(fromPoint),
              distance(toPoint, fromPoint),
              colors,
              positions,
              CanvasKit.TileMode.Clamp,
              localMatrix,
            ),
          );
          break;
        }
        case Sketch.GradientType.Angular: {
          const hasStartPosition = positions[0] === 0;
          const hasEndPosition = positions[positions.length - 1] === 1;
          let rotationRadians = 0;

          // If the gradient has no start or end, we shift all the colors stops
          // to the beginning, and then rotate the gradient.
          //
          // We can't use the positions + angle parameters of MakeSweepGradient,
          // since these are clamped (and TileMode doesn't seem to affect this)
          if (!hasStartPosition && !hasEndPosition) {
            const startPosition = positions[0];
            positions = positions.map((p) => p - startPosition);
            colors.push(colors[0]);
            positions.push(1);

            rotationRadians = startPosition * 2 * Math.PI;
          } else if (hasEndPosition && !hasStartPosition) {
            colors.unshift(colors[colors.length - 1]);
            positions.unshift(0);
          } else if (hasStartPosition && !hasEndPosition) {
            colors.push(colors[0]);
            positions.push(1);
          }

          const matrix =
            rotationRadians > 0
              ? CanvasKit.Matrix.multiply(
                  localMatrix,
                  CanvasKit.Matrix.rotated(rotationRadians, 0.5, 0.5),
                )
              : localMatrix;

          paint.setShader(
            CanvasKit.Shader.MakeSweepGradient(
              0.5,
              0.5,
              colors,
              positions,
              CanvasKit.TileMode.Clamp,
              matrix,
            ),
          );

          break;
        }
      }

      break;
    }
  }

  paint.setStyle(CanvasKit.PaintStyle.Fill);
  paint.setAntiAlias(true);

  return paint;
}

export function border(CanvasKit: CanvasKit, border: Sketch.Border): Paint {
  const paint = new CanvasKit.Paint();

  paint.setColor(
    border.color ? color(CanvasKit, border.color) : clearColor(CanvasKit),
  );
  paint.setStrokeWidth(border.thickness);
  paint.setStyle(CanvasKit.PaintStyle.Stroke);
  paint.setAntiAlias(true);

  return paint;
}

export function parsePoint(pointString: string): Point {
  const [x, y] = pointString.slice(1, -1).split(',');

  return {
    x: parseFloat(x),
    y: parseFloat(y),
  };
}

export function stringifyPoint({ x, y }: Point): string {
  return `{${x.toString()},${y.toString()}}`;
}

function zip<A, B>(array1: A[], array2: B[]): [A, B][] {
  return array1.map((item1, index) => [item1, array2[index]]);
}

export function path(
  CanvasKit: CanvasKit,
  points: Sketch.CurvePoint[],
  frame: Sketch.Rect,
): Path {
  const { x, y, width, height } = frame;

  const scalePoint = (point: Point) => {
    return { x: x + point.x * width, y: y + point.y * height };
  };

  const curvePoints = [...points].map((curvePoint) => ({
    ...curvePoint,
    curveFrom: curvePoint.curveTo,
    curveTo: curvePoint.curveFrom,
  }));

  const pairs = zip(curvePoints, [
    ...curvePoints.slice(1),
    ...curvePoints.slice(0, 1),
  ]);

  const path = new CanvasKit.Path();

  if (pairs[0]) {
    const [current] = pairs[0];
    const currentPoint = scalePoint(parsePoint(current.point));
    path.moveTo(currentPoint.x, currentPoint.y);
  }

  pairs.forEach((pair) => {
    const [current, next] = pair;
    const currentCurveTo = scalePoint(parsePoint(current.curveTo));
    const nextCurveFrom = scalePoint(parsePoint(next.curveFrom));
    const nextPoint = scalePoint(parsePoint(next.point));

    path.cubicTo(
      currentCurveTo.x,
      currentCurveTo.y,
      nextCurveFrom.x,
      nextCurveFrom.y,
      nextPoint.x,
      nextPoint.y,
    );
  });

  path.close();

  return path;
}

export function stringAttribute(
  CanvasKit: CanvasKit,
  attribute: Sketch.StringAttribute,
): TextStyle {
  const textColor = attribute.attributes.MSAttributedStringColorAttribute;
  const font = attribute.attributes.MSAttributedStringFontAttribute;

  return new CanvasKit.TextStyle({
    ...(textColor && { color: color(CanvasKit, textColor) }),
    // fontFamilies: ['Roboto'], // TODO: Font family
    fontSize: font.attributes.size,
  });
}
