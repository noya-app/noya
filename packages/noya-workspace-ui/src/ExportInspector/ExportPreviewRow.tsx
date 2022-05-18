import React, { memo, useCallback } from 'react';

import { LayerPreview as RCKLayerPreview } from 'noya-renderer';
import { Size } from 'noya-geometry';
import Sketch from 'noya-file-format';
import { PageLayer } from 'noya-state';
import { AspectRatio } from 'noya-designsystem';
import { usePreviewLayer } from '../hooks/usePreviewLayer';
import CanvasGridItem from '../CanvasGridItem';

interface Props {
  layer: PageLayer;
  page: Sketch.Page;
}

export default memo(function ExportPreviewRow({ layer, page }: Props) {
  const preview = usePreviewLayer({ layer, page });

  const renderContent = useCallback(
    (size: Size) => (
      <RCKLayerPreview
        layer={preview.layer}
        layerFrame={preview.frame}
        backgroundColor={preview.backgroundColor}
        previewSize={size}
        showCheckeredBackground
      />
    ),
    [preview.backgroundColor, preview.frame, preview.layer],
  );

  return (
    <AspectRatio ratio={Math.max(1, layer.frame.width / layer.frame.height)}>
      <CanvasGridItem renderContent={renderContent} />
    </AspectRatio>
  );
});
