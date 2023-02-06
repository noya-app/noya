import { ReactEventHandlers } from 'noya-designsystem';
import { Point } from 'noya-geometry';
import {
  DrawableLayerType,
  getDrawnLayerRect,
  getScalingOptions,
  handleActionType,
  InferBlockType,
  InteractionState,
  ScalingOptions,
} from 'noya-state';
import { CSSProperties } from 'react';
import { isMoving } from '../utils/isMoving';
import { InteractionAPI } from './types';

export interface DrawingActions {
  maybeDrawing: (point: Point) => void;
  startDrawing: (layerType: DrawableLayerType, point: Point) => void;
  updateDrawing: (
    point: Point,
    options?: ScalingOptions,
    layerType?: DrawableLayerType,
  ) => void;
  addDrawnLayer: () => void;
  setCursor: (cursor: CSSProperties['cursor'] | undefined) => void;
  reset: () => void;
}

export const createDrawingInteraction =
  (
    options: {
      allowDrawingFromNoneState?: boolean;
      hasMovementThreshold?: boolean;
      inferBlockType?: InferBlockType;
    } = {},
  ) =>
  ({
    maybeDrawing,
    startDrawing,
    updateDrawing,
    addDrawnLayer,
    setCursor,
    reset,
  }: DrawingActions) => {
    return handleActionType<
      InteractionState,
      [InteractionAPI],
      ReactEventHandlers
    >({
      none: (interactionState, api) => ({
        onPointerDown: (event) => {
          if (!options.allowDrawingFromNoneState) return;
          if (!options.inferBlockType) return;

          const canvasPoint = api.getCanvasPoint(event.nativeEvent);

          if (options.hasMovementThreshold) {
            maybeDrawing(canvasPoint);
          } else {
            startDrawing(
              options.inferBlockType({
                frame: getDrawnLayerRect(
                  canvasPoint,
                  canvasPoint,
                  getScalingOptions(event),
                ),
                siblingBlocks: api.siblingBlocks,
              }),
              canvasPoint,
            );
          }

          event.preventDefault();
        },
        onPointerMove: (event) => {
          if (!options.allowDrawingFromNoneState) return;

          const layerId = api.getLayerIdAtPoint(
            api.getScreenPoint(event.nativeEvent),
            {
              groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
              artboards: 'childrenOnly',
              includeLockedLayers: false,
            },
          );

          if (!layerId) {
            setCursor('crosshair');

            event.preventDefault();
          }
        },
      }),
      maybeDrawing: (interactionState, api) => ({
        onPointerMove: (event) => {
          const canvasPoint = api.getCanvasPoint(event.nativeEvent);

          if (isMoving(interactionState.origin, canvasPoint, api.zoomValue)) {
            startDrawing(
              options.inferBlockType?.({
                frame: getDrawnLayerRect(
                  canvasPoint,
                  canvasPoint,
                  getScalingOptions(event),
                ),
                siblingBlocks: api.siblingBlocks,
              }) ?? 'rectangle',
              interactionState.origin,
            );
          }
        },
        onPointerUp: (event) => {
          reset();

          event.preventDefault();
        },
      }),
      insert: (interactionState, api) => ({
        onPointerDown: (event) => {
          const canvasPoint = api.getCanvasPoint(event.nativeEvent);

          startDrawing(interactionState.layerType, canvasPoint);

          event.preventDefault();
        },
      }),
      drawing: (interactionState, api) => ({
        onPointerMove: (event) => {
          const canvasPoint = api.getCanvasPoint(event.nativeEvent);

          updateDrawing(
            canvasPoint,
            getScalingOptions(event),
            options.inferBlockType?.({
              frame: getDrawnLayerRect(
                interactionState.origin,
                interactionState.current,
                getScalingOptions(event),
              ),
              siblingBlocks: api.siblingBlocks,
            }) ?? interactionState.shapeType,
          );

          api.setPointerCapture?.(event.pointerId);
          event.preventDefault();
        },
        onPointerUp: (event) => {
          const canvasPoint = api.getCanvasPoint(event.nativeEvent);

          updateDrawing(canvasPoint, getScalingOptions(event));
          addDrawnLayer();

          api.releasePointerCapture?.(event.pointerId);
          event.preventDefault();
        },
      }),
    });
  };
