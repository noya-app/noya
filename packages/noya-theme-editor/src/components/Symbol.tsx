import { Sketch } from '@noya-app/noya-file-format';
import { LayerPreview as RCKLayerPreview } from 'noya-renderer';
import React, { memo } from 'react';
import { CanvasPreviewItem } from './CanvasPreviewItem';

interface Props {
  layer: Sketch.SymbolMaster;
}

export const Symbol = memo(function Symbol({ layer }: Props) {
  return (
    <CanvasPreviewItem
      renderContent={(size) => (
        <RCKLayerPreview
          layer={layer}
          layerFrame={layer.frame}
          previewSize={size}
          padding={10}
          scalingMode="down"
        />
      )}
    />
  );
});
