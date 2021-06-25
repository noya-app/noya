import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  AffineTransform,
  createBounds,
  resizeIfLarger,
  Size,
} from 'noya-geometry';
import { Group } from 'noya-react-canvaskit';
import { SketchGroup, SketchLayer } from 'noya-renderer';
import { Layers, PageLayer } from 'noya-state';
import { memo, useMemo } from 'react';
import CanvasGridItem from './CanvasGridItem';

interface Props {
  layer: Sketch.SymbolMaster;
}

export function RCKLayerPreview({
  layer,
  size,
  padding = 10,
}: {
  layer: PageLayer;
  size: Size;
  padding?: number;
}) {
  const bounds = useMemo(() => createBounds(layer.frame), [layer.frame]);

  const paddedSize = useMemo(
    () => ({
      width: size.width - padding * 2,
      height: size.height - padding * 2,
    }),
    [padding, size.height, size.width],
  );

  const layerSize = useMemo(
    () => ({ width: layer.frame.width, height: layer.frame.height }),
    [layer.frame.height, layer.frame.width],
  );

  const scaledRect = useMemo(() => resizeIfLarger(layerSize, paddedSize), [
    layerSize,
    paddedSize,
  ]);

  const transform = useMemo(() => {
    // Scale down to fit, if needed
    const scale = Math.min(
      1,
      Math.max(
        scaledRect.width / layerSize.width,
        scaledRect.height / layerSize.height,
      ),
    );

    return AffineTransform.multiply(
      // Translate to the center of the size
      AffineTransform.translation(size.width / 2, size.height / 2),
      AffineTransform.scale(scale),
      // Translate to (0,0) before scaling, since scale is applied at the origin
      AffineTransform.translation(-bounds.midX, -bounds.midY),
    );
  }, [
    scaledRect.width,
    scaledRect.height,
    layerSize.width,
    layerSize.height,
    size.width,
    size.height,
    bounds.midX,
    bounds.midY,
  ]);

  return (
    <Group transform={transform}>
      {Layers.isSymbolMasterOrArtboard(layer) ? (
        <SketchGroup layer={layer} />
      ) : (
        <SketchLayer layer={layer} />
      )}
    </Group>
  );
}

export default memo(function Symbol({ layer }: Props) {
  return (
    <CanvasGridItem
      renderContent={(size) => <RCKLayerPreview layer={layer} size={size} />}
    />
  );
});
