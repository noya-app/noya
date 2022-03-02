import Sketch from 'noya-file-format';
import { useCanvasKit } from 'noya-renderer';
import { Layers, Primitives } from 'noya-state';
import { CanvasKit } from 'canvaskit-types';
import { useMemo } from 'react';
import { getCombinedLayerPaths } from '../utils/getCombinedLayerPaths';
import { useDeletable } from 'noya-react-canvaskit';

export function getLayerPath(
  CanvasKit: CanvasKit,
  layer: Layers.PointsLayer | Sketch.ShapeGroup,
) {
  const path = Layers.isShapeGroup(layer)
    ? getCombinedLayerPaths(CanvasKit, layer)
    : Primitives.path(CanvasKit, layer.points, layer.frame, layer.isClosed);

  path.setFillType(
    Primitives.pathFillType(CanvasKit, layer.style!.windingRule),
  );

  return path;
}

export default function useLayerPath(
  layer: Layers.PointsLayer | Sketch.ShapeGroup,
) {
  const CanvasKit = useCanvasKit();

  const path = useMemo(
    () => getLayerPath(CanvasKit, layer),
    [CanvasKit, layer],
  );

  useDeletable(path);

  return path;
}
