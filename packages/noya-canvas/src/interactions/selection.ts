import { ReactEventHandlers } from 'noya-designsystem';
import { handleActionType, InteractionState, SelectionType } from 'noya-state';
import { InteractionAPI } from './types';

export interface SelectionActions {
  selectLayer: (id: string[], selectionType?: SelectionType) => void;
}

export function selectionInteraction({ selectLayer }: SelectionActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onPointerDown: (event) => {
        const layerId = api.getLayerIdAtPoint(
          api.getScreenPoint(event.nativeEvent),
          {
            groups: event[api.modKey] ? 'childrenOnly' : 'groupOnly',
            artboards: 'emptyOrContainedArtboardOrChildren',
            includeLockedLayers: false,
          },
        );

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
    }),
  });
}
