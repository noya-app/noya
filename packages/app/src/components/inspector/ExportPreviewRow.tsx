import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import { memo, useCallback } from 'react';
import { LayerPreview as RCKLayerPreview } from 'noya-renderer';
import { PageLayer } from '../../../../noya-state/src';
import CanvasGridItem from '../theme/CanvasGridItem';

interface Props {
  layer: PageLayer;
}

export default memo(function ExportPreviewRow({ layer }: Props) {
  return (
    <AspectRatio.Root
      ratio={Math.max(1, layer.frame.width / layer.frame.height)}
    >
      <CanvasGridItem
        renderContent={useCallback(
          (size) => (
            <RCKLayerPreview
              layer={layer}
              size={size}
              showCheckeredBackground
            />
          ),
          [layer],
        )}
      />
    </AspectRatio.Root>
  );
});
