import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useCanvasKit } from 'noya-renderer';
import { Primitives } from 'noya-state';
import { useMemo } from 'react';

export default function useLayerFrameRect(layer: Sketch.AnyLayer) {
  const CanvasKit = useCanvasKit();

  return useMemo(() => {
    return Primitives.rect(CanvasKit, layer.frame);
  }, [CanvasKit, layer]);
}
