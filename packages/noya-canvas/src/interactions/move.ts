import { ReactEventHandlers } from 'noya-designsystem';
import { Point } from 'noya-geometry';
import { handleActionType, InteractionState } from 'noya-state';
import { isMoving } from '../utils/isMoving';
import { InteractionAPI } from './types';

export interface MoveActions {
  maybeMove: (point: Point) => void;
  updateMoving: (point: Point) => void;
  reset: () => void;
}

export function moveInteraction({
  maybeMove,
  updateMoving,
  reset,
}: MoveActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onPointerDown: (event) => {
        const screenPoint = api.getScreenPoint(event.nativeEvent);

        const layerId = api.getLayerIdAtPoint(screenPoint, {
          groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
          artboards: 'emptyOrContainedArtboardOrChildren',
          includeLockedLayers: false,
        });

        const canvasPoint = api.convertPoint(screenPoint, 'canvas');

        if (layerId) {
          maybeMove(canvasPoint);

          event.preventDefault();
        }
      },
    }),
    maybeMove: (interactionState, api) => ({
      onPointerMove: (event) => {
        const screenPoint = api.getScreenPoint(event.nativeEvent);
        const canvasPoint = api.convertPoint(screenPoint, 'canvas');

        const { origin } = interactionState;

        if (isMoving(canvasPoint, origin, api.zoomValue)) {
          updateMoving(canvasPoint);
        }

        api.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      },
      onPointerUp: (event) => {
        reset();

        api.releasePointerCapture?.(event.pointerId);
        event.preventDefault();
      },
    }),
    moving: (interactionState, api) => ({
      onPointerMove: (event) => {
        const screenPoint = api.getScreenPoint(event.nativeEvent);
        const canvasPoint = api.convertPoint(screenPoint, 'canvas');

        updateMoving(canvasPoint);

        api.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      },
      onPointerUp: (event) => {
        reset();

        api.releasePointerCapture?.(event.pointerId);
        event.preventDefault();
      },
    }),
  });
}
