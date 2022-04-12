import { useCallback, useRef } from 'react';

import { useApplicationState } from 'noya-app-state-context';
import { PanEvent, PanUpdateEvent } from 'noya-designsystem';
import { Point } from 'noya-geometry';

export default function useCanvasPanEvents() {
  const [, dispatch] = useApplicationState();

  const prevPoint = useRef<Point>({ x: 0, y: 0 });

  const onStart = useCallback((event: PanEvent) => {
    const rawPoint = { x: event.x, y: event.y };

    prevPoint.current = rawPoint;
  }, []);

  const onUpdate = useCallback(
    (event: PanUpdateEvent) => {
      const rawPoint = { x: event.x, y: event.y };
      const delta = {
        x: prevPoint.current.x - rawPoint.x,
        y: prevPoint.current.y - rawPoint.y,
      };

      dispatch('pan*', delta);

      prevPoint.current = rawPoint;
    },
    [dispatch],
  );

  const onEnd = useCallback(() => {
    prevPoint.current = { x: 0, y: 0 };
  }, []);

  return { onStart, onUpdate, onEnd };
}
