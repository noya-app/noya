import { SketchModel } from '@noya-app/noya-sketch-model';
import { useWorkspace } from 'noya-app-state-context';
import { useMemo } from 'react';
import { useCanvasKit } from './useCanvasKit';

export function useCanvasRect() {
  const { canvasSize, canvasInsets } = useWorkspace();
  const CanvasKit = useCanvasKit();
  const canvasRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        canvasInsets.left,
        0,
        canvasSize.width,
        canvasSize.height,
      ),
    [CanvasKit, canvasInsets.left, canvasSize.height, canvasSize.width],
  );
  return canvasRect;
}

export function useCanvasFrame() {
  const { canvasSize, canvasInsets } = useWorkspace();

  return useMemo(
    () =>
      SketchModel.rect({
        x: canvasInsets.left,
        y: 0,
        width: canvasSize.width,
        height: canvasSize.height,
      }),
    [canvasInsets.left, canvasSize.height, canvasSize.width],
  );
}
