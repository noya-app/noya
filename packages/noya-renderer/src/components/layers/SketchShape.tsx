import Sketch from '@sketch-hq/sketch-file-format-ts';
import * as CanvasKit from 'canvaskit-wasm';
import { AffineTransform } from 'noya-geometry';
import {
  ClipProps,
  Group,
  Path,
  useDeletable,
  useFill,
  usePaint,
  useReactCanvasKit,
} from 'noya-react-canvaskit';
import { PaintParameters } from 'noya-react-canvaskit/src/hooks/usePaint';
import { Primitives } from 'noya-renderer';
import { Layers } from 'noya-state';
import { memo, useMemo } from 'react';
import { getStrokedPath } from '../../primitives/path';

/**
 * CanvasKit draws gradients in absolute coordinates, while Sketch draws them
 * relative to the layer's frame. This function returns a matrix that converts
 * absolute coordinates into the range (0, 1).
 */
export function getGradientTransformationMatrix(
  CanvasKit: CanvasKit.CanvasKit,
  rect: Sketch.Rect,
): number[] {
  return CanvasKit.Matrix.multiply(
    CanvasKit.Matrix.translated(rect.x, rect.y),
    CanvasKit.Matrix.scaled(rect.width, rect.height),
  );
}

const SketchFill = memo(function SketchFill({
  path,
  fill,
  transform,
}: {
  path: CanvasKit.Path;
  fill: Sketch.Fill;
  transform: number[];
}) {
  const { CanvasKit } = useReactCanvasKit();

  // TODO: Delete internal gradient shaders on unmount
  const paint = useMemo(() => Primitives.fill(CanvasKit, fill, transform), [
    CanvasKit,
    fill,
    transform,
  ]);

  useDeletable(paint);

  return <Path path={path} paint={paint} />;
});

const SketchShadow = memo(function SketchShadow({
  path,
  shadow,
  clipPath,
  borderWidth,
  borderPosition,
}: {
  path: CanvasKit.Path;
  shadow: Sketch.Shadow;
  clipPath?: CanvasKit.Path;
  borderWidth: number;
  borderPosition: Sketch.BorderPosition;
}) {
  const { CanvasKit } = useReactCanvasKit();

  const paintParameters: PaintParameters = useMemo(
    () => ({
      style: CanvasKit.PaintStyle.Fill,
      color: Primitives.color(CanvasKit, shadow.color),
      maskFilter: CanvasKit.MaskFilter.MakeBlur(
        CanvasKit.BlurStyle.Normal,
        shadow.blurRadius / 2, // Skia blurs seem twice as large as Sketch blurs
        true,
      ),
    }),
    [CanvasKit, shadow],
  );
  const paint = usePaint(paintParameters);

  const transform = useMemo(
    () => AffineTransform.translation(shadow.offsetX, shadow.offsetY),
    [shadow.offsetX, shadow.offsetY],
  );

  const clip: ClipProps | undefined = clipPath
    ? {
        path: clipPath,
        op: CanvasKit.ClipOp.Difference,
      }
    : undefined;

  const additionalRadius =
    shadow.spread +
    borderWidth *
      (borderPosition === Sketch.BorderPosition.Outside
        ? 2
        : borderPosition === Sketch.BorderPosition.Center
        ? 1
        : 0);

  // TODO: We can optimize this: if there's no spread, we don't need to copy the path.
  // We currently need to copy the path since we use `useDeletable` after, and don't want
  // to delete a path passed in as a prop.
  const strokedPath: CanvasKit.Path = getStrokedPath(
    CanvasKit,
    path,
    additionalRadius,
    CanvasKit.PathOp.Union,
  );

  useDeletable(strokedPath);

  return (
    <Group transform={transform} clip={clip}>
      <Path path={strokedPath} paint={paint} />
    </Group>
  );
});

/**
 * This is a special case of layer shadow. If there are no fills but
 * at least one border, then we draw a shadow just for the border.
 */
const SketchBorderShadow = memo(function SketchBorderShadow({
  path,
  shadow,
  border,
}: {
  path: CanvasKit.Path;
  shadow: Sketch.Shadow;
  border: Sketch.Border;
}) {
  const { CanvasKit } = useReactCanvasKit();

  const strokedPath = useMemo(
    () => Primitives.getStrokedBorderPath(CanvasKit, path, border),
    [CanvasKit, border, path],
  );

  return (
    <SketchShadow
      shadow={shadow}
      path={strokedPath}
      borderWidth={0}
      borderPosition={Sketch.BorderPosition.Inside}
    />
  );
});

const SketchBorder = memo(function SketchBorder({
  path,
  border,
}: {
  path: CanvasKit.Path;
  border: Sketch.Border;
}) {
  const { CanvasKit } = useReactCanvasKit();

  const paint = useFill({
    color: Primitives.color(CanvasKit, border.color),
  });

  const strokedPath = useMemo(
    () => Primitives.getStrokedBorderPath(CanvasKit, path, border),
    [CanvasKit, border, path],
  );

  useDeletable(strokedPath);

  return <Path path={strokedPath} paint={paint} />;
});

interface Props {
  layer: Sketch.Rectangle | Sketch.Oval;
}

export default memo(function SketchShape({ layer }: Props) {
  const { CanvasKit } = useReactCanvasKit();

  const path = Primitives.path(
    CanvasKit,
    layer.points,
    layer.frame,
    Layers.getFixedRadius(layer),
  );

  path.setFillType(CanvasKit.FillType.EvenOdd);

  const transform = useMemo(
    () => getGradientTransformationMatrix(CanvasKit, layer.frame),
    [CanvasKit, layer.frame],
  );

  if (!layer.style) return null;

  const fills = (layer.style.fills ?? []).filter((x) => x.isEnabled).reverse();
  const borders = (layer.style.borders ?? []).filter((x) => x.isEnabled);
  const shadows = (layer.style.shadows ?? [])
    .filter((x) => x.isEnabled)
    .reverse();

  const borderWidth = Math.max(0, ...borders.map((border) => border.thickness));
  const borderPosition =
    borders.length > 0 ? borders[0].position : Sketch.BorderPosition.Inside;

  const elements = (
    <>
      {shadows.map((shadow, index) =>
        fills.length === 0 && borders.length > 0 ? (
          <SketchBorderShadow
            key={`shadow-${index}`}
            shadow={shadow}
            path={path}
            border={borders[0]}
          />
        ) : (
          <SketchShadow
            key={`shadow-${index}`}
            shadow={shadow}
            path={path}
            clipPath={fills.length > 0 ? path : undefined}
            borderWidth={borderWidth}
            borderPosition={borderPosition}
          />
        ),
      )}
      {fills.map((fill, index) => (
        <SketchFill
          key={`fill-${index}`}
          fill={fill}
          path={path}
          transform={transform}
        />
      ))}
      {borders.map((border, index) => (
        <SketchBorder key={`border-${index}`} border={border} path={path} />
      ))}
    </>
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  return opacity < 1 ? <Group opacity={opacity}>{elements}</Group> : elements;
});
