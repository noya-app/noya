import Sketch from 'noya-file-format';
import { LayerPreview as RCKLayerPreview } from 'noya-renderer';
import { Selectors } from 'noya-state';
import React, { memo, useCallback, useMemo } from 'react';
import CanvasPreviewItem from '../components/theme/CanvasPreviewItem';

export type PageGridMenuItemType = 'duplicate' | 'delete' | 'rename';

interface PagePreviewItemProps {
  page: Sketch.Page;
  padding?: number;
}

export const PagePreviewItem = memo(function PageGridItem({
  page,
  padding = 0,
}: PagePreviewItemProps) {
  const frame = useMemo(
    () => Selectors.getPageContentBoundingRect(page),
    [page],
  );

  return (
    <CanvasPreviewItem
      renderContent={useCallback(
        (size) =>
          frame && (
            <RCKLayerPreview
              layer={page}
              layerFrame={frame}
              previewSize={size}
              scalingMode="down"
              padding={padding}
            />
          ),
        [frame, padding, page],
      )}
    />
  );
});
