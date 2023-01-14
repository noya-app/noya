import { ReactEventHandlers } from 'noya-designsystem';
import { createRect, Point } from 'noya-geometry';
import {
  DrawableLayerType,
  handleActionType,
  InteractionState,
} from 'noya-state';
import { InferBlockType, InteractionAPI } from './types';

export interface DrawingActions {
  enterInsertMode: (layerType: DrawableLayerType) => void;
  startDrawing: (layerType: DrawableLayerType, point: Point) => void;
  updateDrawing: (point: Point, layerType?: DrawableLayerType) => void;
  addDrawnLayer: () => void;
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
    enterInsertMode,
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
              rect: createRect(canvasPoint, canvasPoint),
            }),
            canvasPoint,
          );

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
            options.inferBlockType?.({
              rect: createRect(
                interactionState.origin,
                interactionState.current,
              ),
            }) ?? interactionState.shapeType,
          );

          api.setPointerCapture?.(event.pointerId);
          event.preventDefault();
        },
        onPointerUp: (event) => {
          const canvasPoint = api.getCanvasPoint(event.nativeEvent);

          updateDrawing(canvasPoint);
          addDrawnLayer();

          // Allow creating a new layer immediately
          if (options.allowDrawingFromNoneState && event[api.platformModKey]) {
            enterInsertMode(
              options.inferBlockType?.({
                rect: createRect(canvasPoint, canvasPoint),
              }) ?? interactionState.shapeType,
            );
          }

          api.releasePointerCapture?.(event.pointerId);
          event.preventDefault();
        },
      }),
    });
  };
