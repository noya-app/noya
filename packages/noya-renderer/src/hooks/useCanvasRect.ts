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
