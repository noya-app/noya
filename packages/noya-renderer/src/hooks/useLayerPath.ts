import { useCanvasKit } from 'noya-renderer';
import { Layers, Primitives } from 'noya-state';
import { useMemo } from 'react';

export default function useLayerPath(layer: Layers.PointsLayer) {
  const CanvasKit = useCanvasKit();

  return useMemo(() => {
    const path = Primitives.path(
      CanvasKit,
      layer.points,
      layer.frame,
      layer.isClosed,
    );

    path.setFillType(CanvasKit.FillType.EvenOdd);

    return path;
  }, [CanvasKit, layer]);
}
