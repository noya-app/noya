import { ReactEventHandlers } from 'noya-designsystem';
import { Point } from 'noya-geometry';
import { KeyMap } from 'noya-keymap';
import {
  handleActionType,
  InferBlockType,
  InteractionState,
  SetNumberMode,
} from 'noya-state';
import { isMoving } from '../utils/isMoving';
import { InteractionAPI } from './types';

export interface MoveActions {
  maybeMove: (point: Point) => void;
  updateMoving: (point: Point, inferBlockType?: InferBlockType) => void;
  setLayerX: (value: number, mode: SetNumberMode) => void;
  setLayerY: (value: number, mode: SetNumberMode) => void;
  moveLayersIntoParentAtPoint: (point: Point) => void;
  reset: () => void;
  duplicateAndUpdateMoving(
    ids: string[],
    point: Point,
    inferBlockType?: InferBlockType,
  ): void;
}

export const createMoveInteraction = (
  options: {
    inferBlockType?: InferBlockType;
  } = {},
) =>
  function moveInteraction({
    maybeMove,
    updateMoving,
    setLayerX,
    setLayerY,
    moveLayersIntoParentAtPoint,
    reset,
    duplicateAndUpdateMoving,
  }: MoveActions) {
    const shortcuts: KeyMap = {
      ArrowLeft: () => setLayerX(-1, 'adjust'),
      ArrowRight: () => setLayerX(1, 'adjust'),
      ArrowUp: () => setLayerY(-1, 'adjust'),
      ArrowDown: () => setLayerY(1, 'adjust'),
      'Shift-ArrowLeft': () => setLayerX(-10, 'adjust'),
      'Shift-ArrowRight': () => setLayerX(10, 'adjust'),
      'Shift-ArrowUp': () => setLayerY(-10, 'adjust'),
      'Shift-ArrowDown': () => setLayerY(10, 'adjust'),
    };

    return handleActionType<
      InteractionState,
      [InteractionAPI],
      ReactEventHandlers
    >({
      none: (interactionState, api) => ({
        onPointerDown: (event) => {
          const screenPoint = api.getScreenPoint(event.nativeEvent);
          const canvasPoint = api.convertPoint(screenPoint, 'canvas');

          const layerId = api.getLayerIdAtPoint(screenPoint, {
            groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
            artboards: api.isolatedLayerId
              ? 'childrenOnly'
              : 'emptyOrContainedArtboardOrChildren',
            includeLockedLayers: false,
            includeLayersOutsideArtboardBounds: true,
          });

          if (layerId) {
            maybeMove(canvasPoint);

            event.preventDefault();
          }
        },
        keyboardShortcuts: shortcuts,
      }),
      selectionMode: (interactionState, api) => ({
        keyboardShortcuts: shortcuts,
      }),
      maybeMove: (interactionState, api) => ({
        onPointerMove: (event) => {
          const canvasPoint = api.getCanvasPoint(event.nativeEvent);

          const { origin } = interactionState;

          if (isMoving(canvasPoint, origin, api.zoomValue)) {
            if (event.altKey) {
              duplicateAndUpdateMoving(
                api.selectedLayerIds,
                canvasPoint,
                options.inferBlockType,
              );
            } else {
              updateMoving(canvasPoint, options.inferBlockType);
            }
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
          const canvasPoint = api.getCanvasPoint(event.nativeEvent);

          updateMoving(canvasPoint, options.inferBlockType);

          api.setPointerCapture?.(event.pointerId);
          event.preventDefault();
        },
        onPointerUp: (event) => {
          const canvasPoint = api.getCanvasPoint(event.nativeEvent);

          api.logEvent('Project - Block - Moved', {
            'Block Count': api.selectedLayerIds.length,
          });

          moveLayersIntoParentAtPoint(canvasPoint);

          reset();

          api.releasePointerCapture?.(event.pointerId);
          event.preventDefault();
        },
      }),
    });
  };

export const moveInteraction = createMoveInteraction();
