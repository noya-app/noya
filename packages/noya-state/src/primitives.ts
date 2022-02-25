import type {
  CanvasKit,
  Paint,
  Path,
  RuntimeEffect,
  Shader,
  StrokeCap,
  StrokeJoin,
  TextAlign,
  TextStyle,
} from 'canvaskit-types';
import Sketch from 'noya-file-format';
import { FontId, SYSTEM_FONT_ID } from 'noya-fonts';
import {
  AffineTransform,
  createBounds,
  distance,
  Point,
  Rect,
  resize,
  transformRect,
} from 'noya-geometry';
import { CompassDirection } from 'noya-state';
import * as PathUtils from './primitives/path';
import {
  compassDirectionMap,
  getOppositeDirection,
  getRectExtentPoint,
} from './selection';

export * from './primitives/path';
export * from './primitives/pathCommand';

export function sign(number: number) {
  return number > 0 ? 1 : number < 0 ? -1 : 0;
}

export type ScalingOriginMode = 'extent' | 'center';

export type ScalingOptions = {
  constrainProportions: boolean;
  scalingOriginMode: ScalingOriginMode;
};

/**
 * Resize a rect in a compass direction
 */
export function resizeRect(
  rect: Rect,
  offset: Point,
  direction: CompassDirection,
  { scalingOriginMode, constrainProportions }: ScalingOptions,
): Rect {
  const oppositeDirection = getOppositeDirection(direction);

  const extent = getRectExtentPoint(rect, direction);
  const oppositeExtent = getRectExtentPoint(rect, oppositeDirection);

  if (scalingOriginMode === 'center') {
    offset = {
      x: offset.x * 2,
      y: offset.y * 2,
    };
  }

  const newExtent = { x: extent.x + offset.x, y: extent.y + offset.y };

  const multiplier = {
    x: compassDirectionMap[direction].x * 2 - 1,
    y: compassDirectionMap[direction].y * 2 - 1,
  };

  const newSize = {
    width: newExtent.x - oppositeExtent.x,
    height: newExtent.y - oppositeExtent.y,
  };

  const scaleX = (multiplier.x * newSize.width) / rect.width;
  const scaleY = (multiplier.y * newSize.height) / rect.height;

  const largestMagnitude =
    Math.abs(scaleX) > Math.abs(scaleY) ? scaleX : scaleY;

  const scale = constrainProportions
    ? { x: largestMagnitude, y: largestMagnitude }
    : {
        x: extent.x === oppositeExtent.x ? 1 : scaleX,
        y: extent.y === oppositeExtent.y ? 1 : scaleY,
      };

  // Adjust the sign of the scale:
  // - If scaling along a single axis, ensure a positive sign so we don't flip along the opposite axis
  // - If scaling opposite corners, ensure the rect remains in the correct quadrant
  if (extent.y === oppositeExtent.y) {
    scale.y = Math.abs(scale.y);
  } else if (sign(scale.y) !== sign(scaleY)) {
    scale.y *= -1;
  }

  if (extent.x === oppositeExtent.x) {
    scale.x = Math.abs(scale.x);
  } else if (sign(scale.x) !== sign(scaleX)) {
    scale.x *= -1;
  }

  switch (scalingOriginMode) {
    case 'extent':
      return transformRect(
        rect,
        AffineTransform.scale(scale.x, scale.y, oppositeExtent),
        false,
      );
    case 'center':
      const bounds = createBounds(rect);

      return transformRect(
        rect,
        AffineTransform.scale(scale.x, scale.y, {
          x: bounds.midX,
          y: bounds.midY,
        }),
        false,
      );
  }
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
  runtimeEffect?: RuntimeEffect,
  uniforms?: number[],
): Shader | undefined {
  switch (fill.fillType) {
    case Sketch.FillType.Shader:
      const fillScale =
        fill._class === 'fill'
          ? fill.patternFillType
          : Sketch.PatternFillType.Fill;

      const aspectRatio = layerFrame.width / layerFrame.height;
      const unitTransform = AffineTransform.multiply(
        AffineTransform.translate(layerFrame.x, layerFrame.y),
        AffineTransform.scale(layerFrame.width, layerFrame.height),
        fillScale === Sketch.PatternFillType.Stretch
          ? AffineTransform.identity
          : AffineTransform.scale(1 / aspectRatio, 1, { x: 0.5, y: 0.5 }),
      );

      const shader = runtimeEffect?.makeShader(
        uniforms ?? [],
        false,
        unitTransform.float32Array,
      );

      return shader;
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
            transformedCenter,
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
              ? AffineTransform.rotate(rotationRadians, { x: 0.5, y: 0.5 })
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
            1 / 3,
            1 / 3,
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
            1 / 3,
            1 / 3,
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
  runtimeEffect?: RuntimeEffect,
  uniforms?: number[],
): Paint {
  const paint = new CanvasKit.Paint();

  switch (fill.fillType) {
    case Sketch.FillType.Color:
      paint.setColor(
        fill.color ? color(CanvasKit, fill.color) : clearColor(CanvasKit),
      );
      break;
    case Sketch.FillType.Gradient:
    case Sketch.FillType.Pattern:
    case Sketch.FillType.Shader: {
      const fillShader = shader(
        CanvasKit,
        fill,
        layerFrame,
        image,
        runtimeEffect,
        uniforms,
      );

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

export function lineJoinStyle(
  CanvasKit: CanvasKit,
  lineJoin: Sketch.LineJoinStyle,
): StrokeJoin {
  switch (lineJoin) {
    case Sketch.LineJoinStyle.Bevel:
      return CanvasKit.StrokeJoin.Bevel;
    case Sketch.LineJoinStyle.Round:
      return CanvasKit.StrokeJoin.Round;
    case Sketch.LineJoinStyle.Miter:
      return CanvasKit.StrokeJoin.Miter;
  }
}

export function lineCapStyle(
  CanvasKit: CanvasKit,
  lineCap: Sketch.LineCapStyle,
): StrokeCap {
  switch (lineCap) {
    case Sketch.LineCapStyle.Butt:
      return CanvasKit.StrokeCap.Butt;
    case Sketch.LineCapStyle.Projecting:
      return CanvasKit.StrokeCap.Square;
    case Sketch.LineCapStyle.Round:
      return CanvasKit.StrokeCap.Round;
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

export function pathOp(
  CanvasKit: CanvasKit,
  booleanOperation: Sketch.BooleanOperation,
) {
  switch (booleanOperation) {
    case Sketch.BooleanOperation.None:
      return undefined;
    case Sketch.BooleanOperation.Union:
      return CanvasKit.PathOp.Union;
    case Sketch.BooleanOperation.Subtract:
      return CanvasKit.PathOp.Difference;
    case Sketch.BooleanOperation.Intersection:
      return CanvasKit.PathOp.Intersect;
    case Sketch.BooleanOperation.Difference:
      return undefined;
  }
}

export function pathFillType(
  CanvasKit: CanvasKit,
  windingRule: Sketch.WindingRule,
) {
  switch (windingRule) {
    case Sketch.WindingRule.EvenOdd:
      return CanvasKit.FillType.EvenOdd;
    case Sketch.WindingRule.NonZero:
      return CanvasKit.FillType.Winding;
  }
}
