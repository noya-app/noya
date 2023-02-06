import { ReactEventHandlers } from 'noya-designsystem';
import { createRect, Point } from 'noya-geometry';
import {
  DrawableLayerType,
  getScalingOptions,
  handleActionType,
  InferBlockType,
  InteractionState,
  ScalingOptions,
} from 'noya-state';
import { CSSProperties } from 'react';
import { InteractionAPI } from './types';

export interface DrawingActions {
  startDrawing: (layerType: DrawableLayerType, point: Point) => void;
  updateDrawing: (
    point: Point,
    options?: ScalingOptions,
    layerType?: DrawableLayerType,
  ) => void;
  addDrawnLayer: () => void;
  setCursor: (cursor: CSSProperties['cursor'] | undefined) => void;
}

export const createDrawingInteraction =
  (
    options: {
      allowDrawingFromNoneState?: boolean;
      inferBlockType?: InferBlockType;
    } = {},
  ) =>
  ({
    startDrawing,
    updateDrawing,
    addDrawnLayer,
    setCursor,
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

          startDrawing(
            options.inferBlockType({
              frame: createRect(canvasPoint, canvasPoint),
              siblingBlocks: api.siblingBlocks,
            }),
            canvasPoint,
          );

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
              frame: createRect(
                interactionState.origin,
                interactionState.current,
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
