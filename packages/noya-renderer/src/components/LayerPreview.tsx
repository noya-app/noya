import {
  AffineTransform,
  createBounds,
  Rect,
  resize,
  resizeIfLarger,
  Size,
} from 'noya-geometry';
import {
  Group,
  Primitives,
  Rect as RCKRect,
  SketchLayer,
  useCanvasKit,
} from 'noya-renderer';
import { Layers, PageLayer } from 'noya-state';
import { useMemo } from 'react';
import useCheckeredFill from '../hooks/useCheckeredFill';
import { SketchArtboardContent } from './layers/SketchArtboard';

function CheckeredRect({ rect }: { rect: Rect }) {
  const paint = useCheckeredFill();
  const CanvasKit = useCanvasKit();

  return <RCKRect paint={paint} rect={Primitives.rect(CanvasKit, rect)} />;
}

interface Props {
  layer: PageLayer;
  size: Size;
  padding?: number;
  scalingMode?: 'upOrDown' | 'down';
  showCheckeredBackground?: boolean;
}

export default function LayerPreview({
  layer,
  size,
  padding = 0,
  scalingMode = 'upOrDown',
  showCheckeredBackground = false,
}: Props) {
  const bounds = createBounds(layer.frame);

  const paddedSize = {
    width: size.width - padding * 2,
    height: size.height - padding * 2,
  };

  const layerSize = { width: layer.frame.width, height: layer.frame.height };

  const scaledRect =
    scalingMode === 'down'
      ? resizeIfLarger(layerSize, paddedSize)
      : resize(layerSize, paddedSize);

  const transform = useMemo(() => {
    return AffineTransform.multiply(
      // Translate to the center of the size
      AffineTransform.translation(size.width / 2, size.height / 2),
      AffineTransform.scale(
        scaledRect.width / layerSize.width,
        scaledRect.height / layerSize.height,
      ),
      // Translate to (0,0) before scaling, since scale is applied at the origin
      AffineTransform.translation(-bounds.midX, -bounds.midY),
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

  return (
    <>
      {showCheckeredBackground && <CheckeredRect rect={scaledRect} />}
      <Group transform={transform}>
        {Layers.isSymbolMasterOrArtboard(layer) ? (
          <SketchArtboardContent
            layer={layer}
            showBackground={
              layer.hasBackgroundColor && layer.includeBackgroundColorInExport
            }
          />
        ) : (
          <SketchLayer layer={layer} />
        )}
      </Group>
    </>
  );
}
