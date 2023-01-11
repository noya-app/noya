import { ReactEventHandlers } from 'noya-designsystem';
import { Point } from 'noya-geometry';
import { handleActionType, InteractionState, SetNumberMode } from 'noya-state';
import { isMoving } from '../utils/isMoving';
import { InteractionAPI } from './types';

export interface MoveActions {
  maybeMove: (point: Point) => void;
  updateMoving: (point: Point) => void;
  setLayerX: (value: number, mode: SetNumberMode) => void;
  setLayerY: (value: number, mode: SetNumberMode) => void;
  reset: () => void;
}

export function moveInteraction({
  maybeMove,
  updateMoving,
  setLayerX,
  setLayerY,
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
      onKeyDown: api.handleKeyboardEvent({
        ArrowLeft: () => setLayerX(-1, 'adjust'),
        ArrowRight: () => setLayerX(1, 'adjust'),
        ArrowUp: () => setLayerY(-1, 'adjust'),
        ArrowDown: () => setLayerY(1, 'adjust'),
        'Shift-ArrowLeft': () => setLayerX(-10, 'adjust'),
        'Shift-ArrowRight': () => setLayerX(10, 'adjust'),
        'Shift-ArrowUp': () => setLayerY(-10, 'adjust'),
        'Shift-ArrowDown': () => setLayerY(10, 'adjust'),
      }),
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