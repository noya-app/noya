import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  Bounds,
  CompassDirection,
  getCardinalDirections,
  Point,
  Rect,
} from 'noya-state';
import type { CanvasKit, Paint, Path, TextStyle } from 'canvaskit-wasm';
import * as PathUtils from './primitives/path';
import { AffineTransform } from 'noya-state/src/utils/AffineTransform';

export function transformRect(rect: Rect, transform: AffineTransform): Rect {
  const bounds = createBounds(rect);
  const p1 = transform.applyTo({
    x: bounds.minX,
    y: bounds.minY,
  });
  const p2 = transform.applyTo({
    x: bounds.maxX,
    y: bounds.maxY,
  });
  return createRect(p1, p2);
}

/**
 * Create a rectangle with a non-negative width and height
 */
export function createRect(initialPoint: Point, finalPoint: Point): Rect {
  return {
    width: Math.abs(finalPoint.x - initialPoint.x),
    height: Math.abs(finalPoint.y - initialPoint.y),
    x: Math.min(finalPoint.x, initialPoint.x),
    y: Math.min(finalPoint.y, initialPoint.y),
  };
}

export function createRectFromBounds(bounds: Bounds): Rect {
  return {
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
  };
}

export function createBounds(rect: Rect): Bounds {
  return {
    minX: Math.min(rect.x, rect.x + rect.width),
    minY: Math.min(rect.y, rect.y + rect.height),
    maxX: Math.max(rect.x, rect.x + rect.width),
    maxY: Math.max(rect.y, rect.y + rect.height),
  };
}

/**
 * Resize a rect in a compass direction
 */
export function resizeRect(
  rect: Rect,
  offset: Point,
  direction: CompassDirection,
): Rect {
  const newRect = { ...rect };

  getCardinalDirections(direction).forEach((cardinalDirection) => {
    switch (cardinalDirection) {
      case 'e':
        newRect.width += offset.x;
        break;
      case 'w':
        newRect.width -= offset.x;
        newRect.x += offset.x;
        break;
      case 's':
        newRect.height += offset.y;
        break;
      case 'n':
        newRect.height -= offset.y;
        newRect.y += offset.y;
        break;
    }
  });

  return newRect;
}

export function distance(
  { x: x1, y: y1 }: Point,
  { x: x2, y: y2 }: Point,
): number {
  const a = x2 - x1;
  const b = y2 - y1;

  return Math.sqrt(a * a + b * b);
}

export function sum({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point): Point {
  return {
    x: x1 + x2,
    y: y1 + y2,
  };
}

export function rectContainsPoint(rect: Rect, point: Point): boolean {
  return (
    rect.x <= point.x &&
    point.x <= rect.x + rect.width &&
    rect.y <= point.y &&
    point.y <= rect.y + rect.height
  );
}

// https://searchfox.org/mozilla-beta/source/toolkit/modules/Geometry.jsm
export function rectsIntersect(a: Rect, b: Rect): boolean {
  const x1 = Math.max(a.x, b.x);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y1 = Math.max(a.y, b.y);
  const y2 = Math.min(a.y + a.height, b.y + b.height);

  return x1 < x2 && y1 < y2;
}

/**
 * Ensure a rect has a non-negative width and height
 */
export function normalizeRect(rect: Rect): Rect {
  return {
    x: Math.min(rect.x + rect.width, rect.x),
    y: Math.min(rect.y + rect.height, rect.y),
    width: Math.abs(rect.width),
    height: Math.abs(rect.height),
  };
}

export function insetRect(rect: Rect, dx: number, dy: number): Rect {
  return {
    x: rect.x + dx,
    y: rect.y + dy,
    width: rect.width - dx * 2,
    height: rect.height - dy * 2,
  };
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

export function path(
  CanvasKit: CanvasKit,
  points: Sketch.CurvePoint[],
  frame: Sketch.Rect,
  fixedRadius: number,
): Path {
  return PathUtils.path(CanvasKit, points, frame, fixedRadius);
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
