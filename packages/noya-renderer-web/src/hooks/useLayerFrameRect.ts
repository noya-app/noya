import Sketch from 'noya-file-format';
import { useCanvasKit } from 'noya-renderer-web';
import { Primitives } from 'noya-state';
import { useMemo } from 'react';

export default function useLayerFrameRect(layer: Sketch.AnyLayer) {
  const CanvasKit = useCanvasKit();

  return useMemo(() => {
    return Primitives.rect(CanvasKit, layer.frame);
  }, [CanvasKit, layer]);
}
