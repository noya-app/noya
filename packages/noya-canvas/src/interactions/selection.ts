import { ReactEventHandlers } from 'noya-designsystem';
import { InteractionState, SelectionType, stateSwitch } from 'noya-state';
import { InteractionAPI } from './types';

export interface SelectionInteractionHandlers {
  selectLayer: (id: string[], selectionType?: SelectionType) => void;
}

export function selectionInteraction({
  selectLayer,
}: SelectionInteractionHandlers) {
  return stateSwitch<InteractionState, [InteractionAPI], ReactEventHandlers>({
    none: (interactionState, api) => ({
      onPointerDown: (event) => {
        const layerId = api.getLayerIdAtPoint(
          api.getRawPoint(event.nativeEvent),
          {
            groups: event[api.modKey] ? 'childrenOnly' : 'groupOnly',
            artboards: 'emptyOrContainedArtboardOrChildren',
            includeLockedLayers: false,
          },
        );

        if (layerId) {
          event.preventDefault();

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
