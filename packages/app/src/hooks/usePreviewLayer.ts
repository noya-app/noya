import Sketch from '@sketch-hq/sketch-file-format-ts';
import { transformRect } from 'noya-geometry';
import { Layers, Selectors } from 'noya-state';
import { useMemo } from 'react';

export function usePreviewLayer({
  page,
  layer,
}: {
  page: Sketch.Page;
  layer: Sketch.AnyLayer;
}) {
  const previewLayer = Layers.isSlice(layer) ? page : layer;

  const previewFrame = useMemo(() => {
    if (!Layers.isSlice(layer)) return layer.frame;

    const indexPath = Layers.findIndexPath(
      page,
      (l) => l.do_objectID === layer.do_objectID,
    );

    if (!indexPath) return layer.frame;

    const transform = Selectors.getLayerTransformAtIndexPath(page, indexPath);

    return transformRect(layer.frame, transform);
  }, [layer, page]);

  return {
    layer: previewLayer,
    frame: previewFrame,
    backgroundColor:
      Layers.isSlice(layer) && layer.hasBackgroundColor
        ? layer.backgroundColor
        : undefined,
  };
}
