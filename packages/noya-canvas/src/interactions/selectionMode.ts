import { ReactEventHandlers } from 'noya-designsystem';
import { handleActionType, InteractionState } from 'noya-state';
import { MarqueeActions, marqueeInteraction } from './marquee';
import { InteractionAPI } from './types';

export interface SelectionModeActions extends MarqueeActions {
  enterSelectionMode: () => void;
  reset: () => void;
}

export function selectionModeInteraction(actions: SelectionModeActions) {
  const { enterSelectionMode, reset } = actions;

  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onKeyDown: api.handleKeyboardEvent({
        Shift: () => enterSelectionMode(),
      }),
      onPointerMove: (event) => {
        if (!event.shiftKey) return;

        enterSelectionMode();
        event.preventDefault();
      },
      onPointerDown: (event) => {
        if (!event.shiftKey) return;

        marqueeInteraction(actions)(
          interactionState,
          'none',
          api,
        ).onPointerDown?.(event);
      },
    }),
    selectionMode: (interactionState, api) => {
      return {
        onKeyUp: api.handleKeyboardEvent({
          Shift: () => reset(),
        }),
        onPointerMove: (event) => {
          if (event.shiftKey) return;

          reset();
          event.preventDefault();
        },
        onPointerDown: marqueeInteraction(actions)(
          interactionState,
          'none',
          api,
        ).onPointerDown,
      };
    },
    marquee: (interactionState, api) =>
      marqueeInteraction(actions)(interactionState, 'marquee', api),
  });
}
