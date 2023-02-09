import { ReactEventHandlers } from 'noya-designsystem';
import { createRect } from 'noya-geometry';
import {
  DrawableLayerType,
  handleActionType,
  InferBlockType,
  InteractionMethod,
  InteractionState,
} from 'noya-state';
import { InteractionAPI } from './types';

export interface InsertModeActions {
  enterInsertMode: (
    layerType: DrawableLayerType,
    method: InteractionMethod,
  ) => void;
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
                frame: createRect(
                  api.getCanvasPoint(event.nativeEvent),
                  api.getCanvasPoint(event.nativeEvent),
                ),
                siblingBlocks: api.siblingBlocks,
              }),
              'keyboard',
            );
          }
        },
        onKeyDown: (event) => {
          if (isModKeyPressed(event, api.platformModKey)) {
            enterInsertMode(
              inferBlockType({
                frame: createRect(
                  api.getCanvasPoint({ offsetX: 0, offsetY: 0 }),
                  api.getCanvasPoint({ offsetX: 0, offsetY: 0 }),
                ),
                siblingBlocks: api.siblingBlocks,
              }),
              'keyboard',
            );
          }
        },
      }),
      insert: (interactionState, api) => ({
        onMouseMove: (event) => {
          if (interactionState.method === 'mouse') return;
          if (!event[api.platformModKey]) {
            reset();
          }
        },
        onKeyUp: (event) => {
          if (interactionState.method === 'mouse') return;
          if (isModKeyPressed(event, api.platformModKey)) {
            reset();
          }
        },
      }),
    });
  };
