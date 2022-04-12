import { useCallback } from 'react';

import { Selectors } from 'noya-state';
import { Gestures } from 'noya-designsystem';
import { useSelector } from 'noya-app-state-context';
import { AffineTransform, Point } from 'noya-geometry';
import useCanvasPinchEvents from './useCanvasPinchEvents';
import useSinglePanEvents from './useSinglePanEvents';
import useCanvasPanEvents from './useCanvasPanEvents';

export default function useCanvasGestures(): Gestures {
  const meta = useSelector(Selectors.getCurrentPageMetadata);
  // Event coordinates are relative to (0,0), but we want them to include
  // the current page's zoom and offset from the origin
  const offsetEventPoint = useCallback(
    (point: Point) =>
      AffineTransform.scale(1 / meta.zoomValue)
        .translate(-meta.scrollOrigin.x, -meta.scrollOrigin.y)
        .applyTo(point),
    [meta],
  );

  const panHandlersSingle = useSinglePanEvents(offsetEventPoint);
  const panHandlersDouble = useCanvasPanEvents();
  const pinchHandlers = useCanvasPinchEvents();

  return {
    panHandlersSingle,
    panHandlersDouble,
    pinchHandlers,
  };
}
