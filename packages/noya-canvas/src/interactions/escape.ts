import { ReactEventHandlers } from 'noya-designsystem';
import { handleActionType, InteractionState, SelectionType } from 'noya-state';
import { InteractionAPI } from './types';

export interface EscapeActions {
  selectLayer: (id: string[], selectionType?: SelectionType) => void;
  reset: () => void;
}

export function escapeInteraction(actions: EscapeActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      keyboardShortcuts: {
        Escape: () => {
          actions.selectLayer([]);
          actions.reset();
        },
      },
    }),
  });
}
