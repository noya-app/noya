import { isRightButtonClicked, ReactEventHandlers } from 'noya-designsystem';
import {
  handleActionType,
  InteractionState,
  LayerHighlight,
  SelectionType,
} from 'noya-state';
import { InteractionAPI } from './types';

export interface SelectionActions {
  selectLayer: (id: string[], selectionType?: SelectionType) => void;
  highlightLayer: (highlight: LayerHighlight | undefined) => void;
  selectAllLayers: () => void;
  deleteLayer: (id: string[]) => void;
}

type MenuItemType = 'delete' | 'selectAll';

export function selectionInteraction({
  selectLayer,
  selectAllLayers,
  highlightLayer,
  deleteLayer,
}: SelectionActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers<MenuItemType>
  >({
    none: (interactionState, api) => ({
      onContributeMenuItems: () => {
        return [
          api.selectedLayerIds.length > 0 && {
            value: 'delete',
            title: 'Delete',
          },
          {
            title: 'Select All',
            value: 'selectAll',
            shortcut: 'Mod-a',
          },
        ];
      },
      onSelectMenuItem: (id) => {
        switch (id) {
          case 'delete':
            deleteLayer(api.selectedLayerIds);
            break;
          case 'selectAll':
            selectAllLayers();
            break;
        }
      },
      onPointerMove: (event) => {
        const layerId = api.getLayerIdAtPoint(
          api.getScreenPoint(event.nativeEvent),
          {
            groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
            artboards: api.isolatedLayerId
              ? 'childrenOnly'
              : 'emptyOrContainedArtboardOrChildren',
            includeLockedLayers: false,
          },
        );

        // For perf, check that we actually need to update the highlight.
        // This gets called on every mouse movement.
        if (api.highlightedLayerId !== layerId) {
          highlightLayer(
            layerId
              ? {
                  id: layerId,
                  precedence: 'belowSelection',
                  isMeasured: event.altKey,
                }
              : undefined,
          );
        }
      },
      onPointerDown: (event) => {
        const layerId = api.getLayerIdAtPoint(
          api.getScreenPoint(event.nativeEvent),
          {
            groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
            artboards: api.isolatedLayerId
              ? 'childrenOnly'
              : 'emptyOrContainedArtboardOrChildren',
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
