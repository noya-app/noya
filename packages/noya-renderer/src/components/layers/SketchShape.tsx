import Sketch from '@sketch-hq/sketch-file-format-ts';
import * as CanvasKit from 'canvaskit';
import { AffineTransform } from 'noya-geometry';
import {
  ClipProps,
  Group,
  Path,
  useDeletable,
  usePaint,
  useReactCanvasKit,
} from 'noya-react-canvaskit';
import { PaintParameters } from 'noya-react-canvaskit/src/hooks/usePaint';
import { Primitives } from 'noya-renderer';
import { memo, useMemo } from 'react';
import { Rect } from '../../../../noya-state/src';
import { useSketchImage } from '../../ImageCache';
import { getStrokedPath } from '../../primitives/path';
import SketchBorder from '../effects/SketchBorder';

const SketchFill = memo(function SketchFill({
  path,
  fill,
  frame,
}: {
  path: CanvasKit.Path;
  fill: Sketch.Fill;
  frame: Rect;
}) {
  const { CanvasKit } = useReactCanvasKit();

  const image = useSketchImage(fill.image);

  // TODO: Delete internal gradient shaders on unmount
  const paint = useMemo(() => Primitives.fill(CanvasKit, fill, frame, image), [
    CanvasKit,
    fill,
    frame,
    image,
  ]);

  useDeletable(paint);

  return <Path path={path} paint={paint} />;
});

const SketchShadow = memo(function SketchShadow({
  path,
  shadow,
}: {
  path: CanvasKit.Path;
  shadow: Sketch.Shadow;
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

  return (
    <Group transform={transform}>
      <Path path={path} paint={paint} />
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
  borderWidth,
  borderPosition,
}: {
  path: CanvasKit.Path;
  shadow: Sketch.Shadow;
  borderWidth: number;
  borderPosition: Sketch.BorderPosition;
}) {
  const { CanvasKit } = useReactCanvasKit();

  const strokedPath = useMemo(
    () =>
      Primitives.getStrokedBorderPath(
        CanvasKit,
        path,
        borderWidth,
        borderPosition,
      ),
    [CanvasKit, borderPosition, borderWidth, path],
  );

  return <SketchShadow shadow={shadow} path={strokedPath} />;
});

const SketchFillShadow = memo(function SketchFillShadow({
  path,
  shadow,
  borderWidth,
  borderPosition,
  shouldClipPath,
}: {
  path: CanvasKit.Path;
  shadow: Sketch.Shadow;
  borderWidth: number;
  borderPosition: Sketch.BorderPosition;
  shouldClipPath: boolean;
}) {
  const { CanvasKit } = useReactCanvasKit();

  // Spread needs to be multiplied by 2 to match Sketch's behavior
  const additionalRadius =
    shadow.spread * 2 +
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

  const clip: ClipProps | undefined = useMemo(
    () =>
      shouldClipPath
        ? {
            path: path,
            op: CanvasKit.ClipOp.Difference,
          }
        : undefined,
    [CanvasKit.ClipOp.Difference, path, shouldClipPath],
  );

  return (
    <Group clip={clip}>
      <SketchShadow shadow={shadow} path={strokedPath} />
    </Group>
  );
});

interface Props {
  layer: Sketch.Rectangle | Sketch.Oval | Sketch.ShapePath;
}

export default memo(function SketchShape({ layer }: Props) {
  const { CanvasKit } = useReactCanvasKit();

  const path = Primitives.path(
    CanvasKit,
    layer.points,
    layer.frame,
    layer.isClosed,
  );

  path.setFillType(CanvasKit.FillType.EvenOdd);

  if (!layer.style) return null;

  const fills = (layer.style.fills ?? []).filter((x) => x.isEnabled);
  const borders = (layer.style.borders ?? [])
    .filter((x) => x.isEnabled)
    .reverse();
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
            borderWidth={borderWidth}
            borderPosition={borderPosition}
          />
        ) : (
          <SketchFillShadow
            key={`shadow-${index}`}
            shadow={shadow}
            path={path}
            shouldClipPath={fills.length > 0}
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
          frame={layer.frame}
        />
      ))}
      {borders.map((border, index) => (
        <SketchBorder key={`border-${index}`} path={path} border={border} />
      ))}
    </>
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  return opacity < 1 ? <Group opacity={opacity}>{elements}</Group> : elements;
});
