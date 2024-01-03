import { ReactEventHandlers } from '@noya-app/noya-designsystem';
import { handleActionType, InteractionState } from 'noya-state';
import { InteractionAPI } from './types';

export interface ReorderActions {
  bringToFront: (id: string[]) => void;
  sendToBack: (id: string[]) => void;
}

type MenuItemType = 'bringToFront' | 'sendToBack';

export function reorderInteraction({
  bringToFront,
  sendToBack,
}: ReorderActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers<MenuItemType>
  >({
    none: (interactionState, api) => ({
      onContributeMenuItems: () => {
        return api.selectedLayerIds.length > 0
          ? [
              {
                value: 'bringToFront',
                title: 'Bring to Front',
                shortcut: ']',
              },
              {
                value: 'sendToBack',
                title: 'Send to back',
                shortcut: '[',
              },
            ]
          : [];
      },
      onSelectMenuItem: (id) => {
        switch (id) {
          case 'bringToFront':
            bringToFront(api.selectedLayerIds);
            break;
          case 'sendToBack':
            sendToBack(api.selectedLayerIds);
            break;
        }
      },
    }),
  });
}
