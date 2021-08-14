import Sketch from '@sketch-hq/sketch-file-format-ts';
import type {
  CanvasKit,
  Paint,
  Path,
  Shader,
  TextAlign,
  TextStyle,
} from 'canvaskit';
import { FontId, SYSTEM_FONT_ID } from 'noya-fonts';
import {
  AffineTransform,
  createBounds,
  distance,
  Point,
  Rect,
  resize,
} from 'noya-geometry';
import { CompassDirection, getCardinalDirections } from 'noya-state';
import * as PathUtils from './primitives/path';

export * from './primitives/path';
export * from './primitives/pathCommand';

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

export function shader(
  CanvasKit: CanvasKit,
  fill: Sketch.Fill | Sketch.Border,
  layerFrame: Rect,
  image?: ArrayBuffer,
): Shader | undefined {
  switch (fill.fillType) {
    case Sketch.FillType.Color:
      const fillColor = fill.color
        ? color(CanvasKit, fill.color)
        : clearColor(CanvasKit);
      return CanvasKit.Shader.MakeColor(fillColor, CanvasKit.ColorSpace.SRGB);
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

      const aspectRatio = layerFrame.width / layerFrame.height;

      // CanvasKit draws gradients in absolute coordinates, while Sketch draws them
      // relative to the layer's frame. This function returns a matrix that converts
      // absolute coordinates into the range (0, 1).
      const unitTransform = AffineTransform.multiply(
        AffineTransform.translate(layerFrame.x, layerFrame.y),
        AffineTransform.scale(layerFrame.width, layerFrame.height),
      );

      switch (fill.gradient.gradientType) {
        case Sketch.GradientType.Linear: {
          const transformedFrom = unitTransform.applyTo(fromPoint);
          const transformedTo = unitTransform.applyTo(toPoint);

          return CanvasKit.Shader.MakeLinearGradient(
            point(transformedFrom),
            point(transformedTo),
            colors,
            positions,
            CanvasKit.TileMode.Clamp,
          );
        }
        case Sketch.GradientType.Radial: {
          const transformedCenter = unitTransform.applyTo(fromPoint);
          const transformedTo = unitTransform.applyTo(toPoint);

          const theta =
            Math.atan2(
              transformedTo.y - transformedCenter.y,
              transformedTo.x - transformedCenter.x,
            ) -
            Math.PI / 2;

          // We scale the coordinate system along the x axis to render an ellipse
          const coordinateSystemTransform = AffineTransform.rotate(
            theta,
            transformedCenter.x,
            transformedCenter.y,
          ).scale(fill.gradient.elipseLength || 1, 1, transformedCenter);

          return CanvasKit.Shader.MakeRadialGradient(
            point(transformedCenter),
            distance(transformedTo, transformedCenter),
            colors,
            positions,
            CanvasKit.TileMode.Clamp,
            coordinateSystemTransform.float32Array,
          );
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

          let matrix = AffineTransform.multiply(
            unitTransform,
            rotationRadians > 0
              ? AffineTransform.rotate(rotationRadians, 0.5, 0.5)
              : AffineTransform.identity,
            AffineTransform.scale(1 / aspectRatio, 1, { x: 0.5, y: 0.5 }),
          );

          return CanvasKit.Shader.MakeSweepGradient(
            0.5,
            0.5,
            colors,
            positions,
            CanvasKit.TileMode.Clamp,
            matrix.float32Array,
          );
        }
        default:
          return;
      }
    }
    case Sketch.FillType.Pattern: {
      if (!image || fill._class === 'border') return;

      const canvasImage = CanvasKit.MakeImageFromEncoded(image);

      if (!canvasImage) return;

      switch (fill.patternFillType) {
        case Sketch.PatternFillType.Tile: {
          return canvasImage.makeShaderCubic(
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
          );
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

          return canvasImage.makeShaderCubic(
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
          );
        }
      }
    }
  }
}

export function fill(
  CanvasKit: CanvasKit,
  fill: Sketch.Fill | Sketch.Border,
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
    case Sketch.FillType.Gradient:
    case Sketch.FillType.Pattern: {
      const fillShader = shader(CanvasKit, fill, layerFrame, image);

      if (!fillShader) {
        paint.setColor(clearColor(CanvasKit));
        break;
      }

      paint.setShader(fillShader);
      paint.setAlphaf(fill.contextSettings.opacity);
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
  frame: Rect,
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

export function createCanvasKitTextStyle(
  CanvasKit: CanvasKit,
  fontId: FontId,
  attributes: Sketch.StringAttribute['attributes'],
  decoration: SimpleTextDecoration,
): TextStyle {
  const textColor = attributes.MSAttributedStringColorAttribute;
  const font = attributes.MSAttributedStringFontAttribute;

  return new CanvasKit.TextStyle({
    ...(textColor && { color: color(CanvasKit, textColor) }),
    fontFamilies: fontId
      ? [fontId.toString(), SYSTEM_FONT_ID]
      : [SYSTEM_FONT_ID],
    fontSize: font.attributes.size,
    letterSpacing: attributes.kerning,
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
