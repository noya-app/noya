import { ReactEventHandlers } from 'noya-designsystem';
import { createRect, Point, Rect } from 'noya-geometry';
import {
  DrawableLayerType,
  handleActionType,
  InteractionState,
} from 'noya-state';
import { InteractionAPI } from './types';

export interface DrawingActions {
  startDrawing: (layerType: DrawableLayerType, point: Point) => void;
  updateDrawing: (point: Point, layerType?: DrawableLayerType) => void;
  addDrawnLayer: () => void;
  reset: () => void;
}

export const createDrawingInteraction =
  (
    options: {
      initialState?: 'insert' | 'none';
      inferBlockType?: ({ rect }: { rect: Rect }) => DrawableLayerType;
    } = {},
  ) =>
  ({ startDrawing, updateDrawing, addDrawnLayer, reset }: DrawingActions) => {
    const initialState = options.initialState ?? 'none';

    return handleActionType<
      InteractionState,
      [InteractionAPI],
      ReactEventHandlers
    >({
      none: (interactionState, api) => ({
        onPointerDown: (event) => {
          if (initialState !== 'none') return;

          const screenPoint = api.getScreenPoint(event.nativeEvent);
          const canvasPoint = api.convertPoint(screenPoint, 'canvas');

          startDrawing(
            options.inferBlockType
              ? options.inferBlockType({
                  rect: createRect(canvasPoint, canvasPoint),
                })
              : 'rectangle',
            canvasPoint,
          );

          event.preventDefault();
        },
      }),
      insert: (interactionState, api) => ({
        onPointerDown: (event) => {
          if (initialState !== 'insert') return;

          const screenPoint = api.getScreenPoint(event.nativeEvent);
          const canvasPoint = api.convertPoint(screenPoint, 'canvas');

          startDrawing(interactionState.layerType, canvasPoint);

          event.preventDefault();
        },
      }),
      drawing: (interactionState, api) => ({
        onPointerMove: (event) => {
          const screenPoint = api.getScreenPoint(event.nativeEvent);
          const canvasPoint = api.convertPoint(screenPoint, 'canvas');

          if (options.inferBlockType) {
            updateDrawing(
              canvasPoint,
              options.inferBlockType({
                rect: createRect(
                  interactionState.origin,
                  interactionState.current,
                ),
              }),
            );
          } else {
            updateDrawing(canvasPoint, 'rectangle');
          }

          api.setPointerCapture?.(event.pointerId);
          event.preventDefault();
        },
        onPointerUp: (event) => {
          const screenPoint = api.getScreenPoint(event.nativeEvent);
          const canvasPoint = api.convertPoint(screenPoint, 'canvas');

          updateDrawing(canvasPoint);
          addDrawnLayer();

          api.releasePointerCapture?.(event.pointerId);
          event.preventDefault();
        },
      }),
    });
  };