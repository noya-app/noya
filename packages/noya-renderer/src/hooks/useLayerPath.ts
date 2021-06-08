import { useReactCanvasKit } from 'noya-react-canvaskit';
import { Layers } from 'noya-state';
import { useMemo } from 'react';
import { Primitives } from 'noya-renderer';

export default function useLayerPath(layer: Layers.PointsLayer) {
  const { CanvasKit } = useReactCanvasKit();

  return useMemo(() => {
    const path = Primitives.path(CanvasKit, layer.points, layer.frame);

    path.setFillType(CanvasKit.FillType.EvenOdd);

    return path;
  }, [CanvasKit, layer]);
}
