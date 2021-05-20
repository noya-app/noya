import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { AffineTransform, resizeIfLarger, Size } from 'noya-geometry';
import { Group } from 'noya-react-canvaskit';
import { SketchGroup } from 'noya-renderer';
import React, { memo, useMemo } from 'react';
import CanvasGridItem from './CanvasGridItem';

interface Props {
  layer: Sketch.SymbolMaster;
}

const PADDING = 10;

function RCKSymbolPreview({
  layer,
  size,
}: {
  layer: Sketch.SymbolMaster;
  size: Size;
}) {
  const scaledRect = useMemo(
    () =>
      resizeIfLarger(
        {
          width: layer.frame.width,
          height: layer.frame.height,
        },
        {
          width: size.width - PADDING * 2,
          height: size.height - PADDING * 2,
        },
      ),
    [layer.frame, size],
  );

  const transform = useMemo(() => {
    // Scale down to fit, if needed
    const scale = Math.min(
      1,
      Math.max(
        scaledRect.width / layer.frame.width,
        scaledRect.height / layer.frame.height,
      ),
    );

    return AffineTransform.multiply(
      AffineTransform.translation(
        scaledRect.x + PADDING,
        scaledRect.y + PADDING,
      ),
      AffineTransform.scale(scale),
    );
  }, [layer.frame, scaledRect]);

  const scaledLayer = useMemo(() => {
    return produce(layer, (draft) => {
      // We set the origin to 0 since it's simpler to apply the translation
      // as part of the transform before scaling
      draft.frame = {
        ...draft.frame,
        x: 0,
        y: 0,
        width: scaledRect.width,
        height: scaledRect.height,
      };
    });
  }, [layer, scaledRect]);

  return (
    <Group transform={transform}>
      <SketchGroup layer={scaledLayer} />
    </Group>
  );
}

export default memo(function Symbol({ layer }: Props) {
  return (
    <CanvasGridItem
      renderContent={(size) => <RCKSymbolPreview layer={layer} size={size} />}
    />
  );
});
