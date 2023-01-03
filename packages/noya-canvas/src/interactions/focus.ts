import { ReactEventHandlers } from 'noya-designsystem';
import { handleActionType, InteractionState } from 'noya-state';
import { InteractionAPI } from './types';

export interface FocusActions {}

export function focusInteraction(actions: FocusActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onPointerDown: (event) => {
        if (api.selectedGradient) return;

        api.focus?.();
      },
    }),
  });
}
