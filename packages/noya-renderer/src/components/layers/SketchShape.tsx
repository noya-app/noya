import Sketch from '@sketch-hq/sketch-file-format-ts';
import * as CanvasKit from 'canvaskit-wasm';
import {
  ClipProps,
  Group,
  Path,
  useDeletable,
  useReactCanvasKit,
} from 'noya-react-canvaskit';
import { Primitives } from 'noya-renderer';
import { Layers } from 'noya-state';
import { memo, useMemo } from 'react';

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

const SketchBorder = memo(function SketchBorder({
  path,
  border,
}: {
  path: CanvasKit.Path;
  border: Sketch.Border;
}) {
  const { CanvasKit } = useReactCanvasKit();

  const paint = useMemo(() => {
    const paint = Primitives.border(CanvasKit, border);

    switch (border.position) {
      case Sketch.BorderPosition.Center:
        return paint;
      case Sketch.BorderPosition.Outside:
      case Sketch.BorderPosition.Inside:
        paint.setStrokeWidth(border.thickness * 2);
        return paint;
    }
  }, [CanvasKit, border]);

  useDeletable(paint);

  let clip: ClipProps | undefined = useMemo(() => {
    switch (border.position) {
      case Sketch.BorderPosition.Center:
        return;
      case Sketch.BorderPosition.Outside:
        return { path, op: CanvasKit.ClipOp.Difference };
      case Sketch.BorderPosition.Inside:
        return { path, op: CanvasKit.ClipOp.Intersect };
    }
  }, [
    CanvasKit.ClipOp.Difference,
    CanvasKit.ClipOp.Intersect,
    border.position,
    path,
  ]);

  const element = <Path path={path} paint={paint} />;

  return clip ? <Group clip={clip}>{element}</Group> : element;
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

  const fills = (layer.style.fills ?? []).slice().reverse();
  const borders = (layer.style.borders ?? []).slice().reverse();

  const elements = (
    <>
      {fills.map((fill, index) =>
        fill.isEnabled ? (
          <SketchFill
            key={`fill-${index}`}
            fill={fill}
            path={path}
            transform={transform}
          />
        ) : null,
      )}
      {borders.map((border, index) =>
        border.isEnabled ? (
          <SketchBorder key={`border-${index}`} border={border} path={path} />
        ) : null,
      )}
    </>
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  return opacity < 1 ? <Group opacity={opacity}>{elements}</Group> : elements;
});
