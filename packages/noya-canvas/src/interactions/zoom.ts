import { ReactEventHandlers } from 'noya-designsystem';
import { handleActionType, InteractionState } from 'noya-state';
import { InteractionAPI } from './types';

export interface ZoomActions {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomActualSize: () => void;
}

type MenuItemType = 'zoomIn' | 'zoomOut' | 'zoomActualSize';

export function zoomInteraction({
  zoomIn,
  zoomOut,
  zoomActualSize,
}: ZoomActions) {
  const handlers = handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers<MenuItemType>
  >({
    none: (interactionState, api) => ({
      onContributeMenuItems: () => {
        return [
          {
            title: 'Zoom In',
            value: 'zoomIn',
            shortcut: 'Mod-+',
          },
          {
            title: 'Zoom Out',
            value: 'zoomOut',
            shortcut: 'Mod--',
          },
          {
            title: 'Actual Size',
            value: 'zoomActualSize',
            shortcut: 'Mod-0',
          },
        ];
      },
      onSelectMenuItem: (id) => {
        switch (id) {
          case 'zoomIn':
            zoomIn();
            break;
          case 'zoomOut':
            zoomOut();
            break;
          case 'zoomActualSize':
            zoomActualSize();
            break;
        }
      },
    }),
  });

  const result: typeof handlers = (interactionState, key, api) => {
    return {
      ...handlers(interactionState, key, api),
      onKeyDown: api.handleKeyboardEvent({
        'Mod-=': () => zoomIn(),
        'Mod--': () => zoomOut(),
        'Mod-0': () => zoomActualSize(),
      }),
    };
  };

  return result;
}
