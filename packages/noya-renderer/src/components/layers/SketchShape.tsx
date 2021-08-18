import Sketch from '@sketch-hq/sketch-file-format-ts';
import * as CanvasKit from 'canvaskit';
import { Rect, AffineTransform } from 'noya-geometry';
import { ClipProps, useDeletable, usePaint } from 'noya-react-canvaskit';
import { PaintParameters } from 'noya-react-canvaskit';
import { Group, Path, useCanvasKit } from 'noya-renderer';
import { memo, useMemo } from 'react';
import { Primitives, getStrokedPath } from 'noya-state';
import { useSketchImage } from '../../ImageCache';
import SketchBorder from '../effects/SketchBorder';
import useLayerPath from '../../hooks/useLayerPath';
import { SketchModel } from 'noya-sketch-model';

const SketchFill = memo(function SketchFill({
  path,
  fill,
  frame,
}: {
  path: CanvasKit.Path;
  fill: Sketch.Fill;
  frame: Rect;
}) {
  const CanvasKit = useCanvasKit();

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
  const CanvasKit = useCanvasKit();

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
    () => AffineTransform.translate(shadow.offsetX, shadow.offsetY),
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
  const CanvasKit = useCanvasKit();

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
  const CanvasKit = useCanvasKit();

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
  layer:
    | Sketch.Rectangle
    | Sketch.Oval
    | Sketch.Triangle
    | Sketch.Star
    | Sketch.Polygon
    | Sketch.ShapePath
    | Sketch.ShapeGroup;
}

export default memo(function SketchShape({ layer }: Props) {
  const path = useLayerPath(layer);

  const style = useMemo(() => layer.style ?? SketchModel.style(), [
    layer.style,
  ]);

  const fills = (style.fills ?? []).filter((x) => x.isEnabled);
  const borders = (style.borders ?? []).filter((x) => x.isEnabled);
  const shadows = (style.shadows ?? []).filter((x) => x.isEnabled);
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
        <SketchBorder
          key={`border-${index}`}
          path={path}
          border={border}
          frame={layer.frame}
        />
      ))}
    </>
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  return opacity < 1 ? <Group opacity={opacity}>{elements}</Group> : elements;
});
