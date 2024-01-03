import { ReactEventHandlers } from '@noya-app/noya-designsystem';
import { Point } from '@noya-app/noya-geometry';
import {
  handleActionType,
  InteractionMethod,
  InteractionState,
} from 'noya-state';
import { MarqueeActions, marqueeInteraction } from './marquee';
import { InteractionAPI } from './types';

export interface SelectionModeActions extends MarqueeActions {
  maybeMarquee: (point: Point, method: InteractionMethod) => void;
  enterSelectionMode: (method: InteractionMethod) => void;
  reset: () => void;
}

export function selectionModeInteraction(actions: SelectionModeActions) {
  const { maybeMarquee, enterSelectionMode, reset } = actions;

  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onKeyDown: api.handleKeyboardEvent({
        Shift: () => enterSelectionMode('keyboard'),
      }),
      onPointerMove: (event) => {
        if (!event.shiftKey) return;

        enterSelectionMode('keyboard');
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
          Shift: () => {
            if (interactionState.method === 'mouse') return;
            reset();
          },
        }),
        onPointerMove: (event) => {
          if (event.shiftKey) return;
          if (interactionState.method === 'mouse') return;

          reset();
          event.preventDefault();
        },
        onPointerDown: (event) => {
          maybeMarquee(api.getScreenPoint(event.nativeEvent), 'mouse');

          event.preventDefault();
        },
      };
    },
    marquee: (interactionState, api) =>
      marqueeInteraction(actions)(interactionState, 'marquee', api),
  });
}
