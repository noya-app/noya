import Sketch from 'noya-file-format';
import { LayerPreview as RCKLayerPreview } from 'noya-renderer';
import { memo } from 'react';
import CanvasGridItem from './CanvasGridItem';

interface Props {
  layer: Sketch.SymbolMaster;
}

export default memo(function Symbol({ layer }: Props) {
  return (
    <CanvasGridItem
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
