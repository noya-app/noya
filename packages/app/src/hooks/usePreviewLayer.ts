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
    const indexPath =
      Layers.findIndexPath(page, (l) => l.do_objectID === layer.do_objectID) ??
      [];

    const transform = Selectors.getLayerTransformAtIndexPath(page, indexPath);

    return Layers.isSlice(layer)
      ? transformRect(layer.frame, transform)
      : layer.frame;
  }, [layer, page]);

  return {
    layer: previewLayer,
    frame: previewFrame,
  };
}
