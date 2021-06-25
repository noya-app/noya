import Sketch from '@sketch-hq/sketch-file-format-ts';
import { LayerPreview } from 'noya-renderer';
import { memo } from 'react';
import CanvasGridItem from './CanvasGridItem';

interface Props {
  layer: Sketch.SymbolMaster;
}

export default memo(function Symbol({ layer }: Props) {
  return (
    <CanvasGridItem
      renderContent={(size) => (
        <LayerPreview
          layer={layer}
          size={size}
          padding={10}
          scalingMode="down"
        />
      )}
    />
  );
});
