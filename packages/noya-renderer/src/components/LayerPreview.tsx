import {
  AffineTransform,
  createBounds,
  resizeIfLarger,
  Size,
} from 'noya-geometry';
import { Group } from 'noya-react-canvaskit';
import { SketchGroup, SketchLayer } from 'noya-renderer';
import { Layers, PageLayer } from 'noya-state';
import { useMemo } from 'react';

interface Props {
  layer: PageLayer;
  size: Size;
  padding?: number;
}

export default function LayerPreview({ layer, size, padding = 0 }: Props) {
  const transform = useMemo(() => {
    const bounds = createBounds(layer.frame);

    const paddedSize = {
      width: size.width - padding * 2,
      height: size.height - padding * 2,
    };

    const layerSize = { width: layer.frame.width, height: layer.frame.height };

    const scaledRect = resizeIfLarger(layerSize, paddedSize);

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
  }, [layer.frame, size.width, size.height, padding]);

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
