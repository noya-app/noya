import Sketch from '@sketch-hq/sketch-file-format-ts';
import type { CanvasKit, Paint, Path, TextAlign, TextStyle } from 'canvaskit';
import { AffineTransform, createBounds, distance, resize } from 'noya-geometry';
import {
  CompassDirection,
  getCardinalDirections,
  Point,
  Rect,
} from 'noya-state';
import * as PathUtils from './primitives/path';

export * from './primitives/path';

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
  layerFrame: Rect,
  image?: ArrayBuffer,
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

      [...fill.gradient.stops]
        .sort((a, b) => a.position - b.position)
        .forEach((stop) => {
          colors.push(color(CanvasKit, stop.color));
          positions.push(stop.position);
        });

      const fromPoint = parsePoint(fill.gradient.from);
      const toPoint = parsePoint(fill.gradient.to);

      // CanvasKit draws gradients in absolute coordinates, while Sketch draws them
      // relative to the layer's frame. This function returns a matrix that converts
      // absolute coordinates into the range (0, 1).
      const unitTransform = AffineTransform.multiply(
        AffineTransform.translation(layerFrame.x, layerFrame.y),
        AffineTransform.scale(layerFrame.width, layerFrame.height),
      );

      switch (fill.gradient.gradientType) {
        case Sketch.GradientType.Linear: {
          paint.setShader(
            CanvasKit.Shader.MakeLinearGradient(
              point(fromPoint),
              point(toPoint),
              colors,
              positions,
              CanvasKit.TileMode.Clamp,
              unitTransform.float32Array,
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
              unitTransform.float32Array,
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
              ? AffineTransform.multiply(
                  unitTransform,
                  AffineTransform.rotation(rotationRadians, 0.5, 0.5),
                )
              : unitTransform;

          paint.setShader(
            CanvasKit.Shader.MakeSweepGradient(
              0.5,
              0.5,
              colors,
              positions,
              CanvasKit.TileMode.Clamp,
              matrix.float32Array,
            ),
          );

          break;
        }
      }

      paint.setAlphaf(fill.contextSettings.opacity);
      break;
    }
    case Sketch.FillType.Pattern:
      {
        if (!image) {
          paint.setColor(clearColor(CanvasKit));
          break;
        }

        const canvasImage = CanvasKit.MakeImageFromEncoded(image);

        if (!canvasImage) {
          paint.setColor(clearColor(CanvasKit));
          break;
        }

        switch (fill.patternFillType) {
          case Sketch.PatternFillType.Tile: {
            paint.setShader(
              canvasImage.makeShaderCubic(
                CanvasKit.TileMode.Repeat,
                CanvasKit.TileMode.Repeat,
                0,
                0,
                CanvasKit.Matrix.multiply(
                  CanvasKit.Matrix.translated(layerFrame.x, layerFrame.y),
                  CanvasKit.Matrix.scaled(
                    fill.patternTileScale,
                    fill.patternTileScale,
                  ),
                ),
              ),
            );
            break;
          }
          case Sketch.PatternFillType.Stretch:
          case Sketch.PatternFillType.Fit:
          case Sketch.PatternFillType.Fill: {
            const bounds = createBounds(layerFrame);
            const scaledRect = resize(
              {
                ...layerFrame,
                width: canvasImage.width(),
                height: canvasImage.height(),
              },
              layerFrame,
              fill.patternFillType === Sketch.PatternFillType.Stretch
                ? 'scaleToFill'
                : fill.patternFillType === Sketch.PatternFillType.Fit
                ? 'scaleAspectFit'
                : 'scaleAspectFill',
            );

            paint.setShader(
              canvasImage.makeShaderCubic(
                CanvasKit.TileMode.Decal,
                CanvasKit.TileMode.Decal,
                0,
                0,
                CanvasKit.Matrix.multiply(
                  CanvasKit.Matrix.translated(
                    bounds.midX - scaledRect.width / 2,
                    bounds.midY - scaledRect.height / 2,
                  ),
                  CanvasKit.Matrix.scaled(
                    scaledRect.width / canvasImage.width(),
                    scaledRect.height / canvasImage.height(),
                  ),
                ),
              ),
            );
            break;
          }
        }
      }

      paint.setAlphaf(fill.contextSettings.opacity);
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
  isClosed: boolean,
): Path {
  return PathUtils.path(CanvasKit, points, frame, isClosed);
}

export function textHorizontalAlignment(
  CanvasKit: CanvasKit,
  alignment: Sketch.TextHorizontalAlignment,
): TextAlign {
  switch (alignment) {
    case Sketch.TextHorizontalAlignment.Left:
      return CanvasKit.TextAlign.Left;
    case Sketch.TextHorizontalAlignment.Centered:
      return CanvasKit.TextAlign.Center;
    case Sketch.TextHorizontalAlignment.Right:
      return CanvasKit.TextAlign.Right;
    case Sketch.TextHorizontalAlignment.Justified:
      return CanvasKit.TextAlign.Justify;
    case Sketch.TextHorizontalAlignment.Natural: // What is this?
      return CanvasKit.TextAlign.Start;
  }
}

export type SimpleTextDecoration = 'none' | 'underline' | 'strikethrough';

export function stringAttribute(
  CanvasKit: CanvasKit,
  attribute: Sketch.StringAttribute,
  decoration: SimpleTextDecoration,
): TextStyle {
  const textColor = attribute.attributes.MSAttributedStringColorAttribute;
  const font = attribute.attributes.MSAttributedStringFontAttribute;

  return new CanvasKit.TextStyle({
    ...(textColor && { color: color(CanvasKit, textColor) }),
    // fontFamilies: ['Roboto'], // TODO: Font family
    fontSize: font.attributes.size,
    letterSpacing: attribute.attributes.kerning,
    ...(decoration === 'none'
      ? {}
      : {
          decoration:
            decoration === 'underline'
              ? CanvasKit.UnderlineDecoration
              : CanvasKit.LineThroughDecoration,
          // There's currently a typo in the TypeScript types, "decration"
          ['decorationStyle' as any]: CanvasKit.DecorationStyle.Solid,
        }),
  });
}
