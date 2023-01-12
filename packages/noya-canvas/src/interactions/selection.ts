import {
  isRightButtonClicked,
  ReactEventHandlers,
  RegularMenuItem,
} from 'noya-designsystem';
import { handleActionType, InteractionState, SelectionType } from 'noya-state';
import { InteractionAPI } from './types';

export interface SelectionActions {
  selectLayer: (id: string[], selectionType?: SelectionType) => void;
  selectAllLayers: () => void;
  deleteLayer: (id: string[]) => void;
}

type MenuItemType = 'selectAll';

export function selectionInteraction({
  selectLayer,
  selectAllLayers,
  deleteLayer,
}: SelectionActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onContributeMenuItems: (): RegularMenuItem<MenuItemType>[] => {
        return [
          {
            title: 'Select All',
            value: 'selectAll',
            shortcut: 'Mod-a',
          },
        ];
      },
      onSelectMenuItem: (id) => {
        switch (id) {
          case 'selectAll':
            selectAllLayers();
            return;
        }
      },
      onPointerDown: (event) => {
        const layerId = api.getLayerIdAtPoint(
          api.getScreenPoint(event.nativeEvent),
          {
            groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
            artboards: 'emptyOrContainedArtboardOrChildren',
            includeLockedLayers: false,
          },
        );

        if (isRightButtonClicked(event)) {
          if (!layerId) {
            selectLayer([]);
          } else if (!api.selectedLayerIds.includes(layerId)) {
            selectLayer([layerId]);
          }

          event.preventDefault();

          return;
        }

        if (layerId) {
          if (api.selectedLayerIds.includes(layerId)) {
            if (event.shiftKey && api.selectedLayerIds.length !== 1) {
              selectLayer([layerId], 'difference');
            }
          } else {
            selectLayer([layerId], event.shiftKey ? 'intersection' : 'replace');
          }
        } else {
          selectLayer([]);
        }
      },
      onKeyDown: api.handleKeyboardEvent({
        Backspace: () => deleteLayer(api.selectedLayerIds),
        Delete: () => deleteLayer(api.selectedLayerIds),
      }),
    }),
  });
}
