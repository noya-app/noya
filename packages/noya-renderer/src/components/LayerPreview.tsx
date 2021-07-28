import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  AffineTransform,
  createBounds,
  Rect,
  resize,
  resizeIfLarger,
  Size,
} from 'noya-geometry';
import { ClipProps, useColorFill, useDeletable } from 'noya-react-canvaskit';
import {
  Group,
  Rect as RCKRect,
  SketchLayer,
  useCanvasKit,
} from 'noya-renderer';
import { PageLayer, Primitives } from 'noya-state';
import { useMemo } from 'react';
import useCheckeredFill from '../hooks/useCheckeredFill';

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

export default function LayerPreview({
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
    return AffineTransform.multiply(
      // Translate to the center of the size
      AffineTransform.translate(size.width / 2, size.height / 2),
      AffineTransform.scale(
        scaledRect.width / layerSize.width,
        scaledRect.height / layerSize.height,
      ),
      // Translate to (0,0) before scaling, since scale is applied at the origin
      AffineTransform.translate(-bounds.midX, -bounds.midY),
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
  ]);

  const path = useMemo(() => {
    const path = new CanvasKit.Path();
    path.addRect(Primitives.rect(CanvasKit, scaledRect));
    return path;
  }, [CanvasKit, scaledRect]);

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
      {showCheckeredBackground && <CheckeredFill rect={scaledRect} />}
      {backgroundColor && (
        <BackgroundFill color={backgroundColor} rect={scaledRect} />
      )}
      <Group transform={transform} clip={clip}>
        <SketchLayer layer={layer} />
      </Group>
    </>
  );
}
