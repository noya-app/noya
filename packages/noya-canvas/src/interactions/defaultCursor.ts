import { ReactEventHandlers } from '@noya-app/noya-designsystem';
import { handleActionType, InteractionState } from 'noya-state';
import { CSSProperties } from 'react';
import { InteractionAPI } from './types';

export interface DefaultCursorActions {
  setCursor: (cursor: CSSProperties['cursor'] | undefined) => void;
}

export function defaultCursorInteraction({ setCursor }: DefaultCursorActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onPointerMove: (event) => {
        setCursor(undefined);

        event.preventDefault();
      },
    }),
  });
}
