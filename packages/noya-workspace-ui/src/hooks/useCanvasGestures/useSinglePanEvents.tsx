import { useCallback } from 'react';

import { useApplicationState } from 'noya-app-state-context';
import { PanEvent, PanUpdateEvent } from 'noya-designsystem';
import { Point } from 'noya-geometry';

export default function useSinglePanEvents(
  offsetEventPoint: (point: Point) => Point,
) {
  const [state, dispatch] = useApplicationState();

  const onStart = useCallback(
    (event: PanEvent) => {
      const rawPoint = { x: event.x, y: event.y };
      const point = offsetEventPoint(rawPoint);
      switch (state.interactionState.type) {
        case 'insert': {
          dispatch('interaction', [
            'startDrawing',
            state.interactionState.layerType,
            point,
          ]);
          break;
        }
      }
    },
    [offsetEventPoint, dispatch, state],
  );

  const onUpdate = useCallback(
    (event: PanUpdateEvent) => {
      const rawPoint = { x: event.x, y: event.y };
      const point = offsetEventPoint(rawPoint);

      switch (state.interactionState.type) {
        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);
          break;
        }
      }
    },
    [offsetEventPoint, dispatch, state],
  );

  const onEnd = useCallback(
    (event: PanEvent) => {
      const rawPoint = { x: event.x, y: event.y };
      const point = offsetEventPoint(rawPoint);

      switch (state.interactionState.type) {
        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);
          dispatch('addDrawnLayer');
          break;
        }
      }
    },
    [offsetEventPoint, dispatch, state],
  );

  return { onStart, onUpdate, onEnd };
}
