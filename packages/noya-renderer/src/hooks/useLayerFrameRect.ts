import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useReactCanvasKit } from 'noya-react-canvaskit';
import { Primitives } from 'noya-renderer';
import { useMemo } from 'react';

export default function useLayerFrameRect(layer: Sketch.AnyLayer) {
  const { CanvasKit } = useReactCanvasKit();

  return useMemo(() => {
    return Primitives.rect(CanvasKit, layer.frame);
  }, [CanvasKit, layer]);
}
