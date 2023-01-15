import { ReactEventHandlers } from 'noya-designsystem';
import { createRect } from 'noya-geometry';
import {
  DrawableLayerType,
  handleActionType,
  InferBlockType,
  InteractionState,
} from 'noya-state';
import { InteractionAPI } from './types';

export interface InsertModeActions {
  enterInsertMode: (layerType: DrawableLayerType) => void;
  reset: () => void;
}

export const createInsertModeInteraction =
  (
    options: {
      inferBlockType?: InferBlockType;
    } = {},
  ) =>
  ({ enterInsertMode, reset }: InsertModeActions) => {
    const inferBlockType = options.inferBlockType ?? (() => 'rectangle');

    const isModKeyPressed = (
      event: React.KeyboardEvent,
      modKey: 'ctrlKey' | 'metaKey',
    ) =>
      (modKey === 'ctrlKey' && event.key === 'Control') ||
      (modKey === 'metaKey' && event.key === 'Meta');

    return handleActionType<
      InteractionState,
      [InteractionAPI],
      ReactEventHandlers
    >({
      none: (interactionState, api) => ({
        onPointerMove: (event) => {
          if (event[api.platformModKey]) {
            enterInsertMode(
              inferBlockType({
                rect: createRect(
                  api.getCanvasPoint(event.nativeEvent),
                  api.getCanvasPoint(event.nativeEvent),
                ),
              }),
            );
          }
        },
        onKeyDown: (event) => {
          if (isModKeyPressed(event, api.platformModKey)) {
            enterInsertMode(
              inferBlockType({
                rect: createRect(
                  api.getCanvasPoint({ offsetX: 0, offsetY: 0 }),
                  api.getCanvasPoint({ offsetX: 0, offsetY: 0 }),
                ),
              }),
            );
          }
        },
      }),
      insert: (interactionState, api) => ({
        onMouseMove: (event) => {
          if (!event[api.platformModKey]) {
            reset();
          }
        },
        onKeyUp: (event) => {
          if (isModKeyPressed(event, api.platformModKey)) {
            reset();
          }
        },
      }),
    });
  };