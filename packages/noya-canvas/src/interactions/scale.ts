import { ReactEventHandlers } from 'noya-designsystem';
import { Point } from 'noya-geometry';
import {
  CompassDirection,
  handleActionType,
  InteractionState,
} from 'noya-state';
import { isMoving } from '../utils/isMoving';
import { InteractionAPI } from './types';

export interface ScaleActions {
  maybeScale: (point: Point, direction: CompassDirection) => void;
  updateScaling: (point: Point) => void;
  hoverHandle: (direction: CompassDirection) => void;
  reset: () => void;
}

export function scaleInteraction({
  maybeScale,
  updateScaling,
  hoverHandle,
  reset,
}: ScaleActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onPointerDown: (event) => {
        const screenPoint = api.getScreenPoint(event.nativeEvent);
        const canvasPoint = api.convertPoint(screenPoint, 'canvas');

        const direction = api.getScaleDirectionAtPoint(canvasPoint);

        if (direction) {
          maybeScale(canvasPoint, direction);
          event.preventDefault();
        }
      },
      onPointerMove: (event) => {
        const screenPoint = api.getScreenPoint(event.nativeEvent);
        const canvasPoint = api.convertPoint(screenPoint, 'canvas');

        const direction = api.getScaleDirectionAtPoint(canvasPoint);

        if (direction) {
          hoverHandle(direction);
        }
      },
    }),
    hoverHandle: (interactionState, api) => ({
      onPointerDown: (event) => {
        const screenPoint = api.getScreenPoint(event.nativeEvent);
        const canvasPoint = api.convertPoint(screenPoint, 'canvas');

        const direction = api.getScaleDirectionAtPoint(canvasPoint);

        if (direction) {
          maybeScale(canvasPoint, direction);
          event.preventDefault();
        }
      },
      onPointerMove: (event) => {
        const screenPoint = api.getScreenPoint(event.nativeEvent);
        const canvasPoint = api.convertPoint(screenPoint, 'canvas');

        const direction = api.getScaleDirectionAtPoint(canvasPoint);

        if (direction) {
          if (direction !== interactionState.direction) {
            hoverHandle(direction);
          }
        } else {
          reset();
        }
      },
    }),
    maybeScale: (interactionState, api) => ({
      onPointerMove: (event) => {
        const screenPoint = api.getScreenPoint(event.nativeEvent);
        const canvasPoint = api.convertPoint(screenPoint, 'canvas');

        const { origin } = interactionState;

        if (isMoving(canvasPoint, origin, api.zoomValue)) {
          updateScaling(canvasPoint);
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
    scaling: (interactionState, api) => ({
      onPointerMove: (event) => {
        const screenPoint = api.getScreenPoint(event.nativeEvent);
        const canvasPoint = api.convertPoint(screenPoint, 'canvas');

        updateScaling(canvasPoint);

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
