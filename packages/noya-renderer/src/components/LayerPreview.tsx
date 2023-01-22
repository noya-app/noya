import Sketch from 'noya-file-format';
import {
  createResizeTransform,
  Rect,
  Size,
  transformRect,
} from 'noya-geometry';
import { ClipProps, useColorFill, useDeletable } from 'noya-react-canvaskit';
import { PageLayer, Primitives } from 'noya-state';
import React, { useMemo } from 'react';
import { Group, Rect as RCKRect } from '../ComponentsContext';
import { useCanvasKit } from '../hooks/useCanvasKit';
import useCheckeredFill from '../hooks/useCheckeredFill';
import SketchLayer from './layers/SketchLayer';

function CheckeredFill({ rect }: { rect: Rect }) {
  const CanvasKit = useCanvasKit();

  const paint = useCheckeredFill();

  return <RCKRect paint={paint} rect={Primitives.rect(CanvasKit, rect)} />;
}

function BackgroundFill({ color, rect }: { color: Sketch.Color; rect: Rect }) {
  const CanvasKit = useCanvasKit();

  const paint = useColorFill(Primitives.color(CanvasKit, color));

  return <RCKRect paint={paint} rect={Primitives.rect(CanvasKit, rect)} />;
}

interface Props {
  layer: PageLayer | Sketch.Page;
  layerFrame: Rect;
  previewSize: Size;
  padding?: number;
  scalingMode?: 'upOrDown' | 'down';
  showCheckeredBackground?: boolean;
  backgroundColor?: Sketch.Color;
}

export function LayerPreview({
  layer,
  layerFrame: contentRect,
  previewSize: containerSize,
  padding = 0,
  scalingMode = 'upOrDown',
  showCheckeredBackground = false,
  backgroundColor,
}: Props) {
  const CanvasKit = useCanvasKit();

  const transform = useMemo(
    () =>
      createResizeTransform(contentRect, containerSize, {
        padding,
        scalingMode,
      }),
    [contentRect, containerSize, padding, scalingMode],
  );

  const paddedRect = useMemo(
    () => transformRect(contentRect, transform),
    [contentRect, transform],
  );

  const path = useMemo(() => {
    const path = new CanvasKit.Path();
    path.addRect(Primitives.rect(CanvasKit, paddedRect));
    return path;
  }, [CanvasKit, paddedRect]);

  useDeletable(path);

  const clip: ClipProps = useMemo(
    () => ({
      path,
      op: CanvasKit.ClipOp.Intersect,
    }),
    [CanvasKit.ClipOp.Intersect, path],
  );

  return (
    <>
      {showCheckeredBackground && <CheckeredFill rect={paddedRect} />}
      {backgroundColor && (
        <BackgroundFill color={backgroundColor} rect={paddedRect} />
      )}
      <Group transform={transform} clip={clip}>
        <SketchLayer layer={layer} />
      </Group>
    </>
  );
}
