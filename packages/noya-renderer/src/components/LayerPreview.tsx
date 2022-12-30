import Sketch from 'noya-file-format';
import {
  AffineTransform,
  createBounds,
  Rect,
  resize,
  resizeIfLarger,
  Size,
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
  layerFrame: frame,
  previewSize: size,
  padding = 0,
  scalingMode = 'upOrDown',
  showCheckeredBackground = false,
  backgroundColor,
}: Props) {
  const CanvasKit = useCanvasKit();

  const bounds = createBounds(frame);

  const paddedSize = {
    width: size.width - padding * 2,
    height: size.height - padding * 2,
  };

  const layerSize = { width: frame.width, height: frame.height };

  const scaledRect =
    scalingMode === 'down'
      ? resizeIfLarger(layerSize, paddedSize)
      : resize(layerSize, paddedSize);

  const transform = useMemo(() => {
    const scale = {
      x: scaledRect.width / layerSize.width,
      y: scaledRect.height / layerSize.height,
    };

    return AffineTransform.multiply(
      // Translate to the center of the size
      AffineTransform.translate(
        size.width / 2 + padding * scale.x,
        size.height / 2 + padding * scale.y,
      ),
      AffineTransform.scale(scale.x, scale.y),
      // Translate to (0,0) before scaling, since scale is applied at the origin
      AffineTransform.translate(-bounds.midX - padding, -bounds.midY - padding),
    );
  }, [
    size.width,
    size.height,
    scaledRect.width,
    scaledRect.height,
    layerSize.width,
    layerSize.height,
    bounds.midX,
    bounds.midY,
    padding,
  ]);

  const paddedRect = useMemo(
    () => ({
      x: scaledRect.x + padding,
      y: scaledRect.y + padding,
      width: scaledRect.width,
      height: scaledRect.height,
    }),
    [padding, scaledRect.height, scaledRect.width, scaledRect.x, scaledRect.y],
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
